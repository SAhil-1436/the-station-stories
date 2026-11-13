/**
 * Offline Sync Engine for The Station Stories POS PWA
 * 
 * Responsibilities:
 * - Monitors online/offline connectivity and window focus.
 * - Processes queued offline bills in chronological FIFO order.
 * - Handles idempotent sync to backend /api/v1/pos/sync/bills.
 * - Updates local Dexie stores (localBills, syncQueue, syncMetadata).
 * - Applies exponential backoff with jitter on network failures.
 * - Emits reactive state updates to subscribers.
 */

import { posDb } from '../db/posDatabase';
import { syncOfflineBill } from './posApi';

class PosSyncEngine {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isSyncing = false;
    this.timerId = null;
    this.listeners = new Set();
    this.syncIntervalMs = 60000; // 60 seconds periodic sync check
    this.consecutiveFailures = 0;
  }

  /**
   * Initializes network listeners and periodic background sync
   */
  start() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    window.addEventListener('focus', this.handleFocus);

    // Initial sync check
    this.syncNow().catch(() => {});

    // Periodic timer
    if (!this.timerId) {
      this.timerId = setInterval(() => {
        if (this.isOnline && !this.isSyncing) {
          this.syncNow().catch(() => {});
        }
      }, this.syncIntervalMs);
    }
  }

  /**
   * Stops listeners and background timer
   */
  stop() {
    if (typeof window === 'undefined') return;

    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    window.removeEventListener('focus', this.handleFocus);

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  handleOnline = () => {
    this.isOnline = true;
    this.notify();
    this.syncNow().catch(() => {});
  };

  handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  handleFocus = () => {
    if (this.isOnline && !this.isSyncing) {
      this.syncNow().catch(() => {});
    }
  };

  /**
   * Subscribes a listener callback to engine state updates
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    // Call immediately with current state
    this.getStatus().then(status => callback(status)).catch(() => {});
    return () => {
      this.listeners.delete(callback);
    };
  }

  notify() {
    this.getStatus().then(status => {
      this.listeners.forEach(fn => {
        try {
          fn(status);
        } catch (e) {
          console.error('Error in sync engine listener:', e);
        }
      });
    }).catch(() => {});
  }

  /**
   * Returns current sync engine status and queue counts
   */
  async getStatus() {
    let pendingCount = 0;
    let failedCount = 0;
    let needsReviewCount = 0;
    let lastSyncAt = null;

    try {
      pendingCount = await posDb.syncQueue.where('status').equals('PENDING').count();
      failedCount = await posDb.syncQueue.where('status').equals('FAILED').count();
      needsReviewCount = await posDb.syncQueue.where('status').equals('NEEDS_REVIEW').count();
      
      const meta = await posDb.syncMetadata.get('last_sync_info');
      lastSyncAt = meta?.timestamp || null;
    } catch (e) {
      // IndexedDB might not be open yet during early startup
    }

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount,
      failedCount,
      needsReviewCount,
      totalUnsynced: pendingCount + failedCount + needsReviewCount,
      lastSyncAt,
      consecutiveFailures: this.consecutiveFailures,
    };
  }

  /**
   * Triggers an immediate synchronization pass of all pending and failed queue items
   */
  async syncNow() {
    if (!this.isOnline) {
      return { success: false, reason: 'Terminal is currently offline' };
    }
    if (this.isSyncing) {
      return { success: false, reason: 'Sync already in progress' };
    }

    this.isSyncing = true;
    this.notify();

    let syncedCount = 0;
    let errorCount = 0;

    try {
      // Fetch queue items eligible for synchronization (PENDING or FAILED with reached nextRetry)
      const now = new Date();
      const items = await posDb.syncQueue
        .where('status')
        .anyOf(['PENDING', 'FAILED'])
        .sortBy('createdAt');

      for (const item of items) {
        // Check retry backoff timestamp if FAILED
        if (item.status === 'FAILED' && item.nextRetryAt && new Date(item.nextRetryAt) > now) {
          continue;
        }

        try {
          // Mark SYNCING in IndexedDB
          await posDb.syncQueue.update(item.id, {
            status: 'SYNCING',
            updatedAt: new Date().toISOString(),
          });
          this.notify();

          const syncRequest = {
            localBillReference: item.localBillReference,
            deviceId: item.deviceId,
            billRequest: item.payload,
          };

          const response = await syncOfflineBill(syncRequest);

          if (response.status === 'SYNCED' || response.status === 'ALREADY_SYNCED') {
            const syncedAt = response.syncedAt || new Date().toISOString();

            // 1. Update syncQueue item
            await posDb.syncQueue.update(item.id, {
              status: 'SYNCED',
              syncedAt: syncedAt,
              serverBillId: response.serverBillId,
              serverBillNumber: response.serverBillNumber,
              lastError: null,
              updatedAt: new Date().toISOString(),
            });

            // 2. Update localBills item
            const localBill = await posDb.localBills
              .where('localReference')
              .equals(item.localBillReference)
              .first();

            if (localBill) {
              await posDb.localBills.update(localBill.id, {
                syncStatus: 'SYNCED',
                serverBillId: response.serverBillId,
                serverBillNumber: response.serverBillNumber,
                syncedAt: syncedAt,
              });
            }

            syncedCount++;
            this.consecutiveFailures = 0;
          } else if (response.status === 'NEEDS_REVIEW') {
            await posDb.syncQueue.update(item.id, {
              status: 'NEEDS_REVIEW',
              lastError: response.message || 'Requires manager review',
              updatedAt: new Date().toISOString(),
            });
            errorCount++;
          }
        } catch (itemErr) {
          errorCount++;
          this.consecutiveFailures++;
          const retryCount = (item.retryCount || 0) + 1;

          // Exponential backoff with jitter (max 5 minutes)
          const baseBackoffMs = Math.min(300000, 2000 * Math.pow(2, retryCount));
          const jitterMs = Math.floor(Math.random() * 1500);
          const nextRetryAt = new Date(Date.now() + baseBackoffMs + jitterMs).toISOString();

          const errorMessage = itemErr.response?.data?.message || itemErr.message || 'Network sync error';

          await posDb.syncQueue.update(item.id, {
            status: 'FAILED',
            retryCount,
            lastError: errorMessage,
            nextRetryAt,
            updatedAt: new Date().toISOString(),
          });

          // If device was revoked or 403 Forbidden, mark as NEEDS_REVIEW
          if (itemErr.response?.status === 403 || itemErr.response?.status === 409) {
            await posDb.syncQueue.update(item.id, {
              status: 'NEEDS_REVIEW',
              lastError: `Rejected by server (${itemErr.response.status}): ${errorMessage}`,
            });
          }
        }
      }

      // Record sync completion metadata
      await posDb.syncMetadata.put({
        key: 'last_sync_info',
        timestamp: new Date().toISOString(),
        syncedCount,
        errorCount,
      });

      return { success: true, syncedCount, errorCount };
    } catch (engineErr) {
      console.error('Fatal error in sync pass:', engineErr);
      return { success: false, error: engineErr.message };
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }
}

export const syncEngine = new PosSyncEngine();
export default syncEngine;
