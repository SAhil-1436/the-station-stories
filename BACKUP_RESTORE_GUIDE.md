# THE STATION STORIES — USB BACKUP & RESTORE GUIDE
## Disaster Recovery, Audit Archiving & Data Integrity Specification

**Target Systems**: POS Counter Terminals, Shift Manager Workstations  
**Document Version**: 1.0.0  

---

## 1. Overview & Data Security Principles

The Station Stories POS PWA includes a hardware-independent backup and disaster recovery utility. It allows cashiers and restaurant managers to export the complete offline state—including local bills, item snapshots, sync queues, and device metadata—directly to USB flash drives or external drives.

### Core Principles
1. **Zero Data Loss**: Ensures all offline transactions created during internet outages survive browser cache clears, accidental terminal resets, or hardware failures.
2. **Cryptographic Integrity**: Every backup file embeds a SHA-256 hash calculated over the exact canonical data payload. Any manual tampering (e.g. altering sales amounts, item quantities, or timestamps) invalidates the checksum and aborts restoration.
3. **Idempotent Merge**: Restoring an archive into IndexedDB safely merges missing records without duplicating existing bills.

---

## 2. Backup File Specification (JSON Format 1.0.0)

Every backup file is named according to the convention:
$$\text{TSS-POS-BACKUP}-\{\text{DeviceIdShort}\}-\{\text{Timestamp}\}.\text{json}$$
Example: `TSS-POS-BACKUP-AL01-2026-11-13T10-30-00-000Z.json`

### JSON Schema Structure
```json
{
  "app": "The Station Stories POS",
  "formatVersion": "1.0.0",
  "exportTimestamp": "2026-11-13T10:30:00.000Z",
  "deviceId": "DEV-410F375D",
  "deviceName": "Station Stories Counter POS",
  "totalBills": 14,
  "totalSyncQueue": 2,
  "data": {
    "localBills": [
      {
        "clientUuid": "OFF-OP-1731490000000-abc1234",
        "localReference": "OFF-AL01-20261113-0001",
        "serverBillId": null,
        "serverBillNumber": null,
        "status": "PAID",
        "syncStatus": "PENDING",
        "cashierId": 5,
        "cashierName": "Ramesh",
        "orderType": "DINE_IN",
        "cabinTableRef": "Table 2",
        "paymentMethod": "CASH",
        "subtotal": 350.00,
        "taxRate": 5.0,
        "taxAmount": 17.50,
        "payableAmount": 367.50,
        "createdAt": 1731490000000
      }
    ],
    "localBillItems": [
      {
        "clientUuid": "OFF-OP-1731490000000-abc1234",
        "menuItemId": 12,
        "name": "Paneer Roll",
        "unitPrice": 175.00,
        "quantity": 2,
        "subtotal": 350.00
      }
    ],
    "syncQueue": [
      {
        "clientUuid": "OFF-OP-1731490000000-abc1234",
        "status": "PENDING",
        "retryCount": 0,
        "createdAt": "2026-11-13T10:00:00.000Z"
      }
    ],
    "deviceRegistration": [...],
    "operationRecords": [...],
    "appSettings": [...]
  },
  "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

---

## 3. Step-by-Step Backup Procedure

1. **Insert USB Drive**: Plug an authorized FAT32/exFAT formatted USB flash drive into the POS terminal.
2. **Open Backup Modal**: In the POS header, click the **USB Backup** button.
3. **Verify Counts**: The modal displays the exact count of local bills and pending queue records to be backed up.
4. **Click Export Backup**:
   - **Direct USB Write (Chrome / Edge / Safari on macOS & Windows)**:
     The browser prompts: *"Select a folder to save the backup"*. Navigate to your USB flash drive, click **Select Folder**, and confirm permissions.
   - **Download Fallback (Other Browsers)**:
     If the File System Access API is not permitted, the file automatically downloads to your browser's default downloads folder. Move this file to the USB drive.
5. **Checksum Confirmation**: The modal displays the calculated 64-character SHA-256 hash upon completion.

---

## 4. Step-by-Step Restoration Procedure

> [!CAUTION]
> Restore operations should only be performed by authorized shift managers during disaster recovery or terminal replacement.

1. **Insert USB Drive**: Connect the drive containing the `.json` backup file.
2. **Open Modal**: Click **USB Backup** in the header and switch to the **Restore from File** tab.
3. **Select File**: Click **Browse JSON Backup File** and select the `.json` archive.
4. **Cryptographic Validation**:
   - The utility parses the JSON and reconstructs the canonical `data` string.
   - It computes the SHA-256 digest using Web Crypto:
     $$\text{ComputedHash} = \text{SHA256}(\text{JSON.stringify}(\text{backupObject.data}))$$
   - It verifies that $\text{ComputedHash} == \text{backupObject.sha256}$.
5. **Confirm Restore**:
   - If the checksum matches, the file summary is shown.
   - Click **Verify Checksum & Restore**.
   - Records are merged into IndexedDB without duplicating existing records.
6. **Sync Queued Records**: Open the **Sync Center** and click **Sync Now** to transmit restored pending bills to the server.

---

## 5. Troubleshooting & Integrity Failures

### "Backup integrity check failed: file corrupted or tampered"
- **Cause**: The SHA-256 hash of the `data` block does not match the `sha256` field in the file header.
- **Likely Reasons**:
  1. File was modified by a text editor.
  2. Transmission error or damaged USB sector.
- **Action**: Restoration is blocked. Use the latest unmodified daily backup file.

### "Aborted by user"
- **Cause**: The browser folder selection modal was closed without choosing a target directory.
- **Action**: Re-click **Export Backup** and select your USB flash drive.
