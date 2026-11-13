# Phase 5 – Issue 1: Offline Authorization and Lease Verification Report

**Repository:** `SAhil-1436/the-station-stories`  
**Execution Date:** 2026-11-13  
**Status:** **RESOLVED & VERIFIED (30/30 Tests Passed)**

---

## 1. Executive Summary & Root Cause Analysis

During the audit of the Phase 5.4 Offline-First POS PWA, critical architectural discrepancies were uncovered in the offline authorization and lease verification subsystem. Offline cash transactions were vulnerable to token rejection, key invalidation upon backend reboot, and device/cashier spoofing.

### Identified Root Causes

1. **Token Format Discrepancy (2-Part vs. 3-Part Compact JWS):**
   - *Backend:* Previously signed a raw JSON payload string and returned a 2-part string (`payloadBase64.signatureBase64`).
   - *Frontend:* The Web Crypto verification in `offlineAuth.js` expected a standard 3-part compact JWS format (`header.payload.signature`) with `RS256` in the header, attempting to verify `${headerB64}.${payloadB64}`. This caused all backend-issued leases to fail cryptographic verification on the client.

2. **Timestamp Unit Discrepancy (Epoch Seconds vs. Epoch Milliseconds):**
   - *Backend:* Previously serialized timestamps using `Instant.getEpochSecond()` (e.g., `1731490000`).
   - *Frontend:* JavaScript's `new Date(value)` treats numeric values $< 10^{11}$ as epoch milliseconds (year 1970). As a result, all valid leases were parsed as having expired in January 1970, immediately locking out cashiers.

3. **Ephemeral Key Invalidation on Backend Restart:**
   - *Backend:* `PosKeyManagementService` previously generated an in-memory RSA keypair in `@PostConstruct` on every application boot.
   - *Consequence:* Any server restart, deployment, or failover instantly invalidated all active 24-hour cashier leases cached on counter terminals, breaking offline resilience.

4. **Public Key Contract Mismatch:**
   - Backend endpoint `/api/v1/pos/auth/public-key` returned `spkiBase64`, while frontend `PosPage.jsx` checked `res.publicKey`. If `publicKey` was undefined, the terminal failed to cache the key in Dexie `appSettings`.

5. **Lax Checkout Guard in `PosCheckoutModal.jsx`:**
   - In offline cash checkout, `PosCheckoutModal.jsx` merely performed a timestamp check (`lease.expiresAt < new Date()`) without verifying cryptographic signatures, device enrollment, terminal revocation, or cashier binding.

6. **IndexedDB Key Coercion in `posDatabase.js`:**
   - `offlineAuthorization` used `cashierId` as primary key. Type differences between number (`10`) and string (`"10"`) caused lease lookups to fail or accidentally return PIN records.

---

## 2. Technical Solution & Changes Made

### 2.1 Backend Changes

#### `PosKeyManagementService.java`
- Implemented persistent server-side RSA-2048 key storage in `secrets/pos-keys/`.
- On boot, checks for `pos_private_key.der`, `pos_public_key.der`, `pos_private_key.pem`, and `pos_public_key.pem`.
- If keys exist, loads them from disk into memory; if none exist, securely generates a new 2048-bit keypair and writes DER/PEM files.
- Sets POSIX file permissions (`rw-------`) on private key files to ensure only the server process owner has read/write access.
- Added fail-safe integrity check: if one key exists but the other is missing/corrupted, it throws `IllegalStateException` rather than silently regenerating keys and invalidating active cashier leases.
- Added `signPayload(String)` returning Base64URL without padding, and `verifySignature(String, String)`.

#### `PosDeviceService.java`
- Standardized token generation in `issueOfflineLease` to RFC 7515 Compact JWS (`RS256` / `JWT`):
  - `headerBase64 = base64url({"alg":"RS256","typ":"JWT"})`
  - `payloadJson` constructed with millisecond timestamps (`issuedAtMs`, `expiresAtMs`).
  - Signed content = `headerBase64 + "." + payloadBase64`.
  - Signature = SHA256withRSA over signed content, encoded as Base64URL without padding.
  - Token = `headerBase64 + "." + payloadBase64 + "." + signatureBase64`.

