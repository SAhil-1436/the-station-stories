import React, { useEffect, useState, useCallback } from 'react';
import {
  Printer,
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import * as posApi from '../../services/posApi';

/**
 * Reusable ESC/POS Thermal Receipt Modal (Phase 5.2)
 *
 * Supports two distinct modes:
 * 1. Authoritative Finalized Receipt (when billId is provided):
 *    - Fetches authoritative data from GET /api/v1/pos/bills/{billId}/receipt
 *    - Supports live width switching (80mm / 58mm)
 *    - Isolated retry on fetch failure (never recreates the bill)
 * 2. Unfinalized Order Draft Preview (when billId is not provided):
 *    - Clearly displays "UNFINALIZED ORDER DRAFT PREVIEW - NOT A TAX INVOICE"
 *
 * Isolated print styling (#printable-receipt) prints only the receipt card without page chrome.
 */
export default function PosReceiptPreviewModal({
  isOpen,
  onClose,
  billId = null, // When supplied, renders authoritative finalized receipt
  // Draft fallback props (used only when billId is null)
  cart = [],
  orderType = 'DINE_IN',
  tableRef = '',
  customerName = '',
  customerPhone = '',
  cashierName = 'Counter Cashier',
  subtotal = 0,
  tax = 0,
  discount = 0,
  payableTotal = 0,
}) {
  const [printerWidth, setPrinterWidth] = useState('80mm');
  const [printedFeedback, setPrintedFeedback] = useState(false);

  // Authoritative Receipt State (when billId is provided)
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Fetch Authoritative Receipt from backend
  const fetchReceipt = useCallback(async () => {
    if (!billId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const data = await posApi.getThermalReceipt(billId, printerWidth);
      setReceiptData(data);
    } catch (err) {
      setFetchError(
        err.message || 'Failed to load authoritative receipt from server.'
      );
    } finally {
      setLoading(false);
    }
  }, [billId, printerWidth]);

  useEffect(() => {
    if (isOpen && billId) {
      fetchReceipt();
    } else if (!billId) {
      setReceiptData(null);
      setFetchError(null);
      setLoading(false);
    }
  }, [isOpen, billId, fetchReceipt]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFinalized = Boolean(billId && receiptData);
  const isDraft = !billId;

  const handlePrint = () => {
    setPrintedFeedback(true);
    window.print();
    setTimeout(() => setPrintedFeedback(false), 3000);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  // Draft Date / Time fallback
  const now = new Date();
  const draftDate = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const draftTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-plum-dark/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden flex flex-col max-h-[94vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-lavender-200 bg-lavender-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal shadow-xs">
              <FileText className="w-5 h-5 text-plum-royal" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-plum-royal">
                {isDraft ? 'Draft Order Preview' : 'Authoritative Thermal Receipt'}
              </h3>
              <p className="text-[11px] text-body-muted">
                {isDraft
                  ? 'Unfinalized cart preview (Not an invoice)'
                  : `Invoice #${receiptData?.billNumber || billId}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Width Toggle */}
            <div className="flex bg-lavender-100 p-0.5 rounded-full border border-lavender-200 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setPrinterWidth('80mm')}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  printerWidth === '80mm'
                    ? 'bg-plum-royal text-ivory shadow-xs'
                    : 'text-body-muted hover:text-plum-royal'
                }`}
              >
                80mm
              </button>
              <button
                type="button"
                onClick={() => setPrinterWidth('58mm')}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  printerWidth === '58mm'
                    ? 'bg-plum-royal text-ivory shadow-xs'
                    : 'text-body-muted hover:text-plum-royal'
                }`}
              >
                58mm
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-body-muted hover:text-plum-royal hover:bg-lavender-100 transition-colors"
              aria-label="Close receipt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-lavender-50/30 flex flex-col items-center justify-start">
          {/* Loading Authoritative Receipt */}
          {loading && (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-gold animate-spin mx-auto" />
              <div className="font-serif font-bold text-base text-plum-royal">
                Formatting Authoritative Receipt...
              </div>
              <p className="text-xs text-body-muted">
                Querying ESC/POS payload from backend
              </p>
            </div>
          )}

          {/* Error Fetching Authoritative Receipt */}
          {!loading && fetchError && (
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-center max-w-sm space-y-3 my-8">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
              <h4 className="font-bold text-red-900 text-sm">Receipt Retrieval Error</h4>
              <p className="text-xs text-red-800 leading-relaxed">{fetchError}</p>
              <div className="text-[11px] text-body-muted">
                Your bill was finalized and saved in the database. Only receipt formatting failed.
              </div>
              <button
                type="button"
                onClick={fetchReceipt}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Loading Receipt</span>
              </button>
            </div>
          )}

          {/* Render Thermal Receipt */}
          {!loading && !fetchError && (
            <>
              {/* Draft Warning Banner */}
              {isDraft && (
                <div className="w-full max-w-[340px] mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-center text-[10px] font-bold uppercase tracking-wider">
                  ⚠️ Draft Order Preview • Not a Tax Invoice • Pending Counter Finalization
                </div>
              )}

              {/* Printable ESC/POS Receipt Container */}
              <div
                id="printable-receipt"
                className={`bg-white text-zinc-950 font-mono text-[11px] leading-tight p-5 border border-zinc-300 shadow-sm transition-all duration-200 ${
                  printerWidth === '80mm' ? 'w-full max-w-[340px]' : 'w-full max-w-[270px]'
                }`}
                style={{ fontFamily: 'Courier, "Courier New", monospace' }}
              >
                {/* Store Header */}
                <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-zinc-400">
                  <div className="font-bold text-sm tracking-wider uppercase">
                    {isFinalized ? receiptData.restaurantName : 'THE STATION STORIES'}
                  </div>
                  <div className="text-[10px] text-zinc-600">
                    {isFinalized ? receiptData.tagline : 'Fast Food & Restaurant'}
                  </div>
                  {isFinalized && receiptData.address && (
                    <div className="text-[9px] text-zinc-500 leading-tight">
                      {receiptData.address}
                    </div>
                  )}
                  {isFinalized && receiptData.phone && (
                    <div className="text-[10px] text-zinc-500">
                      Tel: {receiptData.phone}
                    </div>
                  )}
                  <div className="text-[10px] font-semibold text-zinc-700 pt-0.5">
                    {isFinalized && receiptData.gstin
                      ? `GSTIN: ${receiptData.gstin}`
                      : 'GSTIN: Tax-Exempt / Composition'}
                  </div>
                </div>

                {/* Metadata */}
                <div className="py-2 border-b border-dashed border-zinc-400 space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>BILL NO:</span>
                    <span className="font-bold">
                      {isFinalized ? receiptData.billNumber : `#DRAFT-${now.getTime().toString().slice(-6)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE: {isFinalized ? receiptData.date : draftDate}</span>
                    <span>TIME: {isFinalized ? receiptData.time : draftTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ORDER TYPE:</span>
                    <span className="font-bold">
                      {isFinalized
                        ? `${receiptData.orderType} ${receiptData.cabinTableRef ? `(${receiptData.cabinTableRef})` : ''}`
                        : `${orderType} ${tableRef ? `(${tableRef})` : ''}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>CASHIER:</span>
                    <span>{isFinalized ? receiptData.cashierName : cashierName}</span>
                  </div>
                  {(isFinalized ? receiptData.customerName : customerName) && (
                    <div className="flex justify-between">
                      <span>CUSTOMER:</span>
                      <span>{isFinalized ? receiptData.customerName : customerName}</span>
                    </div>
                  )}
                  {isFinalized && receiptData.paymentMethod && (
                    <div className="flex justify-between">
                      <span>PAYMENT:</span>
                      <span className="font-bold">{receiptData.paymentMethod}</span>
                    </div>
                  )}
                </div>

                {/* Items Header */}
                <div className="py-1.5 border-b border-dashed border-zinc-400 font-bold flex justify-between text-[10px]">
                  <span className="flex-1">ITEM</span>
                  <span className="w-8 text-center">QTY</span>
                  <span className="w-16 text-right">TOTAL</span>
                </div>

                {/* Line Items List */}
                <div className="py-2 space-y-1.5 border-b border-dashed border-zinc-400">
                  {isFinalized ? (
                    receiptData.items && receiptData.items.length > 0 ? (
                      receiptData.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between items-start">
                            <span className="flex-1 font-semibold pr-1 break-words">
                              {item.name}
                            </span>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <span className="w-16 text-right font-mono">
                              {Number(item.subtotal || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-[9px] text-zinc-500 pl-1">
                            @{Number(item.unitPrice || 0).toFixed(2)} each
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-2 text-zinc-400 italic">No items</div>
                    )
                  ) : (
                    cart.map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-start">
                          <span className="flex-1 font-semibold pr-1 break-words">
                            {item.name}
                          </span>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <span className="w-16 text-right font-mono">
                            {((Math.round(item.price * 100) * item.quantity) / 100).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-500 pl-1">
                          <span>@{Number(item.price).toFixed(2)} each</span>
                          {item.notes && <span className="italic truncate max-w-[120px]">{item.notes}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals Section */}
                <div className="py-2 border-b border-dashed border-zinc-400 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>
                      {formatCurrency(isFinalized ? receiptData.subtotal : subtotal)}
                    </span>
                  </div>
                  {(isFinalized ? Number(receiptData.discountAmount || 0) : discount) > 0 && (
                    <div className="flex justify-between text-zinc-700">
                      <span>DISCOUNT:</span>
                      <span>
                        -{formatCurrency(isFinalized ? receiptData.discountAmount : discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500">
                    <span>
                      GST {isFinalized && receiptData.taxRate > 0 ? `(${receiptData.taxRate}%)` : '(Tax-Exempt)'}:
                    </span>
                    <span>
                      {formatCurrency(isFinalized ? receiptData.totalTax : tax)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-zinc-300">
                    <span>GRAND TOTAL:</span>
                    <span className="font-mono">
                      {formatCurrency(isFinalized ? receiptData.grandTotal : payableTotal)}
                    </span>
                  </div>
                </div>

                {/* UPI QR string / payment note */}
                {isFinalized && receiptData.upiQrString && (
                  <div className="py-2 border-b border-dashed border-zinc-400 text-center space-y-1 text-[9px] text-zinc-600">
                    <div className="font-semibold uppercase tracking-wider">UPI PAYMENT QR DATA</div>
                    <div className="font-mono text-[8px] break-all bg-zinc-50 p-1 rounded border border-zinc-200">
                      {receiptData.upiQrString}
                    </div>
                  </div>
                )}

                {/* Footer Notice */}
                <div className="pt-3 text-center space-y-0.5 text-[10px] text-zinc-700">
                  <div className="font-bold">
                    {isFinalized && receiptData.footerText
                      ? receiptData.footerText
                      : '*** THANK YOU FOR VISITING! ***'}
                  </div>
                  <div className="text-[9px] text-zinc-500">
                    The Station Stories Restaurant
                  </div>
                  <div className="text-[8px] text-zinc-400 pt-1">
                    {isFinalized
                      ? `Finalized Invoice • Width: ${printerWidth}`
                      : `Draft Order Preview • Width: ${printerWidth}`}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-lavender-50/70 border-t border-lavender-200 shrink-0">
          <div className="text-xs text-body-muted flex items-center gap-2">
            {printedFeedback && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sent to printer queue
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || Boolean(fetchError)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-gold" />
              <span>Print ESC/POS Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
