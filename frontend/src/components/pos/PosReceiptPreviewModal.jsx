import React, { useEffect, useState } from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

/**
 * Reusable Thermal Receipt Preview Modal
 * Prepares the ESC/POS receipt layout for Phase 5.3 thermal printing.
 * Supports 80mm and 58mm printer widths with isolated print styling.
 */
export default function PosReceiptPreviewModal({
  isOpen,
  onClose,
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

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const handlePrint = () => {
    setPrintedFeedback(true);
    // Trigger browser print dialog for isolated receipt container
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-plum-dark/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-lavender-200 bg-lavender-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal">
              <FileText className="w-5 h-5 text-plum-royal" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-plum-royal">
                Thermal Receipt Preview
              </h3>
              <p className="text-[11px] text-body-muted">
                ESC/POS standard invoice layout (Phase 5.3 Ready)
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
              aria-label="Close receipt preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-lavender-50/30 flex justify-center">
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
                THE STATION STORIES
              </div>
              <div className="text-[10px] text-zinc-600">
                Fast Food & Fine Dining Counter
              </div>
              <div className="text-[10px] text-zinc-500">
                Station Road, Near Railway Junction
              </div>
              <div className="text-[10px] text-zinc-500">Tel: +91 98765 43210</div>
              <div className="text-[10px] font-semibold text-zinc-700 pt-0.5">
                GSTIN: Tax-Exempt / Composition
              </div>
            </div>

            {/* Invoice Metadata */}
            <div className="py-2 border-b border-dashed border-zinc-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>RECEIPT:</span>
                <span className="font-bold">#DRAFT-{now.getTime().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE: {formattedDate}</span>
                <span>TIME: {formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>ORDER:</span>
                <span className="font-bold">
                  {orderType === 'DINE_IN'
                    ? `DINE-IN ${tableRef ? `(${tableRef})` : ''}`
                    : 'TAKEAWAY (PARCEL)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{cashierName}</span>
              </div>
              {customerName && (
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span>{customerName}</span>
                </div>
              )}
              {customerPhone && (
                <div className="flex justify-between">
                  <span>PHONE:</span>
                  <span>{customerPhone}</span>
                </div>
              )}
            </div>

            {/* Line Items Header */}
            <div className="py-1.5 border-b border-dashed border-zinc-400 font-bold flex justify-between text-[10px]">
              <span className="flex-1">ITEM</span>
              <span className="w-8 text-center">QTY</span>
              <span className="w-16 text-right">TOTAL</span>
            </div>

            {/* Line Items List */}
            <div className="py-2 space-y-1.5 border-b border-dashed border-zinc-400">
              {cart.length === 0 ? (
                <div className="text-center py-2 text-zinc-400 italic">
                  No items in order cart
                </div>
              ) : (
                cart.map((item, index) => {
                  const itemTotal = (Math.round(item.price * 100) * item.quantity) / 100;
                  return (
                    <div key={item.id || index} className="space-y-0.5">
                      <div className="flex justify-between items-start">
                        <span className="flex-1 font-semibold pr-1 break-words">
                          {item.name}
                        </span>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <span className="w-16 text-right">
                          {itemTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-500 pl-1">
                        <span>@{Number(item.price).toFixed(2)} each</span>
                        {item.notes && <span className="italic truncate max-w-[120px]">{item.notes}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Financial Summary */}
            <div className="py-2 border-b border-dashed border-zinc-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>SUBTOTAL ({cart.reduce((sum, i) => sum + i.quantity, 0)} items):</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-zinc-700">
                  <span>DISCOUNT:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>GST (Tax-Exempt):</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-zinc-300">
                <span>TOTAL PAYABLE:</span>
                <span>{formatCurrency(payableTotal)}</span>
              </div>
            </div>

            {/* Payment & Settlement Note */}
            <div className="py-2 border-b border-dashed border-zinc-400 text-center space-y-0.5 text-[9px] text-zinc-600">
              <div className="font-semibold uppercase tracking-wider">
                PAYMENT STATUS: PENDING SETTLEMENT
              </div>
              <div>Authoritative settlement occurs in Phase 5.2</div>
            </div>

            {/* Footer Greeting */}
            <div className="pt-3 text-center space-y-0.5 text-[10px] text-zinc-700">
              <div className="font-bold">*** THANK YOU FOR DINING! ***</div>
              <div className="text-[9px] text-zinc-500">
                Please visit us again at The Station Stories
              </div>
              <div className="text-[8px] text-zinc-400 pt-1">
                Printed via TSS Counter POS • {printerWidth}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-lavender-50/70 border-t border-lavender-200">
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all"
            >
              <Printer className="w-4 h-4 text-gold" />
              <span>Print Thermal Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
