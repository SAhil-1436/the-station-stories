/**
 * Offline Authentication & Cryptographic Verification Utility
 * 
 * Provides:
 * 1. PBKDF2 PIN hashing & verification (100,000 iterations, SHA-256, 16-byte random salt).
 * 2. Web Crypto RSA-2048 offline lease token signature verification (RSASSA-PKCS1-v1_5 / SHA-256).
 * 3. 24-hour lease freshness, timestamp validation, and device/cashier binding.
 */

import { posDb, getOfflineLease, getRegisteredDevice } from '../db/posDatabase.js';

/**
 * Converts ArrayBuffer / Uint8Array to Hex string
 */
export function buf2hex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

/**
 * Converts Hex string to Uint8Array
 */
export function hex2buf(hexString) {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Converts base64 / base64url string to Uint8Array
 */
export function base64ToUint8Array(base64) {
  if (!base64 || typeof base64 !== 'string') {
    return new Uint8Array(0);
  }
  let standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (standardBase64.length % 4 !== 0) {
    standardBase64 += '=';
  }
  const binaryString = atob(standardBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Normalizes timestamps (numeric ms, numeric seconds, or ISO strings) into epoch milliseconds
 */
export function parseTimestampMs(val) {
  if (val === undefined || val === null || val === '') {
    return null;
  }
  if (typeof val === 'number') {
    // If epoch seconds (< 100 billion), convert to ms
    return val < 100000000000 ? val * 1000 : val;
  }
  if (typeof val === 'string') {
    const numeric = Number(val);
    if (!isNaN(numeric) && isFinite(numeric)) {
      return numeric < 100000000000 ? numeric * 1000 : numeric;
    }
    const parsed = Date.parse(val);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Derives a cryptographic hash from a 4-to-6 digit PIN using PBKDF2-SHA256 (100,000 iterations)
 * @param {string} pin - 4 to 6 digit numeric string
 * @param {Uint8Array} [salt] - Optional 16-byte salt (generated if not provided)
 * @returns {Promise<{saltHex: string, hashHex: string}>}
 */
export async function hashPin(pin, salt) {
  if (!pin || pin.length < 4 || pin.length > 8) {
    throw new Error('PIN must be 4 to 8 characters long');
  }

  const saltBytes = salt || crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const pinBytes = enc.encode(pin);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    pinBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return {
    saltHex: buf2hex(saltBytes),
    hashHex: buf2hex(derivedBits),
  };
}

/**
 * Verifies an entered PIN against stored salt and hash
 * @param {string} enteredPin
 * @param {string} storedSaltHex
 * @param {string} storedHashHex
 * @returns {Promise<boolean>}
 */
export async function verifyPin(enteredPin, storedSaltHex, storedHashHex) {
  if (!enteredPin || !storedSaltHex || !storedHashHex) return false;
  try {
    const saltBytes = hex2buf(storedSaltHex);
    const result = await hashPin(enteredPin, saltBytes);
    return result.hashHex.toLowerCase() === storedHashHex.toLowerCase();
  } catch (err) {
    console.error('Error verifying PIN:', err);
    return false;
  }
}

/**
 * Imports an RSA SPKI Base64 public key into Web Crypto CryptoKey
 * @param {string} spkiBase64
 * @returns {Promise<CryptoKey>}
 */
export async function importRsaPublicKey(spkiBase64) {
  if (!spkiBase64 || typeof spkiBase64 !== 'string') {
    throw new Error('Missing or invalid SPKI Base64 public key');
  }
  const binaryDer = base64ToUint8Array(spkiBase64);
  return await crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['verify']
  );
}

/**
 * Asymmetrically verifies an offline lease token issued by the backend.
 * Token format: base64(header).base64(payload).base64(signature) (compact JWS / RS256)
 * 
 * Requirements satisfied:
 * - Rejects malformed tokens or tokens with missing components.
 * - Rejects expired leases.
 * - Rejects future-issued leases (with 60-second clock drift allowance).
 * - Rejects modified / tampered tokens or invalid cryptographic signatures.
 * - Rejects mismatched device ID or mismatched cashier ID.
 * - Rejects missing required authorization fields.
 * 
 * @param {string} token - Signed lease token string (header.payload.signature)
 * @param {string} spkiPublicKeyBase64 - RSA SPKI base64 public key
 * @param {Object} [expectations] - Expected deviceId, cashierId
 * @returns {Promise<{valid: boolean, reason?: string, payload?: Object}>}
 */
export async function verifyOfflineLease(token, spkiPublicKeyBase64, expectations = {}) {
  // 1. Basic token string presence check
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Missing or invalid token string' };
  }

  // 2. Public key check
  if (!spkiPublicKeyBase64 || typeof spkiPublicKeyBase64 !== 'string' || spkiPublicKeyBase64.trim() === '') {
    return { valid: false, reason: 'Missing backend RSA public verification key' };
  }

  // 3. Format check: exactly 3 parts separated by dot
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'Malformed token: expected 3 dot-separated parts (header.payload.signature)' };
  }

  const [headerB64, payloadB64, sigB64] = parts;
  if (!headerB64 || !payloadB64 || !sigB64) {
    return { valid: false, reason: 'Malformed token: empty header, payload, or signature component' };
  }
  const signedContent = `${headerB64}.${payloadB64}`;

  // 4. Decode Header & check algorithm
  let header;
  try {
    const headerJson = new TextDecoder().decode(base64ToUint8Array(headerB64));
    header = JSON.parse(headerJson);
  } catch (err) {
    return { valid: false, reason: 'Malformed token header: unable to parse JSON' };
  }

  if (!header || header.alg !== 'RS256') {
    return { valid: false, reason: `Unsupported algorithm in token header: expected RS256, got ${header?.alg}` };
  }

  // 5. Decode Payload
  let payload;
  try {
    const payloadJson = new TextDecoder().decode(base64ToUint8Array(payloadB64));
    payload = JSON.parse(payloadJson);
  } catch (err) {
    return { valid: false, reason: 'Malformed token payload: unable to parse JSON' };
  }

  if (!payload || typeof payload !== 'object') {
    return { valid: false, reason: 'Malformed token payload: expected a JSON object' };
  }

  // 6. Validate presence of mandatory authorization fields
  const requiredFields = ['leaseId', 'deviceId', 'cashierId', 'issuedAt', 'expiresAt'];
  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      return { valid: false, reason: `Missing required lease authorization field: '${field}'`, payload };
    }
  }

  // 7. Validate Timestamps
  const now = Date.now();
  const issuedAtMs = parseTimestampMs(payload.issuedAt);
  const expiresAtMs = parseTimestampMs(payload.expiresAt);

  if (issuedAtMs === null || isNaN(issuedAtMs)) {
    return { valid: false, reason: 'Invalid issuedAt timestamp in lease payload', payload };
  }
  if (expiresAtMs === null || isNaN(expiresAtMs)) {
    return { valid: false, reason: 'Invalid expiresAt timestamp in lease payload', payload };
  }
  if (expiresAtMs <= issuedAtMs) {
    return { valid: false, reason: 'Invalid lease lifetime: expiresAt must be strictly greater than issuedAt', payload };
  }

  // Future-issued rejection (with 60-second drift tolerance)
  if (issuedAtMs > now + 60000) {
    return {
      valid: false,
      reason: `Lease token not yet valid: issued in future at ${new Date(issuedAtMs).toISOString()} (clock drift)`,
      payload,
    };
  }

  // Expiration rejection
  if (now >= expiresAtMs) {
    return {
      valid: false,
      reason: `Offline lease expired at ${new Date(expiresAtMs).toISOString()}`,
      payload,
    };
  }

  // 8. Enforce Device Binding
  if (expectations.deviceId) {
    const expDev = String(expectations.deviceId).trim().toUpperCase();
    const actDev = String(payload.deviceId).trim().toUpperCase();
    if (actDev !== expDev) {
      return {
        valid: false,
        reason: `Device binding mismatch: lease issued for device '${payload.deviceId}', but current device is '${expectations.deviceId}'`,
        payload,
      };
    }
  }

  // 9. Enforce Cashier Binding
  if (expectations.cashierId !== undefined && expectations.cashierId !== null) {
    if (Number(payload.cashierId) !== Number(expectations.cashierId)) {
      return {
        valid: false,
        reason: `Cashier binding mismatch: lease issued for cashier #${payload.cashierId}, but current cashier is #${expectations.cashierId}`,
        payload,
      };
    }
  }

  // 10. Cryptographic RSA Signature Verification via Web Crypto
  try {
    const cryptoKey = await importRsaPublicKey(spkiPublicKeyBase64);
    const enc = new TextEncoder();
    const dataBytes = enc.encode(signedContent);
    const signatureBytes = base64ToUint8Array(sigB64);

    if (signatureBytes.length === 0) {
      return { valid: false, reason: 'Invalid or empty signature bytes', payload };
    }

    const isVerified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      signatureBytes,
      dataBytes
    );

    if (!isVerified) {
      return { valid: false, reason: 'Cryptographic signature verification failed: token signature is invalid or altered', payload };
    }

    return { valid: true, payload };
  } catch (err) {
    console.warn('RSA signature verification rejected:', err?.message || err);
    return { valid: false, reason: `Cryptographic verification error: ${err.message}`, payload };
  }
}

