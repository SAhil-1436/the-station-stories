import React, { useEffect } from 'react';
import {
  X,
  Receipt,
  Calendar,
  User,
  Phone,
  CreditCard,
  Printer,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Copy,
} from 'lucide-react';

export function formatKolkataDateTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(d);
  } catch (e) {
    return String(isoString);
  }
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export default function BillDetailModal({
  isOpen,
  onClose,
  bill = null,
  onOpenCancel,
}) {
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

  if (!isOpen || !bill) return null;

  const isPaid = bill.paymentStatus === 'PAID';
  const isCancelled = bill.paymentStatus === 'CANCELLED';
  const isRefunded = bill.paymentStatus === 'REFUNDED';

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-dark/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden animate-scaleUp max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-lavender-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal">
              <Receipt className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-plum-royal">
                  Bill #{bill.billNumber}
                </h3>
                {isPaid && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PAID</span>
                  </span>
                )}
                {isCancelled && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold">
                    <ShieldAlert className="w-3 h-3" />
                    <span>CANCELLED</span>
                  </span>
                )}
                {isRefunded && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                    <AlertTriangle className="w-3 h-3" />
                    <span>REFUNDED</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-body-muted flex items-center gap-1.5 mt-0.5">
                <span>UUID: {bill.invoiceUuid || '—'}</span>
                {bill.invoiceUuid && (
                  <button
                    onClick={() => copyToClipboard(bill.invoiceUuid)}
                    className="hover:text-plum-royal"
                    title="Copy UUID"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-body-muted hover:text-plum-royal hover:bg-lavender-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-ivory-50 border border-lavender-200">
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">
                Date & Time (IST)
              </span>
              <span className="font-semibold text-plum-royal block mt-1">
                {formatKolkataDateTime(bill.createdAt)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-ivory-50 border border-lavender-200">
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">
                Order Type
              </span>
              <span className="font-semibold text-plum-royal block mt-1">
                {bill.orderType || 'DINE_IN'}
                {bill.cabinTableRef ? ` (${bill.cabinTableRef})` : ''}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-ivory-50 border border-lavender-200">
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">
                Cashier
              </span>
              <span className="font-semibold text-plum-royal block mt-1">
                {bill.cashierName || 'Staff'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-ivory-50 border border-lavender-200">
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">
                Payment Method
              </span>
              <span className="font-semibold text-plum-royal block mt-1">
                {bill.paymentMethod || 'CASH'}
              </span>
            </div>
          </div>

          {/* Customer Card */}
          <div className="p-3.5 rounded-2xl bg-ivory-50 border border-lavender-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center text-plum-royal">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-plum-royal block">
                  {bill.customerName || 'Walk-in Guest'}
                </span>
                <span className="text-[11px] text-body-muted">
                  {bill.customerPhone ? `Contact: ${bill.customerPhone}` : 'No phone recorded'}
                </span>
              </div>
            </div>
            {bill.customerId && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-lavender-100 text-plum-royal font-medium">
                Customer #{bill.customerId}
              </span>
            )}
          </div>

          {/* Cancellation Alert Banner if Cancelled */}
          {isCancelled && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-red-800">
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Invoice Cancelled Authoritatively</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-red-800/90 pt-1 border-t border-red-200">
                <div>
                  <span className="text-red-700 font-medium">Cancelled By:</span>{' '}
                  {bill.cancelledByName || 'Admin'}
                </div>
                <div>
                  <span className="text-red-700 font-medium">Cancelled At:</span>{' '}
                  {formatKolkataDateTime(bill.cancelledAt)}
                </div>
                <div>
                  <span className="text-red-700 font-medium">Refund Amount:</span>{' '}
                  {formatCurrency(bill.refundAmount)}
                </div>
                <div>
                  <span className="text-red-700 font-medium">Reason:</span>{' '}
                  <span className="italic">"{bill.cancellationReason || 'Not specified'}"</span>
                </div>
              </div>
              <p className="text-[10px] text-red-600/80 pt-1 italic">
                This record remains permanently preserved in the regulatory database for financial compliance.
              </p>
            </div>
          )}

          {/* Ordered Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif font-bold text-sm text-plum-royal">
                Ordered Items ({bill.items ? bill.items.length : 0})
              </h4>
            </div>
            <div className="border border-lavender-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-lavender-50/60 border-b border-lavender-200 text-[10px] font-semibold text-plum-royal uppercase">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lavender-100 text-xs">
                  {bill.items && bill.items.length > 0 ? (
                    bill.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-ivory-50/50">
                        <td className="py-2.5 px-3 text-center text-body-muted">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium text-plum-royal">{item.itemName}</span>
                          {item.notes && (
                            <span className="block text-[10px] text-body-muted italic">
                              Note: {item.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-body-muted">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-semibold text-plum-royal">
                          &times; {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-plum-royal">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-body-muted">
                        No item breakdown available for this bill.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financials Calculation Summary */}
          <div className="p-4 rounded-2xl bg-ivory-50 border border-lavender-200 space-y-2">
            <div className="flex justify-between text-body-muted">
              <span>Items Subtotal:</span>
              <span className="font-medium text-body">{formatCurrency(bill.subtotal)}</span>
            </div>

            {Number(bill.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>
                  Discount ({bill.discountType === 'PERCENTAGE' ? `${bill.discountValue}%` : 'Flat'}):
                </span>
                <span className="font-medium">- {formatCurrency(bill.discountAmount)}</span>
              </div>
            )}

            {Number(bill.totalTax) > 0 ? (
              <>
                <div className="flex justify-between text-body-muted">
                  <span>CGST ({Number(bill.taxRate) / 2}%):</span>
                  <span>{formatCurrency(bill.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-body-muted">
                  <span>SGST ({Number(bill.taxRate) / 2}%):</span>
                  <span>{formatCurrency(bill.sgstAmount)}</span>
                </div>
                <div className="flex justify-between text-body-muted">
                  <span>Total Tax ({bill.taxRate}%):</span>
                  <span>{formatCurrency(bill.totalTax)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-body-muted">
                <span>GST Tax (Exempt / Inclusive):</span>
                <span>₹0.00</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-lavender-200 text-sm font-bold text-plum-royal">
              <span>Grand Total:</span>
              <span className="font-serif text-lg text-plum-royal">
                {formatCurrency(bill.grandTotal)}
              </span>
            </div>
          </div>

          {/* Order Notes (if present) */}
          {bill.notes && (
            <div className="p-3 rounded-2xl bg-lavender-50 border border-lavender-200 text-xs">
              <span className="font-semibold text-plum-royal block mb-0.5">Order Notes:</span>
              <p className="text-body-muted italic">{bill.notes}</p>
            </div>
          )}

          {/* Digital Links & WhatsApp Status */}
          <div className="p-3.5 rounded-2xl bg-ivory-50 border border-lavender-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div>
              <span className="text-[11px] font-semibold text-plum-royal block">
                Digital Invoice Link
              </span>
              <span className="text-[10px] text-body-muted">
                WhatsApp Status: {bill.whatsappDeliveryStatus || 'NOT_SENT'}
                {bill.whatsappSentAt ? ` (${formatKolkataDateTime(bill.whatsappSentAt)})` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {bill.publicInvoiceUrl && (
                <a
                  href={bill.publicInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-lavender-200 text-plum-royal text-xs font-semibold hover:bg-lavender-100 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gold-600" />
                  <span>Public View</span>
                </a>
              )}

              {bill.whatsAppShareUrl && (
                <a
                  href={bill.whatsAppShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-soft transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-lavender-50/60 border-t border-lavender-200">
          <div>
            {isPaid && onOpenCancel && (
              <button
                type="button"
                onClick={() => onOpenCancel(bill)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Cancel Bill</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
