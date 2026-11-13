import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { posDb } from '../../db/posDatabase';
import { hashPin, verifyPin } from '../../utils/offlineAuth';

/**
 * POS Idle Lock & Cashier PIN Unlock Screen (Phase 5.4 Offline Security)
 * 
 * Features:
 * - 5-minute inactivity auto-lock
 * - 4-to-6 digit cashier PIN unlock
 * - PBKDF2-SHA256 hash verification (100,000 iterations, 16-byte random salt)
 * - Safe initial PIN enrollment if no local PIN exists
 */
export default function PosIdleLockModal({
  isLocked,
  onUnlock,
  cashierName = 'Counter Staff',
  cashierId = null,
}) {
  const [pin, setPin] = useState('');
  const [hasStoredPin, setHasStoredPin] = useState(true);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Check if PIN has been configured in IndexedDB
  useEffect(() => {
    async function checkPinStatus() {
      try {
        const stored = await posDb.offlineAuthorization.get('cashier_pin');
        if (!stored || !stored.hashHex || !stored.saltHex) {
          setHasStoredPin(false);
          setIsSettingPin(true);
        } else {
          setHasStoredPin(true);
          setIsSettingPin(false);
        }
      } catch (err) {
        console.error('Error checking stored PIN:', err);
      }
    }
    if (isLocked) {
      setPin('');
      setConfirmPin('');
      setError(null);
      checkPinStatus();
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handleDigit = (digit) => {
    if (isSettingPin && pin.length >= 6) {
      if (confirmPin.length < 6) {
        setConfirmPin((prev) => prev + digit);
      }
      return;
    }
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (isSettingPin && confirmPin.length > 0) {
      setConfirmPin((prev) => prev.slice(0, -1));
      return;
    }
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setConfirmPin('');
    setError(null);
  };

  // Set new PIN
  const handleSaveNewPin = async () => {
    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4 to 6 digits long.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN and Confirmation PIN do not match.');
      setConfirmPin('');
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const { saltHex, hashHex } = await hashPin(pin);
      await posDb.offlineAuthorization.put({
        cashierId: 'cashier_pin',
        saltHex,
        hashHex,
        updatedAt: new Date().toISOString(),
      });
      setHasStoredPin(true);
      setIsSettingPin(false);
      onUnlock();
    } catch (err) {
      setError(err.message || 'Failed to save local security PIN.');
    } finally {
      setVerifying(false);
    }
  };

  // Verify entered PIN
  const handleVerifyPin = async () => {
    if (pin.length < 4) {
      setError('Please enter your full 4-digit PIN.');
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      const stored = await posDb.offlineAuthorization.get('cashier_pin');
      if (!stored) {
        setIsSettingPin(true);
        setVerifying(false);
        return;
      }

      const isValid = await verifyPin(pin, stored.saltHex, stored.hashHex);
      if (isValid) {
        setAttempts(0);
        onUnlock();
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setPin('');
        setError(
          nextAttempts >= 5
            ? 'Too many incorrect attempts. Please verify cashier credentials.'
            : 'Incorrect security PIN. Please try again.'
        );
      }
    } catch (err) {
      setError('Error verifying PIN: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-plum-dark/95 backdrop-blur-md animate-fadeIn"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl border border-lavender-200 shadow-2xl overflow-hidden p-6 text-center space-y-4 animate-scaleUp">
        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-3xl bg-lavender-100 border border-lavender-200 text-plum-royal flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7 text-plum-royal" />
        </div>

        <div>
          <h2 className="font-serif font-bold text-xl text-plum-royal">
            {isSettingPin ? 'Set Cashier Security PIN' : 'POS Terminal Locked'}
          </h2>
          <p className="text-xs text-body-muted mt-1">
            {isSettingPin
              ? 'Create a 4-to-6 digit local PIN to protect offline counter billing'
              : `Inactivity security lock • Cashier: ${cashierName}`}
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="py-2 space-y-2">
          {isSettingPin ? (
            <div className="space-y-2 text-left">
              <div>
                <label className="text-[11px] font-semibold text-body-muted block">Enter New PIN (4-6 digits):</label>
                <div className="flex justify-center gap-2 py-1.5 bg-lavender-50 rounded-xl border border-lavender-200">
                  {[...Array(6)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-3 h-3 rounded-full border transition-all ${
                        i < pin.length ? 'bg-plum-royal border-plum-royal' : 'bg-white border-lavender-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {pin.length >= 4 && (
                <div>
                  <label className="text-[11px] font-semibold text-body-muted block">Confirm PIN:</label>
                  <div className="flex justify-center gap-2 py-1.5 bg-lavender-50 rounded-xl border border-lavender-200">
                    {[...Array(6)].map((_, i) => (
                      <span
                        key={i}
                        className={`w-3 h-3 rounded-full border transition-all ${
                          i < confirmPin.length ? 'bg-plum-royal border-plum-royal' : 'bg-white border-lavender-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center gap-2.5 py-2">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    i < pin.length ? 'bg-plum-royal border-plum-royal scale-110' : 'bg-lavender-100 border-lavender-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-[11px] flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric Keypad (0-9, Backspace, Clear) */}
        <div className="grid grid-cols-3 gap-2 py-1 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              className="h-11 rounded-2xl bg-lavender-50 hover:bg-lavender-100 active:bg-lavender-200 text-plum-royal font-bold text-lg border border-lavender-200 shadow-xs transition-colors flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="h-11 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-semibold text-xs border border-zinc-200 transition-colors flex items-center justify-center"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-11 rounded-2xl bg-lavender-50 hover:bg-lavender-100 active:bg-lavender-200 text-plum-royal font-bold text-lg border border-lavender-200 shadow-xs transition-colors flex items-center justify-center"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-11 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-semibold text-xs border border-zinc-200 transition-colors flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isSettingPin ? (
            <button
              type="button"
              disabled={verifying || pin.length < 4 || confirmPin.length < 4}
              onClick={handleSaveNewPin}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-plum-royal hover:bg-plum-dark text-white font-semibold text-xs shadow-soft transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>Deriving Key Material...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-gold" />
                  <span>Save PIN & Unlock Terminal</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={verifying || pin.length < 4}
              onClick={handleVerifyPin}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-plum-royal hover:bg-plum-dark text-white font-semibold text-xs shadow-soft transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-gold" />
                  <span>Unlock Terminal</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
