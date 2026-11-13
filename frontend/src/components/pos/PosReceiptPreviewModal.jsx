import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Loader2,
  WifiOff,
} from 'lucide-react';
import * as posApi from '../../services/posApi';
import { posDb } from '../../db/posDatabase';
import { downloadReceiptPdf } from '../../utils/receiptPdfGenerator';

/**
 * 58mm Continuous Roll Thermal Receipt Modal (Phase 5.4 Offline PWA)
 *
 * Characteristics:
 * 1. Strictly 58mm continuous roll thermal format (no 80mm option).
 * 2. 58mm PDF download only (physical print / window.print removed for browser consistency).
 * 3. Offline-safe: supports local offline bills (displaying provisional reference and offline notice)
 *    and authoritative server bills.
 * 4. Draft order preview mode for unfinalized carts.
 */
export default function PosReceiptPreviewModal({
  isOpen,
  onClose,
  billId = null, // Can be server bill ID (number) or local reference (string 'OFF-...')
  localBill = null, // Optional local bill object passed directly
  // Draft fallback props (used only when neither billId nor localBill is provided)
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
  const printerWidth = '58mm';

  // Receipt State
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // 58mm PDF Download State
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // Formats a local Dexie bill into standard receipt display format
  const formatLocalBillToReceipt = useCallback((bill) => {
    const billDate = bill.billDate || new Date(bill.createdAt).toISOString().split('T')[0];
    const billTime = new Date(bill.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    return {
      restaurantName: 'THE STATION STORIES',
      tagline: 'Fast Food & Restaurant',
      address: 'Railway Station Road, Station Stories',
      phone: '+91 98765 43210',
      gstin: '07AAAAA0000A1Z5',
      billNumber: bill.serverBillNumber || bill.localReference,
      localReference: bill.localReference,
      isOffline: !bill.serverBillNumber,
      date: billDate,
      time: billTime,
      orderType: bill.orderType,
      cabinTableRef: bill.cabinTableRef,
      customerName: bill.customerName,
      customerPhone: bill.customerPhone,
      cashierName: bill.cashierName || 'Station Cashier',
      paymentMethod: bill.paymentMethod || 'CASH',
      items: (bill.items || []).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      subtotal: bill.subtotal,
      discountAmount: bill.discountAmount || 0,
      taxRate: bill.taxRate || 0,
      totalTax: bill.taxAmount || 0,
      grandTotal: bill.payableAmount,
      footerText: '*** THANK YOU FOR VISITING! ***',
      printerWidth: '58mm',
    };
  }, []);

  // Fetch or construct receipt
  const loadReceipt = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      // 1. Direct localBill passed
      if (localBill) {
        setReceiptData(formatLocalBillToReceipt(localBill));
        return;
      }

      // 2. Local reference provided
      if (billId && typeof billId === 'string' && billId.startsWith('OFF-')) {
        const found = await posDb.localBills.where('localReference').equals(billId).first();
        if (found) {
          setReceiptData(formatLocalBillToReceipt(found));
          return;
        }
      }

      // 3. Online Server Bill
      if (billId && (!isNaN(Number(billId)) || typeof billId === 'number')) {
        const data = await posApi.getThermalReceipt(billId, '58mm');
        setReceiptData(data);
        return;
      }

      // If we got here with a billId that wasn't found in Dexie or invalid
      if (billId) {
        // Try Dexie by numeric id
        const foundById = await posDb.localBills.get(Number(billId));
        if (foundById) {
          setReceiptData(formatLocalBillToReceipt(foundById));
          return;
        }
        throw new Error('Receipt not found locally or on server.');
      }
    } catch (err) {
      setFetchError(err.message || 'Failed to load receipt.');
    } finally {
      setLoading(false);
    }
  }, [billId, localBill, formatLocalBillToReceipt]);

  // Handle Authoritative 58mm PDF Generation and Download
  const handleDownloadPdf = async () => {
    if (!receiptData && !billId) return;
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      const payload = receiptData || (await posApi.getThermalReceipt(billId, '58mm'));
      await downloadReceiptPdf(payload);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3500);
    } catch (err) {
      setPdfError(err.message || 'Failed to generate 58mm PDF receipt.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    if (isOpen && (billId || localBill)) {
      loadReceipt();
      setPdfError(null);
      setPdfSuccess(false);
    } else if (!billId && !localBill) {
      setReceiptData(null);
      setFetchError(null);
      setLoading(false);
      setPdfError(null);
      setPdfSuccess(false);
    }
  }, [isOpen, billId, localBill, loadReceipt]);

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

  const isFinalized = Boolean((billId || localBill) && receiptData);
  const isDraft = !billId && !localBill;
  const isOfflineBill = Boolean(receiptData?.isOffline);

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
        className="w-full max-w-md bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden flex flex-col max-h-[94vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-lavender-200 bg-lavender-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal shadow-xs">
              <FileText className="w-5 h-5 text-plum-royal" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-plum-royal flex items-center gap-2">
                {isDraft ? 'Draft Order Preview' : '58mm Thermal Receipt'}
                {isOfflineBill && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                    <WifiOff className="w-3 h-3" />
                    Offline Bill
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-body-muted font-mono">
                {isDraft
                  ? 'Unfinalized cart preview (Not an invoice)'
                  : `Ref: ${receiptData?.billNumber || receiptData?.localReference || billId}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-plum-royal bg-lavender-100 px-2.5 py-1 rounded-full border border-lavender-200">
              58mm Roll
            </span>
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
          {/* Loading Receipt */}
          {loading && (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-gold animate-spin mx-auto" />
              <div className="font-serif font-bold text-base text-plum-royal">
                Formatting 58mm Receipt...
              </div>
              <p className="text-xs text-body-muted">Preparing thermal continuous layout</p>
            </div>
          )}

          {/* Error Fetching Receipt */}
          {!loading && fetchError && (
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-center max-w-sm space-y-3 my-8">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
              <h4 className="font-bold text-red-900 text-sm">Receipt Retrieval Error</h4>
              <p className="text-xs text-red-800 leading-relaxed">{fetchError}</p>
              <button
                type="button"
                onClick={loadReceipt}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Render Thermal Receipt */}
          {!loading && !fetchError && (
            <>
              {/* Draft Warning Banner */}
              {isDraft && (
                <div className="w-full max-w-[270px] mb-3 p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-center text-[10px] font-bold uppercase tracking-wider">
                  ⚠️ Draft Order Preview • Not a Tax Invoice
                </div>
              )}

              {/* 58mm Printable Receipt Container */}
              <div
                id="printable-receipt"
                className="w-full max-w-[270px] bg-white text-zinc-950 font-mono text-[10px] leading-tight p-4 border border-zinc-300 shadow-sm"
                style={{ fontFamily: 'Courier, "Courier New", monospace' }}
              >
                {/* Store Header */}
                <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-zinc-400">
                  <div className="font-bold text-xs tracking-wider uppercase">
                    {isFinalized ? receiptData.restaurantName : 'THE STATION STORIES'}
                  </div>
                  <div className="text-[9px] text-zinc-600">
                    {isFinalized ? receiptData.tagline : 'Fast Food & Restaurant'}
                  </div>
                  {isFinalized && receiptData.address && (
                    <div className="text-[8px] text-zinc-500 leading-tight">
                      {receiptData.address}
                    </div>
                  )}
                  {isFinalized && receiptData.phone && (
                    <div className="text-[9px] text-zinc-500">
                      Tel: {receiptData.phone}
                    </div>
                  )}
                  {isFinalized && receiptData.gstin && (
                    <div className="text-[9px] font-semibold text-zinc-700 pt-0.5">
                      GSTIN: {receiptData.gstin}
                    </div>
                  )}
                </div>

                {/* Offline Provisional Notice */}
                {isOfflineBill && (
                  <div className="my-1.5 py-1 px-1 bg-zinc-100 border border-dashed border-zinc-400 text-center font-bold text-[8.5px]">
                    * OFFLINE PROVISIONAL BILL *<br />
                    <span className="font-normal text-[7.5px]">Pending Cloud Synchronization</span>
                  </div>
                )}

                {/* Bill Meta */}
                <div className="py-2 border-b border-dashed border-zinc-400 space-y-0.5 text-[9px]">
                  <div className="flex justify-between">
                    <span>BILL:</span>
                    <span className="font-bold">
                      {isFinalized
                        ? receiptData.billNumber || receiptData.localReference
                        : 'DRAFT-PREVIEW'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE: {isFinalized ? receiptData.date : draftDate}</span>
                    <span>TIME: {isFinalized ? receiptData.time : draftTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TYPE:</span>
                    <span className="font-bold">
                      {isFinalized ? receiptData.orderType : orderType}{' '}
                      {(isFinalized ? receiptData.cabinTableRef : tableRef) &&
                        `(${isFinalized ? receiptData.cabinTableRef : tableRef})`}
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
                  <div className="flex justify-between">
                    <span>PAYMENT:</span>
                    <span className="font-bold">
                      {isFinalized ? receiptData.paymentMethod || 'CASH' : 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Items Header */}
                <div className="py-1.5 border-b border-dashed border-zinc-400 flex justify-between font-bold text-[9px]">
                  <span>ITEM (QTY × RATE)</span>
                  <span>AMOUNT</span>
                </div>

                {/* Items List */}
                <div className="py-2 border-b border-dashed border-zinc-400 space-y-1.5">
                  {isFinalized ? (
                    receiptData.items && receiptData.items.length > 0 ? (
                      receiptData.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="font-bold">{item.name}</div>
                          <div className="flex justify-between text-zinc-600">
                            <span>
                              {item.quantity} × {formatCurrency(item.unitPrice)}
                            </span>
                            <span className="font-bold text-zinc-950 font-mono">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-zinc-400 italic">No items</div>
                    )
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="space-y-0.5">
                        <div className="font-bold">{item.name}</div>
                        <div className="flex justify-between text-zinc-600">
                          <span>
                            {item.quantity} × {formatCurrency(item.price)}
                          </span>
                          <span className="font-bold text-zinc-950 font-mono">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals */}
                <div className="py-2 border-b border-dashed border-zinc-400 space-y-1 text-[9px]">
                  <div className="flex justify-between text-zinc-600">
                    <span>SUBTOTAL:</span>
                    <span>{formatCurrency(isFinalized ? receiptData.subtotal : subtotal)}</span>
                  </div>
                  {((isFinalized && receiptData.discountAmount > 0) || (!isFinalized && discount > 0)) && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>DISCOUNT:</span>
                      <span>
                        -{formatCurrency(isFinalized ? receiptData.discountAmount : discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-600">
                    <span>
                      GST {isFinalized && receiptData.taxRate > 0 ? `(${receiptData.taxRate}%)` : ''}:
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

                {/* Footer Notice */}
                <div className="pt-2 text-center space-y-0.5 text-[9px] text-zinc-700">
                  <div className="font-bold">
                    {isFinalized && receiptData.footerText
                      ? receiptData.footerText
                      : '*** THANK YOU FOR VISITING! ***'}
                  </div>
                  <div className="text-[8px] text-zinc-500">
                    The Station Stories Restaurant
                  </div>
                  <div className="text-[7.5px] text-zinc-400 pt-0.5">
                    58mm Continuous Roll Thermal Receipt
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-lavender-50/70 border-t border-lavender-200 shrink-0">
          <div className="text-xs text-body-muted flex items-center gap-2">
            {pdfSuccess && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Downloaded 58mm PDF
              </span>
            )}
            {pdfError && (
              <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {pdfError}
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

            {/* 58mm PDF Download Button */}
            {isFinalized ? (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf || loading || Boolean(fetchError)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all disabled:opacity-50"
                title="Download 58mm Thermal Receipt as PDF"
              >
                {downloadingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                ) : (
                  <Download className="w-4 h-4 text-gold" />
                )}
                <span>{downloadingPdf ? 'Generating PDF...' : 'Download 58mm PDF'}</span>
              </button>
            ) : (
              <div
                className="px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-400 text-[11px] font-medium cursor-not-allowed select-none"
                title="PDF download is only available for finalized bills"
              >
                Draft Preview (No PDF)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
