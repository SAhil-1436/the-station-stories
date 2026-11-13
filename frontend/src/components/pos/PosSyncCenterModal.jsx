import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { posDb } from '../../db/posDatabase';
import syncEngine from '../../services/syncEngine';

/**
 * POS Synchronization Center Modal
 * Displays real-time offline sync status, queue inspection, and manual sync triggers.
 */
export default function PosSyncCenterModal({ isOpen, onClose }) {
  const [syncStatus, setSyncStatus] = useState({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    needsReviewCount: 0,
    totalUnsynced: 0,
    lastSyncAt: null,
  });
  const [queueItems, setQueueItems] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Load sync queue details from Dexie
  const loadQueue = async () => {
    setLoadingQueue(true);
    try {
      const items = await posDb.syncQueue.orderBy('createdAt').reverse().limit(30).toArray();
      setQueueItems(items);
    } catch (err) {
      console.error('Error loading sync queue:', err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = syncEngine.subscribe((status) => {
        setSyncStatus(status);
        loadQueue();
      });
      loadQueue();
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setActionFeedback(null);
    const result = await syncEngine.syncNow();
    if (result.success) {
      setActionFeedback(`Sync complete: ${result.syncedCount} synchronized, ${result.errorCount} failed.`);
    } else {
      setActionFeedback(`Sync failed: ${result.reason || result.error}`);
    }
    loadQueue();
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Never';
    try {
      return new Date(ts).toLocaleTimeString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return ts;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-plum-dark/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-lavender-200 bg-lavender-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-plum-royal text-gold flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-plum-royal flex items-center gap-2">
                Offline Sync Center
                {syncStatus.isOnline ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    <WifiOff className="w-3 h-3 text-amber-700" />
                    Offline Mode
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-body-muted">
                Durable FIFO sync queue & background synchronization
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-body-muted hover:text-plum-royal hover:bg-lavender-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-lavender-50/30 text-xs">
          {/* Status Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-lavender-200 shadow-xs">
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">Unsynced Bills</span>
              <span className="text-xl font-bold font-mono text-plum-royal">
                {syncStatus.pendingCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-lavender-200 shadow-xs">
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">Retry Failures</span>
              <span className={`text-xl font-bold font-mono ${syncStatus.failedCount > 0 ? 'text-red-600' : 'text-body'}`}>
                {syncStatus.failedCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-lavender-200 shadow-xs">
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">Needs Review</span>
              <span className={`text-xl font-bold font-mono ${syncStatus.needsReviewCount > 0 ? 'text-amber-600' : 'text-body'}`}>
                {syncStatus.needsReviewCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-lavender-200 shadow-xs">
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">Last Sync Pass</span>
              <span className="text-[11px] font-semibold text-body truncate block">
                {syncStatus.lastSyncAt ? formatTimestamp(syncStatus.lastSyncAt) : 'None'}
              </span>
            </div>
          </div>

          {/* Action & Feedback Banner */}
          <div className="p-4 rounded-2xl bg-white border border-lavender-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-plum-royal text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>Synchronize Pending Records</span>
              </div>
              <p className="text-[11px] text-body-muted mt-0.5">
                {syncStatus.isOnline
                  ? 'Terminal is connected. Queued offline bills sync automatically in background.'
                  : 'Terminal is offline. Bills are safely preserved in IndexedDB and will sync upon reconnection.'}
              </p>
            </div>

            <button
              type="button"
              disabled={syncStatus.isSyncing || !syncStatus.isOnline}
              onClick={handleSyncNow}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all disabled:opacity-50 active:scale-95 shrink-0"
            >
              {syncStatus.isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-gold" />
                  <span>Sync Now</span>
                </>
              )}
            </button>
          </div>

          {actionFeedback && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
              {actionFeedback}
            </div>
          )}

          {/* Sync Queue Table */}
          <div className="rounded-2xl bg-white border border-lavender-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-lavender-50/70 border-b border-lavender-200 flex justify-between items-center">
              <span className="font-semibold text-plum-royal">Durable Sync Queue ({queueItems.length})</span>
              <button
                type="button"
                onClick={loadQueue}
                className="text-body-muted hover:text-plum-royal transition-colors p-1"
                title="Refresh Queue View"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-lavender-100">
              {queueItems.length === 0 ? (
                <div className="p-8 text-center text-body-muted">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold">All bills synchronized!</p>
                  <p className="text-[11px]">No pending records in local queue.</p>
                </div>
              ) : (
                queueItems.map((item) => (
                  <div key={item.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-lavender-50/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-plum-royal text-xs">
                          {item.localBillReference || item.clientUuid}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'SYNCED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'SYNCING'
                              ? 'bg-blue-100 text-blue-800'
                              : item.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : item.status === 'NEEDS_REVIEW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-body-muted flex items-center gap-3">
                        <span>Created: {formatTimestamp(item.createdAt)}</span>
                        {item.retryCount > 0 && <span>Retries: {item.retryCount}</span>}
                        {item.serverBillNumber && (
                          <span className="font-mono text-emerald-700 font-semibold">
                            Server: {item.serverBillNumber}
                          </span>
                        )}
                      </div>
                      {item.lastError && (
                        <div className="text-[10.5px] text-red-700 font-medium">
                          Error: {item.lastError}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-lavender-50/70 border-t border-lavender-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
