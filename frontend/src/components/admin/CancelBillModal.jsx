import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react';
import { cancelBill } from '../../services/adminApi.js';

export default function CancelBillModal({
  isOpen,
  onClose,
  bill = null,
  onCancelled,
}) {
  const [cancellationReason, setCancellationReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('0.00');
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCancellationReason('');
    setRefundAmount('0.00'); // Never default to full bill total per security rule
    setHasConfirmed(false);
    setErrors({});
    setApiError(null);
  }, [bill, isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !bill) return null;

  const grandTotal = Number(bill.grandTotal || 0);

  const validate = () => {
    const newErrors = {};

    if (!cancellationReason || !cancellationReason.trim()) {
      newErrors.reason = 'Cancellation reason is mandatory for compliance auditing';
    } else if (cancellationReason.trim().length < 5) {
      newErrors.reason = 'Please provide an adequate explanation (at least 5 characters)';
    }

    const refund = parseFloat(refundAmount);
    if (isNaN(refund) || refund < 0) {
      newErrors.refund = 'Refund amount cannot be negative';
    } else if (refund > grandTotal) {
      newErrors.refund = `Refund amount (₹${refund.toFixed(2)}) cannot exceed original grand total (₹${grandTotal.toFixed(2)})`;
    }

    if (!hasConfirmed) {
      newErrors.confirmation = 'You must explicitly confirm before submitting cancellation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        cancellationReason: cancellationReason.trim(),
        refundAmount: parseFloat(refundAmount) || 0,
      };

      const updated = await cancelBill(bill.id, payload);
      onCancelled(updated);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to cancel bill. Please check inputs and try again.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-dark/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-red-200 shadow-luxury overflow-hidden animate-scaleUp max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-lavender-200 bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-300 text-red-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-plum-royal">
                Authoritative Bill Cancellation
              </h3>
              <p className="text-xs text-body-muted">
                Bill #{bill.billNumber} &bull; Total ₹{grandTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-body-muted hover:text-plum-royal hover:bg-lavender-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          {apiError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Cancellation Rejected by Server</p>
                <p className="mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          {/* Bill Snapshot Summary Card */}
          <div className="p-4 rounded-2xl bg-ivory-50 border border-lavender-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-body-muted">Customer:</span>
              <span className="font-semibold text-plum-royal">
                {bill.customerName || 'Walk-in Guest'}
                {bill.customerPhone ? ` (${bill.customerPhone})` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-muted">Order Type:</span>
              <span className="font-semibold text-plum-royal">
                {bill.orderType || 'DINE_IN'} {bill.cabinTableRef ? `(${bill.cabinTableRef})` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-muted">Original Payment Method:</span>
              <span className="font-semibold text-plum-royal">{bill.paymentMethod || 'CASH'}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-lavender-200">
              <span className="font-semibold text-body">Invoice Grand Total:</span>
              <span className="font-serif font-bold text-sm text-plum-royal">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Cancellation Reason (Mandatory) */}
          <div>
            <label className="block text-xs font-semibold text-plum-royal mb-1.5">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Provide a mandatory reason for this cancellation (e.g. Guest order mistake, food returned, cashier entry duplicate)..."
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none ${
                errors.reason
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-lavender-200 focus:border-gold'
              }`}
            />
            {errors.reason ? (
              <p className="text-[11px] text-red-600 mt-1">{errors.reason}</p>
            ) : (
              <p className="text-[11px] text-body-muted mt-1">
                This reason is recorded immutably in the regulatory audit trail.
              </p>
            )}
          </div>

          {/* Refund Amount (Optional, Default 0) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-plum-royal">
                Refund Amount (INR ₹)
              </label>
              <span className="text-[11px] text-body-muted">
                Max Allowed: ₹{grandTotal.toFixed(2)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-muted font-semibold text-xs">
                ₹
              </span>
              <input
                type="number"
                step="0.50"
                min="0.00"
                max={grandTotal}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                disabled={isSubmitting}
                className={`w-full pl-8 pr-4 py-2.5 rounded-2xl text-xs font-semibold bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                  errors.refund
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-lavender-200 focus:border-gold'
                }`}
              />
            </div>
            {errors.refund ? (
              <p className="text-[11px] text-red-600 mt-1">{errors.refund}</p>
            ) : (
              <p className="text-[11px] text-body-muted mt-1">
                Enter amount refunded to customer (if any). If no cash/refund is returned, leave at 0.00.
              </p>
            )}
          </div>

          {/* Audit Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <span className="font-semibold">Permanent Regulatory Action:</span> Cancellation will
              mark this bill as <strong>CANCELLED</strong> and record your admin username, refund
              amount, and timestamp in the audit logs. The invoice record is permanently preserved
              and will never be deleted.
            </div>
          </div>

          {/* Explicit Confirmation Checkbox */}
          <div className="p-3.5 rounded-2xl bg-ivory-50 border border-lavender-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConfirmed}
                onChange={(e) => setHasConfirmed(e.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 w-4 h-4 rounded text-plum-royal border-lavender-300 focus:ring-gold"
              />
              <span className="text-xs text-plum-royal font-medium leading-snug">
                I explicitly confirm that I am authoritatively cancelling bill #{bill.billNumber} for ₹{grandTotal.toFixed(2)}.
              </span>
            </label>
            {errors.confirmation && (
              <p className="text-[11px] text-red-600 mt-1.5 pl-6">{errors.confirmation}</p>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-lavender-50/60 border-t border-lavender-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors disabled:opacity-50"
          >
            Abort
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !hasConfirmed || !cancellationReason.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-soft transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Execute Cancellation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
