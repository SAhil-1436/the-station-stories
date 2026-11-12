import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  Printer,
  Clock,
  AlertCircle,
  Banknote,
  QrCode,
  CreditCard,
  PieChart,
  Award,
  UtensilsCrossed,
  Info,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { getDashboardReport } from '../../services/adminApi';

export function formatKolkataDate(dateObj) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(dateObj);
  } catch {
    return String(dateObj);
  }
}

export function formatKolkataTime(dateObj) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(dateObj);
  } catch {
    return String(dateObj);
  }
}

export function formatCurrency(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN').format(num);
}

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch today's sales report metrics from Spring Boot backend
  const fetchReport = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await getDashboardReport();
      const reportData = res?.data || res;
      setData(reportData);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Daily sales report fetch failed:', err.message);
      setError(
        err?.message ||
          'Unable to retrieve today’s sales metrics from backend server. Please verify connection.'
      );
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  const todayDateString = formatKolkataDate(new Date());

  // Payment Calculations
  const cashSales = Number(data?.todayCashSales) || 0;
  const upiSales = Number(data?.todayUpiSales) || 0;
  const otherSales = Number(data?.todayOtherSales) || 0;
  const totalSales = Number(data?.todayTotalSales) || 0;

  // Safe percentage calculations (Division by zero guard)
  const cashPct = totalSales > 0 ? (cashSales / totalSales) * 100 : 0;
  const upiPct = totalSales > 0 ? (upiSales / totalSales) * 100 : 0;
  const otherPct = totalSales > 0 ? (otherSales / totalSales) * 100 : 0;

  const topSellingItems = Array.isArray(data?.topSellingItems)
    ? data.topSellingItems
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:p-0 print:space-y-4">
      {/* Print-Only Style Overrides */}
      <style>{`
        @media print {
          body, #root, .min-h-screen, main {
            background-color: #ffffff !important;
            color: #1a1a1a !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }
          nav, aside, header, footer, .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
          }
          .print-card {
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            break-inside: avoid;
            background: #ffffff !important;
          }
          .print-table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #e5e7eb !important;
            padding: 6px 10px !important;
            color: #1a1a1a !important;
          }
        }
      `}</style>

      {/* Screen-Only Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-body-muted print:hidden no-print">
        <Link to="/admin" className="hover:text-plum-royal transition-colors">
          Admin Hub
        </Link>
        <span>/</span>
        <span className="text-plum-royal font-semibold">Reports</span>
      </div>

      {/* Print Header (Visible only when printed) */}
      <div className="hidden print:block pb-4 mb-4 border-b-2 border-plum-royal">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold font-serif text-plum-royal tracking-tight">
              THE STATION STORIES
            </h1>
            <p className="text-xs text-gray-600 mt-0.5 uppercase tracking-wider">
              Daily Sales Summary & Register Report
            </p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p className="font-semibold text-gray-900">{todayDateString}</p>
            <p>Generated: {lastUpdated ? formatKolkataTime(lastUpdated) : '—'} (IST)</p>
            <p className="text-[10px] text-gray-500">Timezone: Asia/Kolkata</p>
          </div>
        </div>
      </div>

      {/* Screen Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-lavender-200 print:hidden no-print">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-plum-royal mb-1">
            <BarChart3 className="w-4 h-4 text-gold-600" />
            <span>Daily Register Reporting</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-plum-royal">
            Today's Sales Report
          </h1>
          <p className="text-xs text-body-muted mt-0.5">
            Operational register turnover for{' '}
            <strong className="font-semibold text-plum-royal">
              {todayDateString}
            </strong>{' '}
            <span className="text-[11px] font-mono text-gold-700 bg-lavender-100 px-2 py-0.5 rounded-full ml-1">
              Asia/Kolkata
            </span>
          </p>
        </div>

        {/* Action Controls: Refresh, Print, Timestamp */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {lastUpdated && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-body-muted font-mono bg-white px-3 py-1.5 rounded-full border border-lavender-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-gold-600" />
              <span>Refreshed: {formatKolkataTime(lastUpdated)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => fetchReport(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-lavender-100 text-plum-royal border border-lavender-200 text-xs font-semibold shadow-soft hover:shadow-sm transition-all disabled:opacity-50"
            aria-label="Refresh today's report"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-gold-600 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-plum-royal hover:bg-plum-dark text-ivory text-xs font-semibold shadow-soft hover:shadow-sm transition-all disabled:opacity-50"
            aria-label="Print daily report"
          >
            <Printer className="w-3.5 h-3.5 text-gold" />
            <span>Print Daily Report</span>
          </button>
        </div>
      </div>

      {/* Error Alert with Retry Action */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-muted/10 border border-rose-muted/30 text-plum-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft print:hidden no-print">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-muted shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-base text-plum-royal">
                Unable to Load Today’s Sales Report
              </h4>
              <p className="text-xs text-body-muted mt-0.5 font-light">
                {error} (Fabricated metrics are strictly suppressed).
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchReport(false)}
            className="px-4 py-2 rounded-full bg-plum-royal text-ivory text-xs font-semibold hover:bg-plum-dark transition-colors self-start sm:self-auto shrink-0 shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Section B: Sales KPI Cards (3 Core Metrics + Register Status) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Today's Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-lavender-200 shadow-soft print-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-body-muted">
              Today's Total Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal print:hidden">
              <IndianRupee className="w-4 h-4 text-gold-600" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl text-plum-royal">
            {data ? formatCurrency(data.todayTotalSales) : '—'}
          </div>
          <p className="text-[11px] text-body-muted mt-1 font-light">
            Gross revenue collected across all channels today
          </p>
        </div>

        {/* 2. Paid Bills */}
        <div className="bg-white rounded-2xl p-5 border border-lavender-200 shadow-soft print-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-body-muted">
              Paid Bills
            </span>
            <div className="w-8 h-8 rounded-lg bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal print:hidden">
              <ShoppingBag className="w-4 h-4 text-plum-royal" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl text-plum-royal">
            {data ? formatNumber(data.todayPaidBills) : '—'}
          </div>
          <p className="text-[11px] text-body-muted mt-1 font-light">
            Paid customer invoices recorded today
          </p>
        </div>

        {/* 3. Average Order Value */}
        <div className="bg-white rounded-2xl p-5 border border-lavender-200 shadow-soft print-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-body-muted">
              Average Order Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal print:hidden">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl text-plum-royal">
            {data ? formatCurrency(data.averageOrderValue) : '—'}
          </div>
          <p className="text-[11px] text-body-muted mt-1 font-light">
            Average ticket amount per paid bill
          </p>
        </div>

        {/* 4. Operational Register Scope */}
        <div className="bg-white rounded-2xl p-5 border border-lavender-200 shadow-soft print-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-body-muted">
              Register Scope
            </span>
            <div className="w-8 h-8 rounded-lg bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal print:hidden">
              <ShieldCheck className="w-4 h-4 text-plum-royal" />
            </div>
          </div>
          <div className="font-serif font-bold text-xl text-plum-royal flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse print:hidden" />
            <span>Single-Day (Today)</span>
          </div>
          <p className="text-[11px] text-body-muted mt-1 font-light">
            Scoped to {todayDateString} (Asia/Kolkata)
          </p>
        </div>
      </div>

      {/* Backend Metric Limitations Transparency Note */}
      <div className="px-4 py-3 rounded-2xl bg-ivory-100 border border-lavender-200 text-body-muted text-xs flex items-start gap-2.5 print:bg-white print:border-gray-300">
        <Info className="w-4 h-4 text-gold-600 shrink-0 mt-0.5 print:text-gray-700" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-plum-royal font-semibold">Reporting Limitations Note:</strong>{' '}
          Metrics reflect paid bills returned by the current backend register report. Cancellation and historical reconciliation metrics are not currently supported accurately. All figures reflect live paid transactions captured in the active database.
        </p>
      </div>

      {/* Section C: Payment Breakdown (Cash vs UPI vs Other) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-lavender-200 shadow-luxury space-y-5 print-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-lavender-100">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-gold-600 print:hidden" />
              <h3 className="font-serif font-bold text-lg text-plum-royal">
                Payment Channel Breakdown
              </h3>
            </div>
            <p className="text-xs text-body-muted mt-0.5 font-light">
              Distribution of today's customer payments across payment intake methods
            </p>
          </div>

          <div className="text-xs font-semibold text-plum-royal bg-lavender-100 px-3.5 py-1.5 rounded-full border border-gold/30 self-start sm:self-auto font-mono">
            Total Sales: {formatCurrency(totalSales)}
          </div>
        </div>

        {/* Visual Multi-segment Proportion Bar */}
        <div className="space-y-2">
          <div className="h-6 rounded-full bg-lavender-100 overflow-hidden flex shadow-inner border border-lavender-200">
            {totalSales > 0 ? (
              <>
                {cashPct > 0 && (
                  <div
                    style={{ width: `${cashPct}%` }}
                    className="bg-plum-royal transition-all duration-500"
                    title={`Cash: ${formatCurrency(cashSales)} (${cashPct.toFixed(1)}%)`}
                  />
                )}
                {upiPct > 0 && (
                  <div
                    style={{ width: `${upiPct}%` }}
                    className="bg-gold transition-all duration-500"
                    title={`UPI: ${formatCurrency(upiSales)} (${upiPct.toFixed(1)}%)`}
                  />
                )}
                {otherPct > 0 && (
                  <div
                    style={{ width: `${otherPct}%` }}
                    className="bg-rose-muted transition-all duration-500"
                    title={`Other: ${formatCurrency(otherSales)} (${otherPct.toFixed(1)}%)`}
                  />
                )}
              </>
            ) : (
              <div className="w-full flex items-center justify-center text-[10px] text-body-muted font-medium italic">
                No payment transactions recorded yet today
              </div>
            )}
          </div>

          {/* Proportional Percentage Text */}
          {totalSales > 0 && (
            <div className="flex items-center justify-between text-xs text-body font-mono px-1">
              <span className="text-plum-royal font-semibold">
                Cash: {cashPct.toFixed(1)}%
              </span>
              <span className="text-gold-700 font-semibold">
                UPI: {upiPct.toFixed(1)}%
              </span>
              <span className="text-rose-muted font-semibold">
                Other: {otherPct.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Channel Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* 1. Cash Sales */}
          <div className="p-4 rounded-2xl bg-lavender-50/60 border border-lavender-200 flex flex-col justify-between print-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-plum-royal flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-plum-royal" />
                <span>Cash Sales</span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-white border border-lavender-200 flex items-center justify-center text-plum-royal print:hidden">
                <Banknote className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <span className="font-serif text-xl font-bold text-plum-royal block">
                {formatCurrency(cashSales)}
              </span>
              <span className="text-[11px] font-mono text-gold-700 font-semibold">
                {cashPct.toFixed(1)}% of total sales
              </span>
            </div>
            <p className="text-[10px] text-body-muted font-light mt-1 border-t border-lavender-200/60 pt-1.5">
              Physical cash intake collected at cashier counter
            </p>
          </div>

          {/* 2. UPI Sales */}
          <div className="p-4 rounded-2xl bg-lavender-50/60 border border-lavender-200 flex flex-col justify-between print-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-plum-royal flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gold" />
                <span>UPI Sales</span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-white border border-lavender-200 flex items-center justify-center text-plum-royal print:hidden">
                <QrCode className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <span className="font-serif text-xl font-bold text-plum-royal block">
                {formatCurrency(upiSales)}
              </span>
              <span className="text-[11px] font-mono text-gold-700 font-semibold">
                {upiPct.toFixed(1)}% of total sales
              </span>
            </div>
            <p className="text-[10px] text-body-muted font-light mt-1 border-t border-lavender-200/60 pt-1.5">
              Digital dynamic UPI transactions settled via QR code
            </p>
          </div>

          {/* 3. Other Sales */}
          <div className="p-4 rounded-2xl bg-lavender-50/60 border border-lavender-200 flex flex-col justify-between print-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-plum-royal flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-muted" />
                <span>Other Payments</span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-white border border-lavender-200 flex items-center justify-center text-plum-royal print:hidden">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-1">
              <span className="font-serif text-xl font-bold text-plum-royal block">
                {formatCurrency(otherSales)}
              </span>
              <span className="text-[11px] font-mono text-gold-700 font-semibold">
                {otherPct.toFixed(1)}% of total sales
              </span>
            </div>
            <p className="text-[10px] text-body-muted font-light mt-1 border-t border-lavender-200/60 pt-1.5">
              Aggregated total of non-Cash and non-UPI payment methods
            </p>
          </div>
        </div>
      </div>

      {/* Section D: Top Selling Items Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-lavender-200 shadow-luxury space-y-4 print-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-lavender-100">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-600 print:hidden" />
              <h3 className="font-serif font-bold text-lg text-plum-royal">
                Top Selling Menu Items
              </h3>
            </div>
            <p className="text-xs text-body-muted mt-0.5 font-light">
              Ranked dish velocities and revenue generation from today's paid bills
            </p>
          </div>

          {topSellingItems.length > 0 && (
            <span className="text-xs font-semibold text-plum-royal bg-lavender-100 px-3 py-1 rounded-full border border-gold/30 self-start sm:self-auto">
              {topSellingItems.length} Ranked Items
            </span>
          )}
        </div>

        {topSellingItems.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl bg-lavender-50/50 border border-lavender-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-lavender-100 border border-gold/30 text-plum-royal flex items-center justify-center mx-auto print:hidden">
              <UtensilsCrossed className="w-6 h-6 text-plum-royal/70" />
            </div>
            <h4 className="font-serif font-bold text-base text-plum-royal">
              No Item Sales Recorded Yet Today
            </h4>
            <p className="text-xs text-body-muted max-w-md mx-auto leading-relaxed font-light">
              As customer orders are finalized at the register or through table invoices, the highest-volume dishes and beverages will automatically rank here with their sales volumes and revenues.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse print-table">
              <thead>
                <tr className="border-b border-lavender-200 text-[11px] font-semibold text-body-muted uppercase tracking-wider bg-lavender-50/60 print:bg-gray-100">
                  <th className="py-3 px-3.5 rounded-l-xl w-14">Rank</th>
                  <th className="py-3 px-4">Menu Item Name</th>
                  <th className="py-3 px-4 text-center">Quantity Sold</th>
                  <th className="py-3 px-4 text-right">Average Revenue per Item</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender-100">
                {topSellingItems.map((item, index) => {
                  const isTop1 = index === 0;
                  const unitAvg =
                    item.quantitySold > 0
                      ? Number(item.totalRevenue) / Number(item.quantitySold)
                      : 0;

                  return (
                    <tr
                      key={item.itemName || index}
                      className="hover:bg-lavender-50/40 transition-colors"
                    >
                      <td className="py-3.5 px-3.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isTop1
                              ? 'bg-plum-royal text-gold border border-gold print:bg-gray-800 print:text-white'
                              : 'bg-lavender-100 text-plum-royal print:bg-gray-100'
                          }`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-plum-royal">
                        {item.itemName}
                        {isTop1 && (
                          <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-gold/20 text-gold-800 font-normal print:hidden">
                            Top Seller
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-body">
                        {formatNumber(item.quantitySold)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-body-muted">
                        {formatCurrency(unitAvg)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-plum-royal">
                        {formatCurrency(item.totalRevenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section E: Printable Operational Notice (Printed at bottom) */}
      <div className="p-4 rounded-2xl bg-lavender-50 border border-lavender-200 text-body-muted text-xs space-y-1 print:bg-white print:border-gray-300">
        <p className="font-semibold text-plum-royal">
          Internal Operational Report Disclaimer:
        </p>
        <p className="text-[11px] leading-relaxed">
          This document is an internal operational daily sales summary generated from active register transactions for the specified date in Asia/Kolkata. This document is not an official tax invoice or audited financial statement.
        </p>
      </div>
    </div>
  );
}