#### `PosAuthController.java`
- Updated `/api/v1/pos/auth/public-key` response to provide:
  - `publicKey`: SPKI Base64 string.
  - `spkiBase64`: SPKI Base64 string.
  - `publicKeySpkiBase64`: SPKI Base64 string.
  - `pem`: Standard X.509 PEM formatted public key.
  - `algorithm`: `RSA-2048`.
  - `format`: `X.509 SPKI`.
  - `hash`: SHA-256 fingerprint hex.

#### Unit & Integration Tests:
- Created `PosKeyManagementServiceTest.java`: verifies empty directory key generation, re-instantiation reload across reboots, signature verification across restart, missing key fail-safe, and tamper resistance.
- Updated `PosDeviceServiceTest.java`: added `testIssueOfflineLeaseWithRealKeyManager` verifying real end-to-end 3-part RS256 token generation and signature verification.

---

### 2.2 Frontend Changes

#### `frontend/src/utils/offlineAuth.js`
- Complete overhaul of `verifyOfflineLease(token, spkiPublicKeyBase64, expectations)`:
  1. Validates 3-part compact JWS format (`header.payload.signature`).
  2. Enforces RS256 algorithm in decoded header.
  3. Decodes and parses payload JSON.
  4. Enforces mandatory authorization fields: `leaseId`, `deviceId`, `cashierId`, `issuedAt`, `expiresAt`.
  5. Implemented `parseTimestampMs(val)` handling epoch milliseconds, epoch seconds, and ISO strings.
  6. Rejects future-issued leases with a strict 60-second clock-drift threshold.
  7. Rejects expired leases (`now >= expiresAtMs`).
  8. Enforces device binding: case-insensitive match against expected `deviceId`.
  9. Enforces cashier binding: numeric match against expected `cashierId`.
  10. Cryptographic verification using native Web Crypto API (`crypto.subtle.verify` with `RSASSA-PKCS1-v1_5` and `SHA-256`).
- Updated `getActiveOfflineLease(deviceId, cashierId)`:
  - Verifies local terminal enrollment and checks `isRevoked: true` on `deviceRegistration`.
  - Retrieves stored lease for the given `cashierId`.
  - Retrieves server public key from `appSettings` or stored lease record.
  - Calls `verifyOfflineLease` and returns `{ active, lease, reason }`.

#### `frontend/src/db/posDatabase.js`
- `saveOfflineLease(leaseData)`: normalizes `cashierId` as number, accepts `leaseToken || token` and `publicKeySpkiBase64 || publicKey`.
- `getOfflineLease(cashierId)`: checks both numeric and string keys, filters out non-lease records (such as `'cashier_pin'`).
- `clearOfflineLeases()`: safely clears lease entries while preserving `'cashier_pin'`.

#### `frontend/src/pages/pos/PosPage.jsx`
- Updated `initDeviceAndLease()`: extracts `pubKeyRes?.publicKey || pubKeyRes?.spkiBase64 || pubKeyRes?.publicKeySpkiBase64`, saves to `posDb.appSettings` under `'pos_rsa_public_key'`, and caches issued lease into `saveOfflineLease`.

#### `frontend/src/components/pos/PosCheckoutModal.jsx`
- Integrated `getActiveOfflineLease(device.deviceId, user?.id)` before permitting offline cash checkout.
- If device is revoked, terminal unregistered, lease missing, expired, altered, or binding mismatched, immediately blocks local bill creation and surfaces descriptive error to cashier.

---

## 3. Token & API Contract Comparison

### Lease Token Structure

| Component | Format | Example |
| :--- | :--- | :--- |
| **Header** | Base64URL JSON | `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9` (`{"alg":"RS256","typ":"JWT"}`) |
| **Payload** | Base64URL JSON | `{"leaseId":"LEASE-173149...","deviceId":"DEV-A1B2C3","cashierId":10,"issuedAt":1731490000000,"expiresAt":1731576400000}` |
| **Signature**| Base64URL Binary | RSA-2048 SHA-256 signature of `Header.Payload` without padding |

### Public Key API Contract (`GET /api/v1/pos/auth/public-key`)

```json
{
  "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
  "spkiBase64": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
  "publicKeySpkiBase64": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
  "pem": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----\n",
  "algorithm": "RSA-2048",
  "format": "X.509 SPKI",
  "hash": "b2f654b0e51786c2e0bda2a5889ea4b5b4e78a63216da197824151ca1375bce3"
}
```

---

## 4. Verification Evidence & Test Results

