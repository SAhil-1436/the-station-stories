import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Eye,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getBills } from '../../services/adminApi.js';
import BillDetailModal, { formatKolkataDateTime, formatCurrency } from '../../components/admin/BillDetailModal.jsx';
import CancelBillModal from '../../components/admin/CancelBillModal.jsx';

export default function BillsManagementPage() {
  // Query Filter State (Server-Side)
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  // Client-side in-page search (explicitly labeled for current page only)
  const [pageSearch, setPageSearch] = useState('');

  // Data & State
  const [bills, setBills] = useState([]);
  const [pageMetadata, setPageMetadata] = useState({
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [selectedBillForDetail, setSelectedBillForDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedBillForCancel, setSelectedBillForCancel] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Bills from API
  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size,
      };
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await getBills(params);
      const data = res?.data || res;

      const content = Array.isArray(data?.content) ? data.content : [];
      setBills(content);
      setPageMetadata({
        totalElements: data?.totalElements ?? content.length,
        totalPages: data?.totalPages ?? 1,
        number: data?.number ?? page,
        size: data?.size ?? size,
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load bills. Please verify your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, size, statusFilter, methodFilter, fromDate, toDate]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Handle Apply Filter Submission
  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(0); // Reset to first page when filters change
    fetchBills();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setStatusFilter('');
    setMethodFilter('');
    setFromDate('');
    setToDate('');
    setPageSearch('');
    setPage(0);
  };

  const hasActiveServerFilters = Boolean(
    statusFilter || methodFilter || fromDate || toDate
  );

  // Client-side in-page filtering
  const filteredPageBills = useMemo(() => {
    if (!pageSearch.trim()) return bills;
    const q = pageSearch.toLowerCase().trim();
    return bills.filter((b) => {
      const billNum = (b.billNumber || '').toLowerCase();
      const customer = (b.customerName || '').toLowerCase();
      const phone = (b.customerPhone || '').toLowerCase();
      const cashier = (b.cashierName || '').toLowerCase();
      return (
        billNum.includes(q) ||
        customer.includes(q) ||
        phone.includes(q) ||
        cashier.includes(q)
      );
    });
  }, [bills, pageSearch]);

  // Page Summary Metrics
  const pageMetrics = useMemo(() => {
    let paidCount = 0;
    let cancelledCount = 0;
    let revenueSum = 0;

    bills.forEach((b) => {
      if (b.paymentStatus === 'PAID') {
        paidCount += 1;
        revenueSum += Number(b.grandTotal || 0);
      } else if (b.paymentStatus === 'CANCELLED') {
        cancelledCount += 1;
      }
    });

    return {
      loadedCount: bills.length,
      paidCount,
      cancelledCount,
      revenueSum,
    };
  }, [bills]);

  // Open Detail Modal
  const handleOpenDetail = (bill) => {
    setSelectedBillForDetail(bill);
    setIsDetailModalOpen(true);
  };

  // Open Cancel Modal
  const handleOpenCancel = (bill) => {
    setSelectedBillForCancel(bill);
    setIsCancelModalOpen(true);
  };

  // Callback when bill is successfully cancelled
  const handleBillCancelled = (updatedBill) => {
    showToast(
      `Bill #${updatedBill.billNumber} has been authoritatively cancelled.`,
      'info'
    );
    // Refresh page data
    fetchBills();

    // If detail modal is open for this bill, update its contents
    if (selectedBillForDetail && selectedBillForDetail.id === updatedBill.id) {
      setSelectedBillForDetail(updatedBill);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-lavender-200 shadow-luxury animate-slideDown">
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold text-plum-royal">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-body-muted hover:text-plum-royal ml-2 text-base font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-body-muted">
        <Link to="/admin" className="hover:text-plum-royal transition-colors">
          Admin Hub
        </Link>
        <span>/</span>
        <span className="text-plum-royal font-semibold">Bills & Orders</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-lavender-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif font-bold text-2xl text-plum-royal">
              Bills & Orders Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold-700 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Immutable Invoices</span>
            </span>
          </div>
          <p className="text-xs text-body-muted mt-0.5">
            Historical bill audit, regulatory invoice tracking, and authoritative cancellation
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchBills}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-lavender-200 bg-white text-xs font-semibold text-plum-royal hover:bg-lavender-100 transition-colors disabled:opacity-50"
            title="Refresh Invoices"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Invoices in Database */}
        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">Total Database Records</span>
            <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center text-plum-royal">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-plum-royal mt-2">
            {pageMetadata.totalElements}
          </p>
          <span className="text-[11px] text-body-muted">Across all business dates</span>
        </div>

        {/* Paid on current view */}
        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">Paid Invoices (View)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-emerald-700 mt-2">
            {pageMetrics.paidCount}
          </p>
          <span className="text-[11px] text-body-muted">Successfully settled</span>
        </div>

        {/* Cancelled on current view */}
        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">Cancelled Invoices (View)</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-red-700 mt-2">
            {pageMetrics.cancelledCount}
          </p>
          <span className="text-[11px] text-body-muted">Audited cancellations</span>
        </div>

        {/* Paid Revenue on current view */}
        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">Paid Revenue (View)</span>
            <div className="w-8 h-8 rounded-xl bg-gold/15 text-gold-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-plum-royal mt-2">
            {formatCurrency(pageMetrics.revenueSum)}
          </p>
          <span className="text-[11px] text-body-muted">Sum of loaded settled bills</span>
        </div>
      </div>

      {/* Server-Side Query Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-lavender-100 pb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-plum-royal" />
            <h3 className="font-serif font-bold text-sm text-plum-royal">
              Server-Side Audit Query Filters
            </h3>
          </div>
          {hasActiveServerFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-plum-royal hover:underline flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Payment Status */}
          <div>
            <label className="block text-[11px] font-semibold text-plum-royal mb-1">
              Payment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-ivory-50 border border-lavender-200 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              <option value="">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-semibold text-plum-royal mb-1">
              Payment Method
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-ivory-50 border border-lavender-200 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-gold/50"
            >
              <option value="">All Methods</option>
              <option value="CASH">CASH</option>
              <option value="UPI">UPI</option>
              <option value="CARD">CARD</option>
              <option value="SPLIT">SPLIT</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-semibold text-plum-royal mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-ivory-50 border border-lavender-200 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-semibold text-plum-royal mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-ivory-50 border border-lavender-200 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          {/* Filter Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5 text-gold" />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>

        {/* Client-Side In-Page Search Bar */}
        <div className="pt-2 border-t border-lavender-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-body-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              placeholder="Filter current page by bill #, customer name, phone, or cashier..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-ivory-50 border border-lavender-200 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            {pageSearch && (
              <button
                onClick={() => setPageSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-body-muted hover:text-plum-royal"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-[11px] text-body-muted flex-shrink-0">
            Showing <b>{filteredPageBills.length}</b> on this page (Page {page + 1} of {Math.max(1, pageMetadata.totalPages)})
          </span>
        </div>
      </div>

      {/* Main Content Table Area */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="bg-white rounded-3xl border border-lavender-200 shadow-soft p-6 space-y-4">
          <div className="h-6 w-48 bg-lavender-100 rounded-lg animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 bg-ivory-50 rounded-2xl border border-lavender-200/60 animate-pulse flex items-center justify-between px-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-lavender-200/50" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-36 bg-lavender-200/60 rounded" />
                    <div className="h-3 w-24 bg-lavender-200/40 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-5 w-16 bg-lavender-200/50 rounded-full" />
                  <div className="h-7 w-20 bg-lavender-200/60 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-4 shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-plum-royal">
            Failed to Load Historical Bills
          </h3>
          <p className="text-xs text-body-muted max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchBills}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-plum-royal text-white text-xs font-semibold hover:bg-plum-dark transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredPageBills.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-lavender-200 p-12 text-center space-y-4 shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal mx-auto">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-lg text-plum-royal">
            {hasActiveServerFilters || pageSearch
              ? 'No Matching Bills Found'
              : 'No Bills Recorded in System'}
          </h3>
          <p className="text-xs text-body-muted max-w-md mx-auto leading-relaxed">
            {hasActiveServerFilters || pageSearch
              ? 'No invoices match the specified criteria. Try clearing or relaxing the date and status filters.'
              : 'As counter orders and tables are checked out in the billing system, finalized invoices will be logged here.'}
          </p>
          {(hasActiveServerFilters || pageSearch) && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-full border border-lavender-200 text-xs font-semibold text-plum-royal hover:bg-lavender-100 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        /* Bills Table */
        <div className="bg-white rounded-3xl border border-lavender-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-lavender-50/60 border-b border-lavender-200 text-[11px] font-semibold text-plum-royal uppercase tracking-wider">
                  <th className="py-3.5 px-5">Bill Number</th>
                  <th className="py-3.5 px-4">Date & Time (IST)</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">Method</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender-100 text-xs">
                {filteredPageBills.map((bill) => {
                  const isPaid = bill.paymentStatus === 'PAID';
                  const isCancelled = bill.paymentStatus === 'CANCELLED';
                  const isRefunded = bill.paymentStatus === 'REFUNDED';

                  return (
                    <tr
                      key={bill.id}
                      className={`hover:bg-ivory-50/70 transition-colors group ${
                        isCancelled ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Bill Number */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-plum-royal text-xs">
                            {bill.billNumber}
                          </span>
                        </div>
                        <span className="text-[10px] text-body-muted block font-mono truncate max-w-[140px]">
                          {bill.invoiceUuid}
                        </span>
                      </td>

                      {/* Date & Time (IST) */}
                      <td className="py-3.5 px-4">
                        <div className="text-body font-medium">
                          {formatKolkataDateTime(bill.createdAt)}
                        </div>
                        <span className="text-[10px] text-body-muted block">
                          Cashier: {bill.cashierName || 'Staff'}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-plum-royal">
                          {bill.customerName || 'Walk-in Guest'}
                        </div>
                        {bill.customerPhone ? (
                          <span className="text-[11px] text-body-muted block">
                            {bill.customerPhone}
                          </span>
                        ) : (
                          <span className="text-[10px] text-body-muted/70 italic block">
                            No contact
                          </span>
                        )}
                      </td>

                      {/* Order Type */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-lavender-100 text-plum-royal text-[10px] font-semibold">
                          {bill.orderType || 'DINE_IN'}
                        </span>
                        {bill.cabinTableRef && (
                          <span className="text-[10px] text-body-muted block mt-0.5">
                            {bill.cabinTableRef}
                          </span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-ivory-100 border border-lavender-200 text-plum-royal text-[10px] font-semibold">
                          {bill.paymentMethod || 'CASH'}
                        </span>
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-serif font-bold text-sm text-plum-royal block">
                          {formatCurrency(bill.grandTotal)}
                        </span>
                        {Number(bill.discountAmount) > 0 && (
                          <span className="text-[10px] text-emerald-700 block">
                            Disc: -{formatCurrency(bill.discountAmount)}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            PAID
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            CANCELLED
                          </span>
                        )}
                        {isRefunded && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            REFUNDED
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(bill)}
                            className="p-1.5 rounded-xl text-body-muted hover:text-plum-royal hover:bg-lavender-100 border border-transparent hover:border-lavender-200 transition-colors"
                            title="View Full Bill Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Cancel Action (Only for PAID bills) */}
                          {isPaid ? (
                            <button
                              type="button"
                              onClick={() => handleOpenCancel(bill)}
                              className="p-1.5 rounded-xl text-body-muted hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                              title="Authoritatively Cancel Bill"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="p-1.5 rounded-xl text-slate-300 cursor-not-allowed"
                              title={isCancelled ? 'Bill is already cancelled' : 'Not eligible for cancellation'}
                            >
                              <ShieldAlert className="w-4 h-4 opacity-40" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Toolbar */}
          <div className="px-6 py-4 bg-lavender-50/40 border-t border-lavender-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-body-muted">Show per page:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="px-2 py-1 bg-white border border-lavender-200 rounded-lg text-body text-xs focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-body-muted ml-2">
                Total records: <b>{pageMetadata.totalElements}</b>
              </span>
            </div>

            <div className="flex items-center gap-2 self-center sm:self-auto">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page <= 0 || isLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-lavender-200 bg-white text-plum-royal hover:bg-lavender-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-3 py-1 font-semibold text-plum-royal">
                Page {page + 1} of {Math.max(1, pageMetadata.totalPages)}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageMetadata.totalPages - 1, p + 1))}
                disabled={page >= pageMetadata.totalPages - 1 || isLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-lavender-200 bg-white text-plum-royal hover:bg-lavender-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Detail Modal */}
      <BillDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBillForDetail(null);
        }}
        bill={selectedBillForDetail}
        onOpenCancel={(bill) => {
          setIsDetailModalOpen(false);
          handleOpenCancel(bill);
        }}
      />

      {/* Authoritative Cancel Bill Modal */}
      <CancelBillModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedBillForCancel(null);
        }}
        bill={selectedBillForCancel}
        onCancelled={handleBillCancelled}
      />
    </div>
  );
}
