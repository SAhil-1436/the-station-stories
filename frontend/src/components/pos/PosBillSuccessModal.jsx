import React, { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  PlusCircle,
  Share2,
  ExternalLink,
  Receipt,
  FileText,
  User,
  Phone,
  Clock,
  AlertCircle,
  Download,
  Loader2,
} from 'lucide-react';
import * as posApi from '../../services/posApi';
import { downloadReceiptPdf } from '../../utils/receiptPdfGenerator';

/**
 * POS Completed Bill / Invoice Success Modal (Phase 5.2)
 *
 * Implements:
 * - Authoritative bill display from backend BillResponse
 * - Unique thread-safe sequence bill number (e.g. TSS-20261113-0001)
 * - Display of authoritative backend-calculated financials
 * - Comparison with previewed amount to highlight any difference
 * - Direct WhatsApp digital invoice link (if customer phone was provided)
 * - Public invoice view link
 * - Explicit "Start New Order" action (cart is preserved until this deliberate click)
 * - Direct trigger to view/print ESC/POS thermal receipt
 */
export default function PosBillSuccessModal({
  isOpen,
  bill,
  previewedTotal,
  onViewReceipt,
  onStartNewOrder,
}) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  if (!isOpen || !bill) return null;

  const handleDownloadPdf = async () => {
    if (!bill?.id) return;
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      const receiptData = await posApi.getThermalReceipt(bill.id, '58mm');
      await downloadReceiptPdf(receiptData);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3500);
    } catch (err) {
      setPdfError(err.message || 'Failed to generate 58mm PDF receipt.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  // Compare returned grand total with client previewed amount
  const clientPreviewPaise = Math.round((previewedTotal || 0) * 100);
  const authoritativePaise = Math.round(Number(bill.grandTotal || 0) * 100);
  const totalDiffers = clientPreviewPaise !== authoritativePaise;

  const createdAtFormatted = bill.createdAt
    ? new Date(bill.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : new Date().toLocaleTimeString('en-IN');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-plum-dark/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden flex flex-col max-h-[94vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Header */}
        <div className="p-6 bg-gradient-to-b from-emerald-50 to-white border-b border-lavender-200 text-center space-y-2 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>

          <h2 className="font-serif font-bold text-2xl text-plum-royal">
            Bill Generated Successfully
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-base font-bold px-3 py-1 rounded-full bg-plum-royal text-gold tracking-wider shadow-xs">
              {bill.billNumber}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase tracking-wider">
              {bill.paymentStatus || 'PAID'}
            </span>
          </div>
        </div>

        {/* Scrollable Summary Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-ivory-50/30 text-xs">
          {/* Discrepancy Note (if client preview differed from backend authoritative result) */}
          {totalDiffers && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Authoritative Backend Total:</strong> Server calculated {formatINR(bill.grandTotal)} (client preview was {formatINR(previewedTotal)}). Server total is authoritative and recorded in the database.
              </div>
            </div>
          )}

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-white border border-lavender-200 shadow-xs">
            <div>
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">Order Type</span>
              <span className="font-semibold text-plum-royal">
                {bill.orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway (Parcel)'}
                {bill.cabinTableRef ? ` • Table ${bill.cabinTableRef}` : ''}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">Payment Method</span>
              <span className="font-semibold text-plum-royal font-mono">
                {bill.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">Cashier</span>
              <span className="font-semibold text-body">
                {bill.cashierName || 'Staff Cashier'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">Time</span>
              <span className="font-semibold text-body font-mono">
                {createdAtFormatted}
              </span>
            </div>
            {bill.customerName && (
              <div>
                <span className="text-[10px] text-body-muted uppercase tracking-wider block">Customer</span>
                <span className="font-semibold text-body truncate block">
                  {bill.customerName}
                </span>
              </div>
            )}
            {bill.customerPhone && (
              <div>
                <span className="text-[10px] text-body-muted uppercase tracking-wider block">Phone</span>
                <span className="font-semibold text-body font-mono">
                  {bill.customerPhone}
                </span>
              </div>
            )}
          </div>

          {/* Authoritative Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-white border border-lavender-200 shadow-xs space-y-1.5">
            <div className="font-semibold text-plum-royal text-xs border-b border-lavender-100 pb-1.5 flex justify-between">
              <span>Authoritative Totals</span>
              <span className="font-mono text-body-muted">{bill.items ? bill.items.length : 0} line items</span>
            </div>
            <div className="flex justify-between text-body-muted pt-1">
              <span>Subtotal:</span>
              <span className="font-mono text-body">{formatINR(bill.subtotal)}</span>
            </div>
            {bill.discountAmount && Number(bill.discountAmount) > 0 && (
              <div className="flex justify-between text-body-muted">
                <span>Discount:</span>
                <span className="font-mono text-body">-{formatINR(bill.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-body-muted">
              <span>GST / Tax:</span>
              <span className="font-mono text-emerald-600 font-semibold">
                {formatINR(bill.totalTax || 0)} {bill.taxRate > 0 ? `(${bill.taxRate}%)` : ''}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-lavender-200 text-plum-royal">
              <span className="font-serif font-bold text-base">Grand Total:</span>
              <span className="font-mono font-bold text-2xl text-plum-royal">
                {formatINR(bill.grandTotal)}
              </span>
            </div>
          </div>

          {/* WhatsApp & Digital Invoice Sharing */}
          <div className="p-3.5 rounded-2xl bg-lavender-50 border border-lavender-200 space-y-2">
            <span className="font-semibold text-plum-royal block">Digital Invoice Links:</span>
            <div className="flex flex-wrap gap-2">
              {bill.whatsAppShareUrl && (
                <a
                  href={bill.whatsAppShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share via WhatsApp</span>
                </a>
              )}
              {bill.publicInvoiceUrl && (
                <a
                  href={bill.publicInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-lavender-100 text-plum-royal border border-lavender-200 font-semibold text-[11px] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gold" />
                  <span>Open Public Invoice</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Feedback message if any */}
        {(pdfSuccess || pdfError) && (
          <div className="px-6 py-2 bg-lavender-50 border-t border-lavender-200 text-xs">
            {pdfSuccess && (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                58mm Receipt PDF downloaded successfully ({bill.billNumber})
              </span>
            )}
            {pdfError && (
              <span className="inline-flex items-center gap-1.5 text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600" />
                {pdfError}
              </span>
            )}
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-6 py-4 bg-lavender-50/70 border-t border-lavender-200 shrink-0">
          <div className="flex items-center gap-2">
            {/* Direct 58mm PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-lavender-100 hover:bg-lavender-200 text-plum-royal font-semibold text-xs border border-lavender-200 transition-colors shadow-xs disabled:opacity-50"
              title="Download 58mm Thermal Receipt as PDF"
            >
              {downloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
              ) : (
                <Download className="w-4 h-4 text-gold" />
              )}
              <span>{downloadingPdf ? 'Generating PDF...' : 'Download 58mm PDF'}</span>
            </button>

            {/* Print Thermal Receipt Action (Opens preview/print modal) */}
            <button
              type="button"
              onClick={() => onViewReceipt(bill.id)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-lavender-100 hover:bg-lavender-200 text-plum-royal font-semibold text-xs border border-lavender-200 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-gold" />
              <span>Print Preview</span>
            </button>
          </div>

          {/* Explicit Start New Order Button */}
          <button
            type="button"
            onClick={onStartNewOrder}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-plum-royal hover:bg-plum-dark text-white font-semibold text-xs shadow-soft transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-gold" />
            <span>Start New Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
