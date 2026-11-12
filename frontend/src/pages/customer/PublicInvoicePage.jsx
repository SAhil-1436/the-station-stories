import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Printer, 
  UtensilsCrossed, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Share2, 
  FileText 
} from 'lucide-react';
import { getPublicInvoice } from '../../services/api';

export default function PublicInvoicePage() {
  const { uuid } = useParams();
  const { t } = useTranslation();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uuid) return;
    setLoading(true);
    getPublicInvoice(uuid)
      .then(data => {
        setInvoice(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Invoice not found or expired.');
        setLoading(false);
      });
  }, [uuid]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gold-400 space-y-3">
        <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium">Retrieving Digital Invoice...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-white border border-[#C5A16B]/40 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#E9DDEB] flex items-center justify-center mx-auto text-[#45213F]">
          <AlertCircle className="w-6 h-6 text-[#45213F]" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#45213F]">Invoice Unavailable</h2>
        <p className="text-sm text-[#332A35]/80">{error || 'The requested invoice could not be located or has expired.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#45213F] text-white hover:bg-[#32172F] shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-lg mx-auto">
      {/* Top Controls Bar (Hidden in Print) */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#45213F] hover:text-[#C5A16B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#45213F] text-white hover:bg-[#32172F] shadow-md transition-all active:scale-95"
        >
          <Printer className="w-4 h-4 text-[#C5A16B]" />
          <span>{t('invoice.printReceipt')}</span>
        </button>
      </div>

      {/* Printable Thermal Receipt Container */}
      <div 
        id="printable-receipt"
        className="p-6 sm:p-8 rounded-2xl bg-white text-[#332A35] shadow-xl border border-[#C5A16B]/30 space-y-5 font-mono text-xs"
      >
        {/* Receipt Header */}
        <div className="text-center pb-4 border-b border-dashed border-[#332A35]/30 space-y-1">
          <div className="w-10 h-10 rounded-full border-2 border-[#45213F] flex items-center justify-center mx-auto mb-2 text-[#45213F]">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h2 className="font-serif font-extrabold text-xl tracking-wider text-[#45213F] uppercase">
            {invoice.restaurantName || 'THE STATION STORIES'}
          </h2>
          <p className="text-[10px] uppercase tracking-widest font-sans font-semibold text-[#332A35]/80">
            Fast Food & Restaurant
          </p>
          <p className="text-[10px] text-[#332A35]/60">
            Official Dining Receipt & Customer Invoice
          </p>
        </div>

        {/* Bill Metadata Grid */}
        <div className="grid grid-cols-2 gap-y-1.5 text-[11px] pb-3 border-b border-dashed border-[#332A35]/30">
          <div>
            <span className="text-[#332A35]/70">Bill No:</span>{' '}
            <strong className="text-[#332A35]">{invoice.billNumber}</strong>
          </div>
          <div className="text-right">
            <span className="text-[#332A35]/70">Order:</span>{' '}
            <strong className="text-[#332A35]">{invoice.orderType}</strong>
          </div>

          <div>
            <span className="text-[#332A35]/70">Table:</span>{' '}
            <strong className="text-[#332A35]">{invoice.cabinTableRef || 'Counter'}</strong>
          </div>
          <div className="text-right">
            <span className="text-[#332A35]/70">Guest:</span>{' '}
            <strong className="text-[#332A35]">{invoice.customerName || 'Walk-in'}</strong>
          </div>

          <div className="col-span-2 pt-1 text-[10px] text-[#332A35]/50">
            {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2 pb-4 border-b border-dashed border-[#332A35]/30">
          <div className="flex items-center justify-between text-[11px] font-bold border-b border-[#332A35]/20 pb-1 uppercase tracking-wider">
            <span>Item</span>
            <div className="flex items-center gap-4">
              <span>Qty × Rate</span>
              <span className="w-14 text-right">Total</span>
            </div>
          </div>

          {invoice.items && invoice.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px]">
              <span className="font-sans font-semibold truncate pr-2 max-w-[160px]">{item.itemName}</span>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[#332A35]/70">{item.quantity} × {Number(item.unitPrice).toFixed(0)}</span>
                <span className="w-14 text-right font-bold text-[#45213F]">₹{Number(item.subtotal).toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="space-y-1.5 text-xs pb-4 border-b border-dashed border-[#332A35]/30">
          <div className="flex justify-between">
            <span className="text-[#332A35]/70">Subtotal:</span>
            <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
          </div>

          {Number(invoice.discountAmount) > 0 && (
            <div className="flex justify-between text-green-700 font-semibold">
              <span>Discount Applied:</span>
              <span>-₹{Number(invoice.discountAmount).toFixed(2)}</span>
            </div>
          )}

          {Number(invoice.totalTax) > 0 && (
            <div className="flex justify-between text-[#332A35]/70">
              <span>GST ({invoice.taxRate}%):</span>
              <span>₹{Number(invoice.totalTax).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold font-serif pt-2 border-t border-[#332A35]/20 text-[#45213F]">
            <span className="uppercase tracking-wider">Grand Total:</span>
            <span className="text-lg">₹{Number(invoice.grandTotal).toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-[11px] pt-1 text-[#332A35]/70">
            <span>Payment Mode:</span>
            <strong className="text-[#332A35] uppercase">{invoice.paymentMethod}</strong>
          </div>

          <div className="flex justify-between text-[11px]">
            <span>Status:</span>
            <span className="inline-flex items-center gap-1 font-bold text-green-700 uppercase">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{invoice.paymentStatus}</span>
            </span>
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="text-center pt-2 space-y-1 text-[10px] text-[#332A35]/70">
          <p className="font-semibold text-[#45213F] font-serif text-xs">
            {t('invoice.thankYou')}
          </p>
          <p>Please visit again! Share your experience with us.</p>
          <p className="text-[9px] text-[#332A35]/40 font-mono pt-1">
            Invoice UUID: {invoice.invoiceUuid}
          </p>
        </div>
      </div>
    </div>
  );
}
