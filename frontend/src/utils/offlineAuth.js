/**
 * Offline Authentication & Cryptographic Verification Utility
 * 
 * Provides:
 * 1. PBKDF2 PIN hashing & verification (100,000 iterations, SHA-256, 16-byte random salt).
 * 2. Web Crypto RSA-2048 offline lease token signature verification (RSASSA-PKCS1-v1_5 / SHA-256).
 * 3. 24-hour lease freshness and device/cashier binding validation.
 */

import { posDb } from '../db/posDatabase.js';

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
 * Asymmetrically verifies an offline lease token issued by the backend
 * Token format: base64(header).base64(payload).base64(signature)
 * 
 * @param {string} token - Signed lease token string
 * @param {string} spkiPublicKeyBase64 - RSA SPKI base64 public key
 * @param {Object} [expectations] - Expected deviceId, cashierId
 * @returns {Promise<{valid: boolean, reason?: string, payload?: Object}>}
 */
export async function verifyOfflineLease(token, spkiPublicKeyBase64, expectations = {}) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Missing or invalid token string' };
  }
  if (!spkiPublicKeyBase64) {
    return { valid: false, reason: 'Missing backend RSA public verification key' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'Malformed token: expected header.payload.signature' };
  }

  const [headerB64, payloadB64, sigB64] = parts;
  const signedContent = `${headerB64}.${payloadB64}`;

  // 1. Decode & parse payload
  let payload;
  try {
    const payloadJson = new TextDecoder().decode(base64ToUint8Array(payloadB64));
    payload = JSON.parse(payloadJson);
  } catch (err) {
    return { valid: false, reason: 'Failed to decode token payload JSON' };
  }

  // 2. Validate expiration (24 hour freshness)
  const now = Date.now();
  const expiresAt = new Date(payload.expiresAt).getTime();
  if (isNaN(expiresAt) || now > expiresAt) {
    return { valid: false, reason: `Offline lease expired at ${payload.expiresAt}`, payload };
  }

  // 3. Validate issuedAt not in the future (with 5-minute clock drift tolerance)
  const issuedAt = new Date(payload.issuedAt).getTime();
  if (!isNaN(issuedAt) && issuedAt > now + 300000) {
    return { valid: false, reason: 'Token issued in future; check system clock', payload };
  }

  // 4. Validate device ID match if expected
  if (expectations.deviceId && payload.deviceId !== expectations.deviceId) {
    return {
      valid: false,
      reason: `Device mismatch: token issued for ${payload.deviceId}, current device is ${expectations.deviceId}`,
      payload,
    };
  }

  // 5. Validate cashier ID match if expected
  if (expectations.cashierId && Number(payload.cashierId) !== Number(expectations.cashierId)) {
    return {
      valid: false,
      reason: `Cashier mismatch: token issued for cashier #${payload.cashierId}, current cashier is #${expectations.cashierId}`,
      payload,
    };
  }

  // 6. Cryptographic signature verification using Web Crypto
  try {
    const cryptoKey = await importRsaPublicKey(spkiPublicKeyBase64);
    const enc = new TextEncoder();
    const dataBytes = enc.encode(signedContent);
    const signatureBytes = base64ToUint8Array(sigB64);

    const isVerified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      signatureBytes,
      dataBytes
    );

    if (!isVerified) {
      return { valid: false, reason: 'Cryptographic signature verification failed', payload };
    }

    return { valid: true, payload };
  } catch (err) {
    console.error('RSA signature verification error:', err);
    return { valid: false, reason: `Verification error: ${err.message}`, payload };
  }
}

/**
 * Checks local Dexie database for an active, valid offline lease for the current device and cashier
 * @param {string} deviceId
 * @param {number|string} cashierId
 * @returns {Promise<{active: boolean, lease?: Object, reason?: string}>}
 */
export async function getActiveOfflineLease(deviceId, cashierId) {
  try {
    const activeLeaseRecord = await posDb.offlineAuthorization.get('current_lease');
    if (!activeLeaseRecord || !activeLeaseRecord.token) {
      return { active: false, reason: 'No offline lease stored on device' };
    }

    const pubKeyRecord = await posDb.appSettings.get('pos_rsa_public_key');
    if (!pubKeyRecord || !pubKeyRecord.value) {
      return { active: false, reason: 'No server public key cached' };
    }

    const verification = await verifyOfflineLease(
      activeLeaseRecord.token,
      pubKeyRecord.value,
      { deviceId, cashierId }
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
