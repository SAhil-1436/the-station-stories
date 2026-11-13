# THE STATION STORIES — PHASE 5.4 OFFLINE-FIRST POS PWA
## Implementation & Technical Verification Report

**Repository**: `https://github.com/SAhil-1436/the-station-stories`  
**Execution Date**: November 13, 2026  
**Status**: COMPLETE & PRODUCTION READY  

---

## 1. Executive Summary

Phase 5.4 delivers a desktop-first, offline-first Progressive Web Application (PWA) for **The Station Stories** restaurant billing counter.

The terminal guarantees continuous billing operations regardless of cloud connectivity or broadband interruptions. When offline, cash transactions proceed seamlessly, generating provisional 58mm continuous roll thermal receipts, persisting encrypted financial snapshots into IndexedDB, and queuing transactions for automatic background cloud synchronization once connectivity is restored.

---

## 2. Core Architectural Pillars

### 2.1 Progressive Web App (PWA) Infrastructure
- **Engine**: Vite 5.4 + `vite-plugin-pwa` 0.21.
- **Service Worker**: Automatic update lifecycle with Workbox precaching for all core JS, CSS, and SVG assets.
- **Navigation Safety**: API endpoints (`/api/v1/admin/*`, `/api/v1/auth/*`, etc.) are explicitly excluded from the Service Worker's navigation fallback via `navigateFallbackDenylist`.
- **Runtime Caching**: Authoritative public catalog endpoints (`/api/v1/public/categories`, `/api/v1/public/menu`) are cached via `NetworkFirst` strategy (24-hour TTL, max 100 entries).
- **Web App Manifest**: Full standalone desktop window configuration with `#45213F` Royal Plum theme, `#F7F1E8` Ivory background, and dedicated maskable icons (`192x192` and `512x512`).

### 2.2 Client-Side Storage: Dexie.js (12 Schema Stores)
All local state is persisted in an IndexedDB database named `StationStoriesPosDb`:
1. `categories`: Cached restaurant menu categories with display order.
2. `menuItems`: Cached menu items with pricing, category binding, and veg/non-veg flags.
3. `customers`: Cached customer lookup and loyalty records.
4. `localBills`: Locally finalized offline bills with integer paise totals.
5. `localBillItems`: Line item snapshots created at transaction finalization.
6. `syncQueue`: Durable FIFO queue tracking transaction status (`PENDING`, `SYNCING`, `SYNCED`, `FAILED`, `NEEDS_REVIEW`).
7. `operationRecords`: Operation idempotency keys preventing local duplicate submission.
8. `deviceRegistration`: Trusted hardware enrollment record with device ID and status.
9. `offlineAuthorization`: 24-hour cryptographic lease token, server public key, and PBKDF2 PIN hashes.
10. `appSettings`: General terminal configuration tokens.
11. `backupMetadata`: Audit logs of local JSON backups and restorations.
12. `syncMetadata`: High-water marks, timestamps, and error stats of background sync passes.

### 2.3 Cryptographic Security & Offline Cashier Authentication
- **Asymmetric Lease Signing (RSA-2048)**:
  - The backend generates and holds a private RSA-2048 key (`PosKeyManagementService`).
  - While online, the cashier's terminal enrolls and receives a 24-hour signed lease (`header.payload.signature`).
  - When offline, the browser verifies the lease token using the Web Crypto API (`crypto.subtle.verify` with `RSASSA-PKCS1-v1_5` / `SHA-256`) against the backend's exported SPKI public key.
  - The lease binds the cashier ID, device ID, and issue/expiration timestamps. Expired or tampered leases are rejected immediately.
- **Cashier Security PIN (PBKDF2-SHA256)**:
  - Local security PINs are protected using Web Crypto `PBKDF2` with `SHA-256`, 100,000 iterations, and a 16-byte random salt.
  - No plaintext PINs are ever stored in IndexedDB or memory.
- **5-Minute Inactivity Auto-Lock**:
  - Global user activity listeners monitor keyboard, mouse, and touch events.
  - After 5 minutes of inactivity, the screen locks with a secure PIN entry keypad.

### 2.4 Offline Cash Checkout & Provisional References
- **Strict Cash Restriction**: When offline, UPI and Card settlements are completely disabled. Only `CASH` payments are permitted.
- **Provisional Bill References**:
  - Generated using the format: `OFF-{deviceShortId}-{YYYYMMDD}-{sequence}` (e.g. `OFF-DEV1-20261113-0001`).
  - Sequenced locally and guaranteed unique per device.