/**
 * Checks local Dexie database for an active, valid offline lease for the current device and cashier.
 * Retrieves the stored lease and server public key, and runs verifyOfflineLease.
 * 
 * @param {string} deviceId
 * @param {number|string} cashierId
 * @returns {Promise<{active: boolean, lease?: Object, reason?: string}>}
 */
export async function getActiveOfflineLease(deviceId, cashierId) {
  try {
    // 0. Verify local device enrollment & revocation status
    const regDevice = await getRegisteredDevice();
    if (!regDevice) {
      return { active: false, reason: 'Terminal is not enrolled as a registered POS device' };
    }
    if (regDevice.isRevoked) {
      return { active: false, reason: 'This POS terminal device has been revoked by an administrator' };
    }
    const targetDeviceId = deviceId || regDevice.deviceId;
    if (deviceId && regDevice.deviceId && regDevice.deviceId.toUpperCase() !== deviceId.toUpperCase()) {
      return {
        active: false,
        reason: `Enrolled device mismatch: terminal is registered as '${regDevice.deviceId}', but checked with '${deviceId}'`,
      };
    }

    // 1. Fetch lease record by cashierId
    const leaseRecord = await getOfflineLease(cashierId);
    if (!leaseRecord || !leaseRecord.leaseToken) {
      return { active: false, reason: 'No offline lease stored on device for current cashier' };
    }

    // 2. Fetch server public verification key from appSettings or stored lease record
    let pubKey = (await posDb.appSettings.get('pos_rsa_public_key'))?.value;
    if (!pubKey && leaseRecord.publicKeySpkiBase64) {
      pubKey = leaseRecord.publicKeySpkiBase64;
    }
    if (!pubKey) {
      return { active: false, reason: 'No server public verification key cached on terminal' };
    }

    // 3. Cryptographically verify lease and enforce device/cashier binding
    const verification = await verifyOfflineLease(
      leaseRecord.leaseToken,
      pubKey,
      { deviceId: targetDeviceId, cashierId }
    );

    return {
      active: verification.valid,
      lease: verification.payload,
      reason: verification.reason,
    };
  } catch (err) {
    console.error('Error checking active offline lease:', err);
    return { active: false, reason: err.message };
  }
}