### 4.1 Backend Service Tests (`mvn test`)
Command:
```bash
mvn test -Dtest=PosKeyManagementServiceTest,PosDeviceServiceTest,PosSyncServiceTest,BillIdempotencyTest,BillCalculationTest
```
Result:
```text
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0 -- in PosKeyManagementServiceTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0 -- in PosDeviceServiceTest
[INFO] Results: Tests run: 29, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### 4.2 Frontend Build (`npm run build`)
Command:
```bash
npm run build
```
Result:
```text
✓ 2549 modules transformed.
dist/sw.js
dist/workbox-efbd304a.js
✓ built in 4.45s
```

### 4.3 Automated Issue 1 Test Suite (`frontend/test-phase-5-issue-1.mjs`)
Command:
```bash
node test-phase-5-issue-1.mjs
```
Output:
```text
================================================================
PHASE 5 – ISSUE 1: OFFLINE LEASE & AUTH VERIFICATION TEST SUITE
================================================================

--- TEST 1: Valid Lease Acceptance ---
  ✓ Valid lease token is verified and accepted
  ✓ Payload cashier ID preserved
  ✓ Payload device ID preserved

--- TEST 2: Invalid Signature Rejection ---
  ✓ Token with corrupted signature is rejected
  ✓ Reports signature verification failure: "Cryptographic signature verification failed: token signature is invalid or altered"
  ✓ Token signed by unrecognized private key is rejected

--- TEST 3: Expired Lease Rejection ---
  ✓ Expired lease token is rejected
  ✓ Reports expiration reason: "Offline lease expired at 2026-11-13T04:59:16.380Z"

--- TEST 4: Future-Issued Lease Rejection ---
  ✓ Future-issued lease token (>60s) is rejected
  ✓ Reports clock drift reason: "Lease token not yet valid: issued in future at 2026-11-13T06:09:16.380Z (clock drift)"
  ✓ Accepts minor clock drift within 60s tolerance

--- TEST 5: Tampered Token Rejection ---
  ✓ Payload tampered after signing is rejected
  ✓ Cryptographic signature mismatch caught tampering

--- TEST 6: Cashier Binding Enforcement ---
  ✓ Lease presented for a different cashier ID is rejected
  ✓ Reports cashier mismatch: "Cashier binding mismatch: lease issued for cashier #10, but current cashier is #99"
  ✓ Cashier ID type coercion (string "10" vs number 10) matches cleanly

--- TEST 7: Device Binding Enforcement ---
  ✓ Lease presented on a different device ID is rejected
  ✓ Reports device mismatch: "Device binding mismatch: lease issued for device 'DEV-TERMINAL-01', but current device is 'DEV-OTHER-TABLET'"

--- TEST 8: Revoked Device Rejection in getActiveOfflineLease ---
  ✓ Revoked device is immediately rejected for offline checkout
  ✓ Reports revocation: "This POS terminal device has been revoked by an administrator"
  ✓ Enrolled, non-revoked device successfully verifies active lease

--- TEST 9: Missing Public Key Rejection ---
  ✓ Null public key is rejected gracefully
  ✓ Reason indicates missing public key: "Missing backend RSA public verification key"
  ✓ Malformed public key is rejected safely without crashing

--- TEST 10: Browser Refresh Dexie Preservation ---
  ✓ Lease retrieved from local store by cashier ID
  ✓ Stored lease token is identical
  ✓ Lease remains fully active and valid after retrieval from local storage

--- TEST 11: Backend Restart Keypair Persistence ---
  ✓ Public key SPKI loaded after restart matches original key

--- TEST 12: Pre-Restart Lease Verifiable Post-Restart ---
  ✓ Offline lease issued BEFORE backend reboot verifies successfully AFTER reboot
  ✓ Lease payload data intact across restart

================================================================
TEST RESULTS: 30 PASSED, 0 FAILED
================================================================
```

---

## 5. Scope Compliance Certification

- [x] **Strict Scope Adherence:** Only Offline Authorization and Offline Lease Verification were modified.
- [x] **Offline Billing Unchanged:** Calculation formulas, provisional bill generation, tax rounding, and sync queues were untouched.
- [x] **No Dependency Downgrades:** Existing React 18, Vite, Java 21, and Spring Boot 3.3.5 stacks preserved.
- [x] **No Keys in Git:** Key directory `secrets/` is protected and ignored.
- [x] **Authoritative 58mm Thermal Constraints:** Receipts remain strictly 58mm continuous roll.
