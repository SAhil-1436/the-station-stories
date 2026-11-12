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
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-plum-950/70 border border-gold-500/30 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="font-serif font-bold text-xl text-ivory-100">Invoice Unavailable</h2>
        <p className="text-xs text-ivory-200/70">{error || 'The requested invoice could not be located.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gold-500 text-charcoal-950 hover:bg-gold-400"
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
          className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-ivory-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gold-500 text-charcoal-950 hover:bg-gold-400 shadow-md transition-all active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>{t('invoice.printReceipt')}</span>
        </button>
      </div>

      {/* Printable Thermal Receipt Container */}
      <div 
        id="printable-receipt"
        className="p-6 sm:p-8 rounded-2xl bg-ivory-100 text-charcoal-950 shadow-2xl border border-gold-500/40 space-y-5 font-mono text-xs"
      >
        {/* Receipt Header */}
        <div className="text-center pb-4 border-b border-dashed border-charcoal-950/30 space-y-1">
          <div className="w-10 h-10 rounded-full border-2 border-charcoal-950 flex items-center justify-center mx-auto mb-2">
            <UtensilsCrossed className="w-5 h-5 text-charcoal-950" />
          </div>
          <h2 className="font-serif font-extrabold text-xl tracking-wider text-charcoal-950 uppercase">
            {invoice.restaurantName || 'THE STATION STORIES'}
          </h2>
          <p className="text-[10px] uppercase tracking-widest font-sans font-semibold text-charcoal-700">
            Fast Food & Restaurant
          </p>
          <p className="text-[10px] text-charcoal-600">
            Official Dining Receipt & Customer Invoice
          </p>
        </div>

        {/* Bill Metadata Grid */}
        <div className="grid grid-cols-2 gap-y-1.5 text-[11px] pb-3 border-b border-dashed border-charcoal-950/30">
          <div>
            <span className="text-charcoal-600">Bill No:</span>{' '}
            <strong className="text-charcoal-950">{invoice.billNumber}</strong>
          </div>
          <div className="text-right">
            <span className="text-charcoal-600">Order:</span>{' '}
            <strong className="text-charcoal-950">{invoice.orderType}</strong>
          </div>

          <div>
            <span className="text-charcoal-600">Table:</span>{' '}
            <strong className="text-charcoal-950">{invoice.cabinTableRef || 'Counter'}</strong>
          </div>
          <div className="text-right">
            <span className="text-charcoal-600">Guest:</span>{' '}
            <strong className="text-charcoal-950">{invoice.customerName || 'Walk-in'}</strong>
          </div>

          <div className="col-span-2 pt-1 text-[10px] text-charcoal-500">
            {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : ''}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-2 pb-4 border-b border-dashed border-charcoal-950/30">
          <div className="flex items-center justify-between text-[11px] font-bold border-b border-charcoal-950/20 pb-1 uppercase tracking-wider">
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
                <span className="text-charcoal-600">{item.quantity} × {Number(item.unitPrice).toFixed(0)}</span>
                <span className="w-14 text-right font-bold">₹{Number(item.subtotal).toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="space-y-1.5 text-xs pb-4 border-b border-dashed border-charcoal-950/30">
          <div className="flex justify-between">
            <span className="text-charcoal-600">Subtotal:</span>
            <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
          </div>

          {Number(invoice.discountAmount) > 0 && (
            <div className="flex justify-between text-green-700 font-semibold">
              <span>Discount Applied:</span>
              <span>-₹{Number(invoice.discountAmount).toFixed(2)}</span>
            </div>
          )}

          {Number(invoice.totalTax) > 0 && (
            <div className="flex justify-between text-charcoal-600">
              <span>GST ({invoice.taxRate}%):</span>
              <span>₹{Number(invoice.totalTax).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold font-serif pt-2 border-t border-charcoal-950/20">
            <span className="uppercase tracking-wider">Grand Total:</span>
            <span className="text-lg">₹{Number(invoice.grandTotal).toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-[11px] pt-1 text-charcoal-600">
            <span>Payment Mode:</span>
            <strong className="text-charcoal-950 uppercase">{invoice.paymentMethod}</strong>
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
        <div className="text-center pt-2 space-y-1 text-[10px] text-charcoal-600">
          <p className="font-semibold text-charcoal-950 font-serif text-xs">
            {t('invoice.thankYou')}
          </p>
          <p>Please visit again! Share your experience with us.</p>
          <p className="text-[9px] text-charcoal-400 font-mono pt-1">
            Invoice UUID: {invoice.invoiceUuid}
          </p>
        </div>
      </div>
    </div>
  );
}