- **Immutable Item Snapshots**:
  - Each item line records the item ID, name, unit price, quantity, and notes at the moment of billing, insulating historical records from future catalog price changes.

### 2.5 Durable Sync Engine
- **Background Orchestration**: Subscribed to browser `online`/`offline` events and window `focus`, plus a 60-second periodic timer.
- **Idempotency Guarantee**: Submits transactions via `POST /api/v1/pos/sync/bills` using the `localBillReference` as the backend deduplication key.
- **Exponential Backoff with Jitter**:
  - Network failures back off exponentially: `Math.min(300000, 2000 * 2^retryCount) + jitter`.
  - Permanent rejections (e.g., revoked device 403) transition the queue item to `NEEDS_REVIEW` to preserve transaction state for manager audit.

### 2.6 Strictly 58mm Continuous Roll Thermal Receipt PDF
- **No 80mm Toggle**: Standardized strictly on 58mm continuous roll format.
- **Zero Physical Printer / Print Dialogs**: Replaced unreliable `window.print()` with direct, pixel-perfect 58mm PDF generation using `jsPDF` + `html2canvas`.
- **Dynamic Continuous Roll Height**: Calculates receipt canvas aspect ratio dynamically to output zero blank pages or clipping.
- **Offline Indicator**: Offline bills clearly render an `* OFFLINE PROVISIONAL BILL *` banner and display the provisional reference.

### 2.7 USB Backup & Restore Utility
- **SHA-256 Integrity Verification**: Backups compute an SHA-256 checksum over the canonical JSON payload before export.
- **Direct USB Directory Writing**: Uses the browser File System Access API (`showDirectoryPicker`) to write directly to USB storage, with an automatic browser download fallback.
- **Restoration Safety**: During restore, the file's SHA-256 hash is computed and verified against the embedded checksum. If any byte was modified, restoration is aborted.

---

## 3. Verification Test Results

### 3.1 Backend Unit Test Suite (100% Pass)
```
Tests run: 34, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS (1.236s)
```
- `BillIdempotencyTest`: 10 tests
- `BillOperationRegistrationServiceTest`: 8 tests
- `BillCalculationTest`: 6 tests
- `FinalizedBillProtectionTest`: 3 tests
- `PosDeviceServiceTest`: 4 tests
- `PosSyncServiceTest`: 3 tests

### 3.2 Frontend Automated Test Suite (100% Pass)
```
node test-phase-5-4-offline.mjs
TEST SUITE RESULTS: 24 PASSED, 0 FAILED
```
- PBKDF2 100k iteration PIN derivation and verification.
- SHA-256 backup package checksum generation and tamper detection.
- Provisional reference formatting and regex compliance (`^OFF-[A-Z0-9]{3,4}-\d{8}-\d{4}$`).
- Offline lease token decoding, expiration detection, and device binding.
- 58mm continuous roll receipt constraints.

### 3.3 Frontend Production Build
```
npm run build
PWA v2.0.0 (Workbox 57 precache entries generated)
dist/sw.js generated
dist/manifest.webmanifest generated
dist/assets/vendor-db-Cc8fJds4.js (99.62 kB)
✓ built in 2.15s
```

---

## 4. Deliverables Checklist

- [x] Database Migration `V5__offline_pos_and_sync.sql`
- [x] Backend `BillOperationRegistrationService` with `REQUIRES_NEW` isolation
- [x] Backend `PosKeyManagementService` (RSA-2048 signing)
- [x] Backend `PosDeviceService` & `PosSyncService`
- [x] Backend REST Controllers (`PosDeviceController`, `PosAuthController`, `PosSyncController`)
- [x] Frontend `posDatabase.js` (Dexie 12-store schema)
- [x] Frontend `offlineAuth.js` (PBKDF2 & RSA Web Crypto verification)
- [x] Frontend `backupRestore.js` (USB File System API + SHA-256)
- [x] Frontend `syncEngine.js` (FIFO queue with backoff & jitter)
- [x] Frontend UI: Sync Center, USB Backup/Restore, 5-min PIN Idle Lock
- [x] Strictly 58mm Continuous Roll PDF Generator
- [x] PWA Manifest, Service Worker, and icons configured in `vite.config.js`
- [x] All 34 backend unit tests passing
- [x] All 24 frontend offline tests passing
- [x] Zero compilation or lint errors
