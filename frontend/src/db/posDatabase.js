import Dexie from 'dexie';

/**
 * Station Stories POS IndexedDB Database (Dexie.js)
 * Phase 5.4: Offline-First POS PWA Local Storage Engine
 */
export const db = new Dexie('StationStoriesPosDb');

// Version 1 Schema Definition
db.version(1).stores({
  categories: 'id, name, displayOrder, active',
  menuItems: 'id, categoryId, name, price, veg, available',
  customers: 'id, phone, name, loyaltyPoints',
  localBills: '++id, clientUuid, localReference, serverBillId, serverBillNumber, status, syncStatus, cashierId, deviceId, createdAt',
  localBillItems: '++id, localBillId, clientUuid, menuItemId, name, unitPrice, quantity, subtotal',
  syncQueue: '++id, clientUuid, entityType, action, status, retryCount, nextRetryAt, createdAt',
  operationRecords: 'operationKey, cashierId, status, clientUuid, createdAt',
  deviceRegistration: 'deviceId, deviceName, registeredAt, isRevoked',
  offlineAuthorization: 'cashierId, deviceId, expiresAt',
  appSettings: 'key, updatedAt',
  backupMetadata: '++id, filename, checksum, createdAt',
  syncMetadata: 'key, lastSyncAt',
});

// =============================================================================
// CATALOG CACHING
// =============================================================================

export async function cacheCatalog(categories = [], menuItems = []) {
  return await db.transaction('rw', db.categories, db.menuItems, db.syncMetadata, async () => {
    await db.categories.clear();
    await db.menuItems.clear();

    if (categories.length > 0) {
      await db.categories.bulkAdd(categories);
    }
    if (menuItems.length > 0) {
      await db.menuItems.bulkAdd(menuItems);
    }

    await db.syncMetadata.put({
      key: 'catalog',
      lastSyncAt: Date.now(),
      categoryCount: categories.length,
      itemCount: menuItems.length,
    });
  });
}

export async function getCachedCatalog() {
  const [categories, menuItems, meta] = await Promise.all([
    db.categories.orderBy('displayOrder').toArray(),
    db.menuItems.toArray(),
    db.syncMetadata.get('catalog'),
  ]);

  return {
    categories,
    menuItems,
    lastSyncAt: meta ? meta.lastSyncAt : null,
    isCached: categories.length > 0 || menuItems.length > 0,
  };
}

// =============================================================================
// LOCAL BILL CREATION & PERSISTENCE
// =============================================================================

/**
 * Generates a provisional offline bill reference: OFF-{deviceShortId}-{YYYYMMDD}-{sequence}
 */
export async function generateProvisionalReference(deviceShortId = 'DEV') {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await db.localBills
    .filter(b => b.localReference && b.localReference.includes(dateStr))
    .count();
  const seq = String(countToday + 1).padStart(4, '0');
  const cleanDevice = (deviceShortId || 'DEV').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  return `OFF-${cleanDevice}-${dateStr}-${seq}`;
}

/**
 * Persists a locally created cash bill with immutable item snapshots and queues it for sync
 */
