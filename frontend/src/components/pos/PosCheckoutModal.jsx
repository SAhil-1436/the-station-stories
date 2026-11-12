import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Banknote,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Utensils,
  ShoppingBag,
  User,
  Phone,
  ShieldCheck,
  Info,
} from 'lucide-react';
import * as posApi from '../../services/posApi';

/**
 * POS Checkout & Payment Finalization Modal (Phase 5.2)
 *
 * Implements:
 * - Authoritative bill submission to POST /api/v1/pos/bills
 * - Order summary & item review (no client price override)
 * - Supported payment methods: CASH, UPI, CARD (SPLIT explicitly excluded)
 * - Mandatory cashier confirmations for Cash receipt, UPI verification, and Card terminal approval
 * - Immediate submit-lock & duplicate submission prevention
 * - Non-retry ambiguous timeout/network failure warning
 * - Full alignment with locked Ivory + Royal Plum + Champagne Gold design
 */
export default function PosCheckoutModal({
  isOpen,
  onClose,
  cart = [],
  orderType = 'DINE_IN',
  cabinTableRef = '',
  customerName = '',
  customerPhone = '',
  subtotal = 0,
  payableTotal = 0,
  onBillSuccess,
}) {
  // Payment Method: 'CASH' | 'UPI' | 'CARD'
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Cashier Verifications
  const [cashConfirmed, setCashConfirmed] = useState(false);
  const [cashTendered, setCashTendered] = useState('');
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [cardConfirmed, setCardConfirmed] = useState(false);

  // Order Notes
  const [orderNotes, setOrderNotes] = useState('');

  // Submission State Machine: 'idle' | 'submitting' | 'error' | 'ambiguous_timeout'
  const [submissionState, setSubmissionState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [ambiguousWarning, setAmbiguousWarning] = useState(null);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('CASH');
      setCashConfirmed(false);
      setCashTendered('');
      setUpiConfirmed(false);
      setCardConfirmed(false);
      setOrderNotes('');
      setSubmissionState('idle');
      setErrorMessage(null);
      setAmbiguousWarning(null);
    }
  }, [isOpen]);

  // Close on Escape key (only when not submitting)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && submissionState !== 'submitting') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submissionState, onClose]);

  if (!isOpen) return null;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  // Cash change calculation
  const cashTenderedNum = parseFloat(cashTendered) || 0;
  const cashChange = cashTenderedNum - payableTotal;

  // Validation
  const isDineInMissingTable = orderType === 'DINE_IN' && !cabinTableRef.trim();
  const isCartEmpty = !cart || cart.length === 0;

  // Determine if active confirmation checkbox is checked
  const isConfirmationSatisfied = () => {
    if (paymentMethod === 'CASH') return cashConfirmed;
    if (paymentMethod === 'UPI') return upiConfirmed;
    if (paymentMethod === 'CARD') return cardConfirmed;
    return false;
  };

  const canFinalize =
    !isCartEmpty &&
    !isDineInMissingTable &&
    isConfirmationSatisfied() &&
    submissionState !== 'submitting';

  // Handle Bill Finalization Submission
  const handleFinalizeBill = async (e) => {
    if (e) e.preventDefault();
    if (!canFinalize || submissionState === 'submitting') return;

    // 1. Lock UI immediately to prevent duplicates
    setSubmissionState('submitting');
    setErrorMessage(null);
    setAmbiguousWarning(null);

    // 2. Build authoritative CreateBillRequest payload
    // Note: Never send client prices. Backend calculates all item prices from DB.
    const billPayload = {
      orderType: orderType,
      cabinTableRef: orderType === 'DINE_IN' ? cabinTableRef.trim() : null,
      customerPhone: customerPhone.trim() ? customerPhone.trim() : null,
      customerName: customerName.trim() ? customerName.trim() : null,
      paymentMethod: paymentMethod,
      discountType: 'NONE',
      discountValue: 0,
      notes: orderNotes.trim() ? orderNotes.trim() : null,
      items: cart.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        notes: item.notes && item.notes.trim() ? item.notes.trim() : null,
      })),
    };

    try {
      const response = await posApi.createPosBill(billPayload);
      setSubmissionState('idle');
      // Pass authoritative backend BillResponse to parent
      onBillSuccess(response);
    } catch (err) {
      const status = err.status;
      const isTimeout =
        err.message?.includes('timeout') ||
        err.code === 'ECONNABORTED' ||
        err.message?.toLowerCase().includes('network error');

      if (isTimeout) {
        // Ambiguous Network Outcome: Do NOT retry blindly!
        setSubmissionState('ambiguous_timeout');
        setAmbiguousWarning(
          'Network connection timed out or was interrupted. The server may have already created this bill in the database. DO NOT resubmit without reconciling. Please check Admin Bills Management or consult the manager before submitting another bill.'
        );
      } else {
        setSubmissionState('error');
        setErrorMessage(
          err.message || 'Failed to finalize bill. Please check item stock or server status.'
        );
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-plum-dark/75 backdrop-blur-sm animate-fadeIn"
      onClick={() => {
        if (submissionState !== 'submitting') onClose();
      }}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden flex flex-col max-h-[94vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-lavender-200 bg-lavender-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-plum-royal text-gold flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-plum-royal">
                Counter Checkout & Settlement
              </h2>
              <p className="text-[11px] text-body-muted">
                Authoritative sequence bill generation (Phase 5.2)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submissionState === 'submitting'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-body-muted hover:text-plum-royal hover:bg-lavender-100 transition-colors disabled:opacity-40"
            aria-label="Close checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-ivory-50/30">
          {/* Order Header Badge */}
          <div className="p-3.5 rounded-2xl bg-white border border-lavender-200 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${
                  orderType === 'DINE_IN'
                    ? 'bg-plum-royal text-ivory'
                    : 'bg-gold-500/20 text-gold-700 border border-gold/40'
                }`}
              >
                {orderType === 'DINE_IN' ? (
                  <>
                    <Utensils className="w-3.5 h-3.5 text-gold" />
                    <span>Dine-In</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-gold" />
                    <span>Takeaway (Parcel)</span>
                  </>
                )}
              </span>
              {orderType === 'DINE_IN' && (
                <span className="font-semibold text-plum-royal font-mono bg-lavender-100 px-2.5 py-1 rounded-full border border-lavender-200">
                  {cabinTableRef ? `Table: ${cabinTableRef}` : 'No Table Assigned'}
                </span>
              )}
            </div>

            {(customerName || customerPhone) && (
              <div className="flex items-center gap-2 text-body-muted text-[11px]">
                {customerName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gold" />
                    <strong className="text-plum-royal">{customerName}</strong>
                  </span>
                )}
                {customerPhone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-gold" />
                    <span>{customerPhone}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Dine-In Missing Table Warning */}
          {isDineInMissingTable && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Table / Cabin reference is required for Dine-In orders before billing.</span>
            </div>
          )}

          {/* Line Items Summary (Condensed) */}
          <div className="rounded-2xl bg-white border border-lavender-200 overflow-hidden shadow-xs">
            <div className="px-4 py-2 bg-lavender-50/70 border-b border-lavender-200 flex justify-between items-center text-xs font-semibold text-plum-royal">
              <span>Order Line Items ({cart.length})</span>
              <span className="text-[11px] text-body-muted font-normal">
                {cart.reduce((s, i) => s + i.quantity, 0)} units total
              </span>
            </div>
            <div className="p-3 max-h-40 overflow-y-auto divide-y divide-lavender-100 text-xs">
              {cart.map((item) => (
                <div key={item.id} className="py-1.5 flex justify-between items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-body truncate block">
                      {item.name}
                    </span>
                    {item.notes && (
                      <span className="text-[10px] text-body-muted italic block truncate">
                        Note: {item.notes}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="text-body-muted mr-3">×{item.quantity}</span>
                    <span className="font-bold text-plum-royal">
                      {formatINR((Math.round(item.price * 100) * item.quantity) / 100)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block font-serif font-bold text-sm text-plum-royal">
              Select Settlement Payment Method:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* CASH */}
              <button
                type="button"
                disabled={submissionState === 'submitting'}
                onClick={() => {
                  setPaymentMethod('CASH');
                  setCashConfirmed(false);
                }}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-plum-royal text-ivory border-plum-royal shadow-soft'
                    : 'bg-white hover:bg-lavender-50 text-body border-lavender-200'
                }`}
              >
                <Banknote className={`w-5 h-5 ${paymentMethod === 'CASH' ? 'text-gold' : 'text-plum-royal'}`} />
                <span className="text-xs font-bold">CASH</span>
                <span className="text-[10px] opacity-75">Cash Drawer</span>
              </button>

              {/* UPI */}
              <button
                type="button"
                disabled={submissionState === 'submitting'}
                onClick={() => {
                  setPaymentMethod('UPI');
                  setUpiConfirmed(false);
                }}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-plum-royal text-ivory border-plum-royal shadow-soft'
                    : 'bg-white hover:bg-lavender-50 text-body border-lavender-200'
                }`}
              >
                <QrCode className={`w-5 h-5 ${paymentMethod === 'UPI' ? 'text-gold' : 'text-plum-royal'}`} />
                <span className="text-xs font-bold">UPI QR</span>
                <span className="text-[10px] opacity-75">App / Soundbox</span>
              </button>

              {/* CARD */}
              <button
                type="button"
                disabled={submissionState === 'submitting'}
                onClick={() => {
                  setPaymentMethod('CARD');
                  setCardConfirmed(false);
                }}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'CARD'
                    ? 'bg-plum-royal text-ivory border-plum-royal shadow-soft'
                    : 'bg-white hover:bg-lavender-50 text-body border-lavender-200'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${paymentMethod === 'CARD' ? 'text-gold' : 'text-plum-royal'}`} />
                <span className="text-xs font-bold">CARD</span>
                <span className="text-[10px] opacity-75">EDC Terminal</span>
              </button>
            </div>
          </div>

          {/* Method-Specific Cashier Confirmation Panels */}
          <div className="p-4 rounded-2xl border bg-white shadow-xs space-y-3">
            {/* CASH Flow */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-plum-royal">
                  <span className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash Payment Collection</span>
                  </span>
                  <span className="text-[11px] text-body-muted">Exact: {formatINR(payableTotal)}</span>
                </div>

                {/* Tendered Amount Quick Buttons & Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-body-muted whitespace-nowrap">Cash Tendered:</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1.5 text-xs text-body-muted">₹</span>
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        placeholder={payableTotal.toFixed(2)}
                        className="w-full bg-ivory-50 border border-lavender-200 focus:border-plum-royal rounded-xl pl-6 pr-3 py-1 text-xs font-mono font-bold text-plum-royal"
                      />
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    {[
                      { label: 'Exact', val: payableTotal },
                      { label: '₹500', val: 500 },
                      { label: '₹1000', val: 1000 },
                      { label: '₹2000', val: 2000 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setCashTendered(btn.val.toString())}
                        className="px-2.5 py-1 rounded-lg bg-lavender-100 hover:bg-lavender-200 text-plum-royal text-[11px] font-mono font-semibold transition-colors"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {cashTenderedNum > 0 && (
                    <div className="p-2 rounded-xl bg-ivory-50 border border-lavender-200 flex justify-between items-center text-xs">
                      <span className="text-body-muted">Change to return:</span>
                      <span
                        className={`font-mono font-bold ${
                          cashChange >= 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {cashChange >= 0
                          ? formatINR(cashChange)
                          : `Short by ${formatINR(Math.abs(cashChange))}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mandatory Cashier Confirmation Checkbox */}
                <label className="flex items-start gap-2.5 pt-2 border-t border-lavender-100 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={cashConfirmed}
                    onChange={(e) => setCashConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-plum-royal focus:ring-plum-royal accent-plum-royal"
                  />
                  <span className="text-xs text-body leading-snug">
                    I confirm that cash amount of <strong>{formatINR(payableTotal)}</strong> has been received and verified.
                  </span>
                </label>
              </div>
            )}

            {/* UPI Flow */}
            {paymentMethod === 'UPI' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-plum-royal">
                  <QrCode className="w-4 h-4 text-gold" />
                  <span>UPI Payment Verification</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Immediate PAID Settlement Warning</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    The backend records this bill as <strong>PAID</strong> immediately upon generation. Only finalize after verifying the incoming credit notification on the restaurant merchant soundbox or payment terminal.
                  </p>
                </div>

                {/* Mandatory Cashier Confirmation Checkbox */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={upiConfirmed}
                    onChange={(e) => setUpiConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-plum-royal focus:ring-plum-royal accent-plum-royal"
                  />
                  <span className="text-xs text-body leading-snug">
                    I confirm that UPI payment of <strong>{formatINR(payableTotal)}</strong> has been verified on the restaurant merchant account.
                  </span>
                </label>
              </div>
            )}

            {/* CARD Flow */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-plum-royal">
                  <CreditCard className="w-4 h-4 text-plum-royal" />
                  <span>External Card Terminal Settlement</span>
                </div>

                <div className="p-3 rounded-xl bg-lavender-50 border border-lavender-200 text-body text-xs space-y-1">
                  <div className="font-semibold text-plum-royal flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-gold" />
                    <span>External EDC Terminal Confirmation</span>
                  </div>
                  <p className="text-[11px] text-body-muted leading-relaxed">
                    Swipe or tap customer card on the physical counter terminal. Ensure the terminal receipt prints <strong>APPROVED</strong>.
                  </p>
                </div>

                {/* Mandatory Cashier Confirmation Checkbox */}
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={cardConfirmed}
                    onChange={(e) => setCardConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-plum-royal focus:ring-plum-royal accent-plum-royal"
                  />
                  <span className="text-xs text-body leading-snug">
                    I confirm that external card terminal has approved the transaction of <strong>{formatINR(payableTotal)}</strong>.
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Optional Bill Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-body-muted">
              Bill Remark / Kitchen Note (Optional):
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Guest requested fast parcel, Birthday greeting"
              className="w-full bg-white border border-lavender-200 focus:border-plum-royal rounded-xl px-3 py-1.5 text-xs text-body placeholder-body-muted/60"
            />
          </div>

          {/* Financial Totals Breakdown */}
          <div className="p-4 rounded-2xl bg-lavender-50/70 border border-lavender-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-body-muted">
              <span>Subtotal:</span>
              <span className="font-mono text-body">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-body-muted">
              <span>Discount (NONE):</span>
              <span className="font-mono text-body">₹0.00</span>
            </div>
            <div className="flex justify-between text-body-muted">
              <span>Tax (GST Disabled - Tax-Exempt):</span>
              <span className="font-mono text-emerald-600 font-semibold">₹0.00</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-lavender-200 font-bold text-plum-royal">
              <span className="font-serif text-base">Payable Total:</span>
              <span className="font-mono text-2xl text-plum-royal">{formatINR(payableTotal)}</span>
            </div>
          </div>

          {/* Ambiguous Network Timeout Warning */}
          {submissionState === 'ambiguous_timeout' && ambiguousWarning && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs space-y-2">
              <div className="font-bold flex items-center gap-2 text-sm text-red-700">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>Ambiguous Network Result — Do Not Retry</span>
              </div>
              <p className="leading-relaxed">{ambiguousWarning}</p>
              <div className="pt-1 text-[11px] font-semibold text-red-800">
                Action: Please check the Bills Management table in Admin to see if the bill was generated before re-attempting.
              </div>
            </div>
          )}

          {/* Standard Submission Error */}
          {submissionState === 'error' && errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">Bill Finalization Error</div>
                <div className="mt-0.5">{errorMessage}</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-lavender-50/70 border-t border-lavender-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submissionState === 'submitting'}
            className="px-4 py-2.5 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors disabled:opacity-40"
          >
            Cancel & Return to Cart
          </button>

          <button
            type="button"
            onClick={handleFinalizeBill}
            disabled={!canFinalize}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold shadow-soft transition-all ${
              canFinalize
                ? 'bg-plum-royal hover:bg-plum-dark text-white cursor-pointer active:scale-95'
                : 'bg-plum-royal/40 text-ivory/60 cursor-not-allowed'
            }`}
          >
            {submissionState === 'submitting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                <span>Finalizing Bill & Sequence...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>Confirm Payment & Finalize ({formatINR(payableTotal)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
