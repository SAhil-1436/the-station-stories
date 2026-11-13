import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Server,
  RefreshCw,
  Lock,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import * as posApi from '../../services/posApi';
import {
  SUBMISSION_LIFECYCLE,
  classifyBillError,
  saveAmbiguousMarker,
  getAmbiguousMarker,
  clearAmbiguousMarker,
  validateCashTender,
  generateIdempotencyKey,
} from '../../utils/submissionLifecycle';

/**
 * POS Checkout & Payment Finalization Modal (Phase 5.3 Correction)
 *
 * Implements:
 * - Robust 5-state submission lifecycle: idle, submitting, succeeded, definitively_failed, ambiguous_outcome
 * - Multi-layer duplicate submission protection (ref lock, disabled buttons, Enter-key guard)
 * - Unique idempotency key generated per order and sent via Idempotency-Key HTTP header
 * - Strict Cash Tender Validation (exact cash or >= bill total, prevents under-tender finalization)
 * - Mandatory cashier confirmations for Cash receipt, UPI verification, and Card terminal approval
 * - Ambiguous outcome lockout: blocks Escape, backdrop click, and close button
 * - Safe persistence of ambiguous markers with original idempotencyKey preserved
 * - Authoritative backend-driven reconciliation via GET /api/v1/pos/bills/operations/{operationKey}
 * - Zero fake BillResponse objects, zero unsafe client-side manual unlocks
 * - Ivory + Royal Plum + Champagne Gold design system
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
  const { user, isAdmin, isCashier } = useAuth();

  // Payment Method: 'CASH' | 'UPI' | 'CARD' (SPLIT explicitly excluded)
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Cashier Verifications
  const [cashConfirmed, setCashConfirmed] = useState(false);
  const [cashTendered, setCashTendered] = useState('');
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [cardConfirmed, setCardConfirmed] = useState(false);

  // Order Notes
  const [orderNotes, setOrderNotes] = useState('');

  // 5-state lifecycle
  const [submissionState, setSubmissionState] = useState(SUBMISSION_LIFECYCLE.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [ambiguousMarkerData, setAmbiguousMarkerData] = useState(null);

  // Idempotency Key
  const [activeIdempotencyKey, setActiveIdempotencyKey] = useState('');

  // Backend Reconciliation State
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [reconcileError, setReconcileError] = useState(null);
  const [reconcileFeedback, setReconcileFeedback] = useState(null);

  // Synchronous ref-based submit lock
  const isSubmittingRef = useRef(false);

  // Check for existing ambiguous marker on mount or when opened
  useEffect(() => {
    if (isOpen) {
      const existingMarker = getAmbiguousMarker();
      if (existingMarker && (existingMarker.idempotencyKey || existingMarker.clientReferenceId)) {
        setSubmissionState(SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME);
        setAmbiguousMarkerData(existingMarker);
        setActiveIdempotencyKey(existingMarker.idempotencyKey || existingMarker.clientReferenceId);
      } else {
        // Fresh checkout session: generate a fresh unique idempotency key
        setPaymentMethod('CASH');
        setCashConfirmed(false);
        setCashTendered('');
        setUpiConfirmed(false);
        setCardConfirmed(false);
        setOrderNotes('');
        setSubmissionState(SUBMISSION_LIFECYCLE.IDLE);
        setErrorMessage(null);
        setAmbiguousMarkerData(null);
        setReconcileError(null);
        setReconcileFeedback(null);
        setActiveIdempotencyKey(generateIdempotencyKey());
      }
      isSubmittingRef.current = false;
    }
  }, [isOpen]);

  // Close on Escape key - STRICTLY PREVENTED if submitting or ambiguous outcome
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (
          submissionState === SUBMISSION_LIFECYCLE.SUBMITTING ||
          submissionState === SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME
        ) {
          // Strictly block Escape dismissal during in-flight or ambiguous states
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submissionState, onClose]);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  // Cash tender validation calculation
  const cashValidation = useMemo(() => {
    return validateCashTender(cashTendered, payableTotal);
  }, [cashTendered, payableTotal]);

  // Validation Flags
  const isDineInMissingTable = orderType === 'DINE_IN' && !cabinTableRef.trim();
  const isCartEmpty = !cart || cart.length === 0;

  // Confirmation satisfaction check
  const isConfirmationSatisfied = () => {
    if (paymentMethod === 'CASH') {
      return cashValidation.isValid && cashConfirmed;
    }
    if (paymentMethod === 'UPI') return upiConfirmed;
    if (paymentMethod === 'CARD') return cardConfirmed;
    return false;
  };

  const canFinalize =
    !isCartEmpty &&
    !isDineInMissingTable &&
    isConfirmationSatisfied() &&
    (submissionState === SUBMISSION_LIFECYCLE.IDLE || submissionState === SUBMISSION_LIFECYCLE.DEFINITIVELY_FAILED) &&
    !isSubmittingRef.current;

  // Handle Bill Finalization Submission with Idempotency Protection
  const handleFinalizeBill = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Synchronous immediate lock against repeated clicks or Enter events
    if (
      isSubmittingRef.current ||
      submissionState === SUBMISSION_LIFECYCLE.SUBMITTING ||
      submissionState === SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME ||
      !canFinalize
    ) {
      return;
    }

    isSubmittingRef.current = true;
    setSubmissionState(SUBMISSION_LIFECYCLE.SUBMITTING);
    setErrorMessage(null);

    // Ensure collision-resistant idempotency key exists
    const keyToUse = activeIdempotencyKey || generateIdempotencyKey();
    if (!activeIdempotencyKey) {
      setActiveIdempotencyKey(keyToUse);
    }

    // Build authoritative CreateBillRequest payload (never sending client prices)
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
      const response = await posApi.createPosBill(billPayload, keyToUse);
      isSubmittingRef.current = false;
      setSubmissionState(SUBMISSION_LIFECYCLE.SUCCEEDED);
      clearAmbiguousMarker();
      // Pass authoritative backend BillResponse to parent
      onBillSuccess(response);
    } catch (err) {
      isSubmittingRef.current = false;
      const classification = classifyBillError(err);

      if (classification === SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME) {
        // Save minimal safe marker preserving original idempotency key (no tokens, no credentials)
        const marker = saveAmbiguousMarker({
          idempotencyKey: keyToUse,
          orderType,
          cabinTableRef: orderType === 'DINE_IN' ? cabinTableRef.trim() : null,
          itemCount: cart.reduce((s, i) => s + i.quantity, 0),
          estimatedTotal: payableTotal,
          paymentMethod,
          reason: err.message || 'Network interruption / uncertain server response',
        });
        setAmbiguousMarkerData(marker);
        setSubmissionState(SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME);
      } else {
        // Definitively failed (e.g. 400 Bad Request, out of stock, validation)
        setSubmissionState(SUBMISSION_LIFECYCLE.DEFINITIVELY_FAILED);
        setErrorMessage(
          err.message || 'Failed to finalize bill. Please check dish availability.'
        );
      }
    }
  };

  // Authoritative Backend-Safe Reconciliation
  const handleReconcileWithBackend = async () => {
    if (!activeIdempotencyKey) {
      setReconcileError('No active operation key found to reconcile.');
      return;
    }

    setReconcileLoading(true);
    setReconcileError(null);
    setReconcileFeedback(null);

    try {
      const result = await posApi.getBillOperationStatus(activeIdempotencyKey);

      if (!result) {
        throw new Error('Received empty response from server reconciliation endpoint.');
      }

      if (result.status === 'SUCCEEDED' && result.bill) {
        // Authoritative bill creation confirmed by backend
        clearAmbiguousMarker();
        setAmbiguousMarkerData(null);
        setSubmissionState(SUBMISSION_LIFECYCLE.SUCCEEDED);
        isSubmittingRef.current = false;
        // Pass the REAL authoritative BillResponse from the backend (no fake fallback!)
        onBillSuccess(result.bill);
      } else if (result.status === 'DEFINITIVELY_FAILED') {
        // Backend confirmed operation definitively failed (e.g. stock issue)
        clearAmbiguousMarker();
        setAmbiguousMarkerData(null);
        setSubmissionState(SUBMISSION_LIFECYCLE.DEFINITIVELY_FAILED);
        setErrorMessage(result.message || 'Server confirmed the bill creation failed. No bill was recorded in the database.');
        // Generate new key for subsequent fresh attempt
        setActiveIdempotencyKey(generateIdempotencyKey());
        isSubmittingRef.current = false;
      } else if (result.status === 'NOT_FOUND') {
        // Backend confirmed no operation was accepted or committed for this key
        clearAmbiguousMarker();
        setAmbiguousMarkerData(null);
        setSubmissionState(SUBMISSION_LIFECYCLE.DEFINITIVELY_FAILED);
        setErrorMessage('Server confirmed: No bill was recorded or accepted for this operation key. Counter unlocked. You may modify the order or resubmit.');
        setActiveIdempotencyKey(generateIdempotencyKey());
        isSubmittingRef.current = false;
      } else if (result.status === 'PROCESSING') {
        // Still processing on the server
        setReconcileFeedback('Bill creation is currently processing on the server. Please wait a moment and click Reconcile again.');
      } else {
        setReconcileFeedback(`Server returned status: ${result.status}. Transaction remains locked for safety.`);
      }
    } catch (err) {
      setReconcileError(err.message || 'Failed to reach server to reconcile bill status. Counter remains locked.');
    } finally {
      setReconcileLoading(false);
    }
  };

  if (!isOpen) return null;

  // Is modal dismissible? ONLY when not submitting AND not in ambiguous outcome
  const isDismissible =
    submissionState !== SUBMISSION_LIFECYCLE.SUBMITTING &&
    submissionState !== SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-plum-dark/75 backdrop-blur-sm animate-fadeIn"
      onClick={() => {
        if (isDismissible) onClose();
      }}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden flex flex-col max-h-[94vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-lavender-200 bg-lavender-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
                submissionState === SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME
                  ? 'bg-amber-600 text-white'
                  : 'bg-plum-royal text-gold'
              }`}
            >
              {submissionState === SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME ? (
                <Lock className="w-5 h-5 text-white" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-plum-royal">
                {submissionState === SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME
                  ? 'Ambiguous Transaction — Counter Locked'
                  : 'Counter Checkout & Settlement'}
              </h2>
              <p className="text-[11px] text-body-muted">
                {submissionState === SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME
                  ? 'Unresolved server status requires backend reconciliation'
                  : 'Authoritative sequence bill generation (Phase 5.3)'}
              </p>
            </div>
          </div>

          {/* Close button strictly disabled during in-flight or ambiguous states */}
          <button
            type="button"
            onClick={onClose}
            disabled={!isDismissible}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              !isDismissible
                ? 'opacity-20 cursor-not-allowed text-gray-400'
                : 'text-body-muted hover:text-plum-royal hover:bg-lavender-100'
            }`}
            aria-label="Close checkout"
            title={!isDismissible ? 'Locked during unresolved state' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-ivory-50/30">
          {/* ================================================================= */}
          {/* AMBIGUOUS OUTCOME LOCKOUT SCREEN */}
          {/* ================================================================= */}
          {submissionState === SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Transaction Status Unknown — Counter Locked</span>
                </div>
                <p className="leading-relaxed">
                  A network timeout, connection reset, or server error occurred during bill finalization.
                  The backend database <strong>may or may not</strong> have committed this bill.
                </p>
                <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200 text-amber-900 space-y-1">
                  <div className="font-semibold text-amber-950">Pending Operation Snapshot:</div>
                  <div className="flex justify-between">
                    <span>Operation Key:</span>
                    <span className="font-mono font-bold text-plum-royal text-[11px]">{activeIdempotencyKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Type:</span>
                    <span className="font-bold">{ambiguousMarkerData?.orderType || orderType} {ambiguousMarkerData?.cabinTableRef ? `(${ambiguousMarkerData.cabinTableRef})` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items:</span>
                    <span>{ambiguousMarkerData?.itemCount || cart.reduce((s, i) => s + i.quantity, 0)} line items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Total:</span>
                    <span className="font-bold">{formatINR(ambiguousMarkerData?.estimatedTotal || payableTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{ambiguousMarkerData?.paymentMethod || paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-amber-800 pt-1 border-t border-amber-100">
                    <span>Timestamp:</span>
                    <span>{ambiguousMarkerData?.timestamp ? new Date(ambiguousMarkerData.timestamp).toLocaleTimeString() : 'Recent'}</span>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-amber-900 pt-1">
                  ⚠️ Counter Lockout Active: To prevent duplicate billing, modal dismissal and re-submission are blocked until the server confirms the transaction status.
                </div>
              </div>

              {/* Authoritative Backend Reconciliation Card */}
              <div className="p-4 rounded-2xl bg-white border border-lavender-200 shadow-xs space-y-3">
                <div className="font-serif font-bold text-sm text-plum-royal flex items-center gap-2">
                  <Server className="w-4 h-4 text-gold" />
                  <span>Authoritative Backend Reconciliation</span>
                </div>

                <p className="text-xs text-body-muted leading-relaxed">
                  Click the button below to query the authoritative backend reconciliation endpoint (<code>GET /api/v1/pos/bills/operations/{'{operationKey}'}</code>).
                  If the server recorded the bill, it will be retrieved and linked. If the server confirms no bill exists, the counter will be safely unlocked.
                </p>

                {reconcileFeedback && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">{reconcileFeedback}</div>
                  </div>
                )}

                {reconcileError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">{reconcileError}</div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    disabled={reconcileLoading}
                    onClick={handleReconcileWithBackend}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                  >
                    {reconcileLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-gold" />
                        <span>Querying Server Status...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 text-gold" />
                        <span>Query Backend Reconciliation Status</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-body-muted text-center sm:text-left">
                    Operator: <strong>{user?.fullName || user?.username || 'Counter Staff'}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* STANDARD CHECKOUT FORM */
            /* ================================================================= */
            <>
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
                <div className="p-3 max-h-36 overflow-y-auto divide-y divide-lavender-100 text-xs">
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
                    disabled={submissionState === SUBMISSION_LIFECYCLE.SUBMITTING}
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
                    disabled={submissionState === SUBMISSION_LIFECYCLE.SUBMITTING}
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
                    <span className="text-[10px] opacity-75">Merchant App</span>
                  </button>

                  {/* CARD */}
                  <button
                    type="button"
                    disabled={submissionState === SUBMISSION_LIFECYCLE.SUBMITTING}
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
                {/* ========================================================= */}
                {/* CASH FLOW with Strict Tender Validation */}
                {/* ========================================================= */}
                {paymentMethod === 'CASH' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-plum-royal">
                      <span className="flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Cash Payment Collection</span>
                      </span>
                      <span className="text-[11px] text-body-muted">Bill Total: {formatINR(payableTotal)}</span>
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
                            step="any"
                            value={cashTendered}
                            onChange={(e) => {
                              setCashTendered(e.target.value);
                              setCashConfirmed(false); // Reset confirmation on edit
                            }}
                            placeholder="Leave empty for exact cash"
                            className={`w-full bg-ivory-50 border rounded-xl pl-6 pr-3 py-1 text-xs font-mono font-bold text-plum-royal transition-colors ${
                              !cashValidation.isValid
                                ? 'border-red-400 focus:border-red-500'
                                : 'border-lavender-200 focus:border-plum-royal'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        {[
                          { label: 'Exact', val: '' },
                          { label: '₹500', val: '500' },
                          { label: '₹1000', val: '1000' },
                          { label: '₹2000', val: '2000' },
                        ].map((btn) => (
                          <button
                            key={btn.label}
                            type="button"
                            onClick={() => {
                              setCashTendered(btn.val);
                              setCashConfirmed(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-lavender-100 hover:bg-lavender-200 text-plum-royal text-[11px] font-mono font-semibold transition-colors"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>

                      {/* Cash Validation Feedback */}
                      {!cashValidation.isValid ? (
                        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>{cashValidation.errorMessage}</span>
                        </div>
                      ) : cashTendered.trim() !== '' ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-xs">
                          <span className="text-emerald-900 font-medium">Change to return:</span>
                          <span className="font-mono font-bold text-emerald-700 text-sm">
                            {formatINR(cashValidation.changeAmount)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-body-muted italic pl-1">
                          Treated as exact cash received ({formatINR(payableTotal)}).
                        </div>
                      )}
                    </div>

                    {/* Mandatory Cashier Confirmation Checkbox */}
                    <label
                      className={`flex items-start gap-2.5 pt-2 border-t border-lavender-100 select-none ${
                        !cashValidation.isValid
                          ? 'opacity-40 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={!cashValidation.isValid}
                        checked={cashConfirmed}
                        onChange={(e) => setCashConfirmed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-plum-royal focus:ring-plum-royal accent-plum-royal disabled:opacity-40"
                      />
                      <span className="text-xs text-body leading-snug">
                        {cashValidation.isExactCash ? (
                          <>I confirm that exact cash amount of <strong>{formatINR(payableTotal)}</strong> has been collected and verified.</>
                        ) : (
                          <>I confirm that cash tendered of <strong>{formatINR(cashValidation.tenderedAmount)}</strong> has been collected (Change: <strong>{formatINR(cashValidation.changeAmount)}</strong>).</>
                        )}
                      </span>
                    </label>
                  </div>
                )}

                {/* ========================================================= */}
                {/* UPI FLOW */}
                {/* ========================================================= */}
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
                        The backend records this bill as <strong>PAID</strong> immediately upon generation. Only finalize after verifying incoming credit on merchant device/soundbox. If verification fails, cancel checkout instead of billing.
                      </p>
                    </div>

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

                {/* ========================================================= */}
                {/* CARD FLOW */}
                {/* ========================================================= */}
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
                        Swipe or tap customer card on physical counter terminal. Ensure external terminal displays <strong>APPROVED</strong> before submitting.
                      </p>
                    </div>

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

              {/* Optional Bill Remark */}
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
                  <span>Tax (GST Disabled):</span>
                  <span className="font-mono text-emerald-600 font-semibold">₹0.00</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-lavender-200 font-bold text-plum-royal">
                  <span className="font-serif text-base">Payable Total:</span>
                  <span className="font-mono text-2xl text-plum-royal">{formatINR(payableTotal)}</span>
                </div>
              </div>

              {/* Definitive Failure Error Message */}
              {submissionState === SUBMISSION_LIFECYCLE.DEFINITIVELY_FAILED && errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold">Bill Finalization Error</div>
                    <div className="mt-0.5">{errorMessage}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-lavender-50/70 border-t border-lavender-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={!isDismissible}
            className="px-4 py-2.5 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors disabled:opacity-40"
          >
            {submissionState === SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME ? 'Locked' : 'Cancel & Return'}
          </button>

          {submissionState !== SUBMISSION_LIFECYCLE.AMBIGUOUS_OUTCOME && (
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
              {submissionState === SUBMISSION_LIFECYCLE.SUBMITTING ? (
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
          )}
        </div>
      </div>
    </div>
  );
}