export async function createLocalBill(billPayload) {
  const clientUuid = billPayload.clientUuid || `OFF-OP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const localReference = billPayload.localReference || await generateProvisionalReference(billPayload.deviceId);
  const now = Date.now();

  const billRecord = {
    clientUuid,
    localReference,
    serverBillId: null,
    serverBillNumber: null,
    status: 'PAID',
    syncStatus: 'PENDING',
    cashierId: billPayload.cashierId || null,
    cashierName: billPayload.cashierName || 'Counter Staff',
    deviceId: billPayload.deviceId || null,
    orderType: billPayload.orderType || 'DINE_IN',
    cabinTableRef: billPayload.cabinTableRef || null,
    customerName: billPayload.customerName || 'Walk-in Customer',
    customerPhone: billPayload.customerPhone || null,
    paymentMethod: billPayload.paymentMethod || 'CASH',
    subtotal: billPayload.subtotal,
    discountAmount: billPayload.discountAmount || 0,
    taxRate: billPayload.taxRate || 0,
    totalTax: billPayload.totalTax || 0,
    grandTotal: billPayload.grandTotal,
    cashTendered: billPayload.cashTendered || billPayload.grandTotal,
    changeAmount: billPayload.changeAmount || 0,
    notes: billPayload.notes || null,
    isOfflineCreated: true,
    createdAt: now,
    syncedAt: null,
  };

  return await db.transaction('rw', db.localBills, db.localBillItems, db.syncQueue, db.operationRecords, async () => {
    const localBillId = await db.localBills.add(billRecord);

    const itemsToSave = (billPayload.items || []).map(item => ({
      localBillId,
      clientUuid,
      menuItemId: item.menuItemId || item.id,
      name: item.name,
      unitPrice: Number(item.unitPrice || item.price || 0),
      quantity: item.quantity || 1,
      subtotal: Number(item.subtotal || ((item.unitPrice || item.price || 0) * (item.quantity || 1))),
      notes: item.notes || null,
    }));

    if (itemsToSave.length > 0) {
      await db.localBillItems.bulkAdd(itemsToSave);
    }

    // Add to durable sync queue
    await db.syncQueue.add({
      clientUuid,
      entityType: 'BILL',
      action: 'CREATE',
      status: 'PENDING',
      retryCount: 0,
      nextRetryAt: now,
      error: null,
      createdAt: now,
      updatedAt: now,
    });

    // Record local operation
    await db.operationRecords.put({
      operationKey: clientUuid,
      cashierId: billPayload.cashierId,
      status: 'PROCESSING',
      clientUuid,
      createdAt: now,
    });

    return {
      ...billRecord,
      id: localBillId,
      items: itemsToSave,
    };
  });
}

export async function getLocalBills(limit = 50) {
  const bills = await db.localBills.orderBy('createdAt').reverse().limit(limit).toArray();
  // Fetch items for each bill
  for (const bill of bills) {
    bill.items = await db.localBillItems.where('clientUuid').equals(bill.clientUuid).toArray();
  }
  return bills;
}

export async function getLocalBillByUuid(clientUuid) {
  const bill = await db.localBills.where('clientUuid').equals(clientUuid).first();
  if (bill) {
    bill.items = await db.localBillItems.where('clientUuid').equals(clientUuid).toArray();
  }
  return bill;
}

export async function updateLocalBillSyncSuccess(clientUuid, serverBillId, serverBillNumber, syncedAt = Date.now()) {
  return await db.transaction('rw', db.localBills, db.syncQueue, db.operationRecords, async () => {
    await db.localBills.where('clientUuid').equals(clientUuid).modify({
      syncStatus: 'SYNCED',
      serverBillId,
      serverBillNumber,
      syncedAt,
    });

    await db.syncQueue.where('clientUuid').equals(clientUuid).modify({
      status: 'SYNCED',
      updatedAt: Date.now(),
      error: null,
    });

    await db.operationRecords.where('operationKey').equals(clientUuid).modify({
      status: 'SUCCEEDED',
    });
  });
}

export async function updateLocalBillSyncFailure(clientUuid, errorMessage, isNeedsReview = false) {
  const status = isNeedsReview ? 'NEEDS_REVIEW' : 'FAILED';
  return await db.transaction('rw', db.localBills, db.syncQueue, db.operationRecords, async () => {
    await db.localBills.where('clientUuid').equals(clientUuid).modify({
      syncStatus: status,
    });

    await db.syncQueue.where('clientUuid').equals(clientUuid).modify(item => {
      item.status = status;
      item.retryCount = (item.retryCount || 0) + 1;
      item.error = errorMessage;
      item.updatedAt = Date.now();
      // Exponential backoff: min(60s, 2^retryCount * 2s) + jitter
      const backoffSec = Math.min(60, Math.pow(2, item.retryCount) * 2) + Math.random();
      item.nextRetryAt = Date.now() + (backoffSec * 1000);
    });

    await db.operationRecords.where('operationKey').equals(clientUuid).modify({
      status: isNeedsReview ? 'NEEDS_REVIEW' : 'DEFINITIVELY_FAILED',
    });
  });
}

// =============================================================================
// SYNC QUEUE MANAGEMENT
// =============================================================================

export async function getPendingSyncQueue() {
  const now = Date.now();
  return await db.syncQueue
    .where('status')
    .equals('PENDING')
    .filter(item => !item.nextRetryAt || item.nextRetryAt <= now)
    .toArray();
}

export async function getSyncStats() {
  const allQueue = await db.syncQueue.toArray();
  return {
    total: allQueue.length,
    pending: allQueue.filter(i => i.status === 'PENDING').length,
    syncing: allQueue.filter(i => i.status === 'SYNCING').length,
    synced: allQueue.filter(i => i.status === 'SYNCED').length,
    failed: allQueue.filter(i => i.status === 'FAILED').length,
    needsReview: allQueue.filter(i => i.status === 'NEEDS_REVIEW').length,
  };
}

// =============================================================================
// DEVICE REGISTRATION & OFFLINE LEASE
// =============================================================================

export async function saveDeviceRegistration(deviceData) {
  await db.deviceRegistration.clear();
  return await db.deviceRegistration.put({
    deviceId: deviceData.deviceId,
    deviceName: deviceData.deviceName,
    registeredAt: deviceData.createdAt || Date.now(),
    isRevoked: Boolean(deviceData.isRevoked),
  });
}

export async function getRegisteredDevice() {
  return await db.deviceRegistration.toCollection().first();
}

export async function saveOfflineLease(leaseData) {
  const normalizedCashierId = !isNaN(Number(leaseData.cashierId)) ? Number(leaseData.cashierId) : leaseData.cashierId;
  return await db.offlineAuthorization.put({
    cashierId: normalizedCashierId,
    deviceId: leaseData.deviceId,
    cashierUsername: leaseData.cashierUsername,
    cashierFullName: leaseData.cashierFullName,
    leaseToken: leaseData.leaseToken || leaseData.token,
    publicKeySpkiBase64: leaseData.publicKeySpkiBase64 || leaseData.publicKey,
    issuedAt: leaseData.issuedAt,
    expiresAt: leaseData.expiresAt,
    pinHash: leaseData.pinHash || null,
    pinSalt: leaseData.pinSalt || null,
    cachedAt: Date.now(),
  });
}

export async function getOfflineLease(cashierId) {
  if (cashierId !== undefined && cashierId !== null) {
    const numId = Number(cashierId);
    let lease = !isNaN(numId) ? await db.offlineAuthorization.get(numId) : null;
    if (!lease) {
      lease = await db.offlineAuthorization.get(String(cashierId));
    }
    if (lease && lease.leaseToken) return lease;
  }
  return await db.offlineAuthorization.filter(item => Boolean(item.leaseToken)).first();
}

export async function clearOfflineLeases() {
  return await db.offlineAuthorization.filter(item => item.cashierId !== 'cashier_pin').delete();
}

// =============================================================================
// BACKUP & RESTORE DATA EXTRACTION
// =============================================================================

export async function exportAllLocalData() {
  const [bills, items, queue, devices, settings, meta] = await Promise.all([
    db.localBills.toArray(),
    db.localBillItems.toArray(),
    db.syncQueue.toArray(),
    db.deviceRegistration.toArray(),
    db.appSettings.toArray(),
    db.syncMetadata.toArray(),
  ]);

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    bills,
    items,
    queue,
    devices,
    settings,
    metadata: meta,
  };
}

export async function importLocalData(backupJson) {
  if (!backupJson || (!backupJson.bills && !backupJson.localBills)) {
    throw new Error('Invalid backup data format: missing bills array');
  }

  const bills = backupJson.localBills || backupJson.bills || [];
  const items = backupJson.localBillItems || backupJson.items || [];
  const queue = backupJson.syncQueue || backupJson.queue || [];

  return await db.transaction('rw', db.localBills, db.localBillItems, db.syncQueue, async () => {
    for (const b of bills) {
      const exists = await db.localBills.where('clientUuid').equals(b.clientUuid).first();
      if (!exists) {
        delete b.id; // Allow new autoincrement ID
        await db.localBills.add(b);
      }
    }

    for (const it of items) {
      const exists = await db.localBillItems
        .where('clientUuid').equals(it.clientUuid)
        .filter(x => x.menuItemId === it.menuItemId && x.quantity === it.quantity)
        .first();
      if (!exists) {
        delete it.id;
        await db.localBillItems.add(it);
      }
    }

    for (const q of queue) {
      const exists = await db.syncQueue.where('clientUuid').equals(q.clientUuid).first();
      if (!exists) {
        delete q.id;
        await db.syncQueue.add(q);
      }
    }

    return { bills: bills.length, queueItems: queue.length };
  });
}

// Aliases for backupRestore.js
export const exportBackupPayload = async () => {
  const [localBills, localBillItems, syncQueue, operationRecords, deviceRegistration, appSettings, syncMetadata] = await Promise.all([
    db.localBills.toArray(),
    db.localBillItems.toArray(),
    db.syncQueue.toArray(),
    db.operationRecords.toArray(),
    db.deviceRegistration.toArray(),
    db.appSettings.toArray(),
    db.syncMetadata.toArray(),
  ]);
  return {
    localBills,
    localBillItems,
    syncQueue,
    operationRecords,
    deviceRegistration,
    appSettings,
    syncMetadata,
  };
};

export const importBackupPayload = importLocalData;
export const posDb = db;
export default db;

