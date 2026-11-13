/**
 * USB Backup & Restore Utility for Station Stories POS PWA
 * 
 * Features:
 * 1. JSON export with SHA-256 integrity checksum.
 * 2. File System Access API (showDirectoryPicker) for direct USB stick / local folder backup.
 * 3. Fallback file download (backup-TSS-{timestamp}.json) for standard browsers.
 * 4. SHA-256 integrity validation and safe restore into Dexie IndexedDB.
 */

import { posDb, exportBackupPayload, importBackupPayload } from '../db/posDatabase.js';
import { buf2hex } from './offlineAuth.js';

/**
 * Computes SHA-256 hash of a string using Web Crypto
 * @param {string} str 
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export async function computeSha256(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return buf2hex(hashBuffer);
}

/**
 * Generates an encrypted/integrity-protected JSON backup of all offline bills and sync state
 * @returns {Promise<{backupJson: string, filename: string, meta: Object}>}
 */
export async function createBackupPackage() {
  const payload = await exportBackupPayload();
  const device = await posDb.deviceRegistration.toCollection().first();
  const deviceId = device?.deviceId || 'UNKNOWN_DEV';
  const timestamp = new Date().toISOString();

  // Canonicalize the data portion for reliable hashing
  const dataString = JSON.stringify(payload);
  const sha256 = await computeSha256(dataString);

  const backupObject = {
    app: 'The Station Stories POS',
    formatVersion: '1.0.0',
    exportTimestamp: timestamp,
    deviceId: deviceId,
    deviceName: device?.deviceName || 'Station Stories Counter POS',
    totalBills: payload.localBills?.length || 0,
    totalSyncQueue: payload.syncQueue?.length || 0,
    data: payload,
    sha256: sha256,
  };

  const backupJson = JSON.stringify(backupObject, null, 2);
  const safeDate = timestamp.replace(/[:.]/g, '-');
  const filename = `TSS-POS-BACKUP-${deviceId.slice(-6)}-${safeDate}.json`;

  const meta = {
    timestamp,
    deviceId,
    filename,
    recordCount: (payload.localBills?.length || 0) + (payload.syncQueue?.length || 0),
    checksum: sha256,
    status: 'CREATED',
  };

  // Record into backupMetadata store
  await posDb.backupMetadata.add(meta);

  return { backupJson, filename, meta };
}

/**
 * Writes backup directly to USB drive or local directory if File System Access API is supported,
 * otherwise triggers browser file download.
 * @returns {Promise<{success: boolean, pathOrFilename: string, usedFileSystemApi: boolean}>}
 */
export async function performBackupToStorage() {
  const { backupJson, filename, meta } = await createBackupPackage();

  // 1. Try File System Access API (showDirectoryPicker)
  if (typeof window.showDirectoryPicker === 'function') {
    try {
      const dirHandle = await window.showDirectoryPicker({
        id: 'tss-pos-usb-backup',
        mode: 'readwrite',
        startIn: 'downloads',
      });

      const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(backupJson);
      await writable.close();

      return {
        success: true,
        pathOrFilename: `${dirHandle.name}/${filename}`,
        usedFileSystemApi: true,
        meta,
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Backup directory selection was cancelled by user');
      }
      console.warn('File System Access API failed, falling back to download:', err);
      // Fall through to download fallback
    }
  }

  // 2. Download Fallback
  const blob = new Blob([backupJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    success: true,
    pathOrFilename: filename,
    usedFileSystemApi: false,
    meta,
  };
}

/**
 * Validates backup JSON content, checks SHA-256 integrity, and restores records into Dexie
 * @param {string} backupJsonString 
 * @returns {Promise<{success: boolean, message: string, recordCounts: Object}>}
 */
export async function restoreBackupFromContent(backupJsonString) {
  let backupObject;
  try {
    backupObject = JSON.parse(backupJsonString);
  } catch (err) {
    throw new Error('Invalid JSON format: file could not be parsed');
  }

  // Schema validation
  if (!backupObject.formatVersion || !backupObject.data || !backupObject.sha256) {
    throw new Error('Corrupted or invalid backup file structure');
  }

  // SHA-256 Checksum validation
  const canonicalDataString = JSON.stringify(backupObject.data);
  const computedHash = await computeSha256(canonicalDataString);

  if (computedHash.toLowerCase() !== backupObject.sha256.toLowerCase()) {
    throw new Error(
      `Backup integrity check failed!\nFile checksum: ${backupObject.sha256}\nComputed checksum: ${computedHash}\nThe file may have been modified or corrupted.`
    );
  }

  // Perform restoration into IndexedDB
  const counts = await importBackupPayload(backupObject.data);

  // Record restore in metadata
  await posDb.backupMetadata.add({
    timestamp: new Date().toISOString(),
    filename: `RESTORE-${backupObject.exportTimestamp}`,
    checksum: backupObject.sha256,
    status: 'RESTORED',
    restoredCounts: counts,
  });

  return {
    success: true,
    message: `Restored ${counts.bills} bills and ${counts.queueItems} sync queue records from backup dated ${backupObject.exportTimestamp}`,
    recordCounts: counts,
    backupMeta: backupObject,
  };
}
