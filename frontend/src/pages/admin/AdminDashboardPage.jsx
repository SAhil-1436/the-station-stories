import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Utensils,
  Layers,
  Receipt,
  Users,
  Settings,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';
import { getDashboardReport } from '../../services/adminApi';
import useAuth from '../../hooks/useAuth';
import DashboardKpiCard from '../../components/admin/DashboardKpiCard';
import PaymentMethodBreakdown from '../../components/admin/PaymentMethodBreakdown';
import BestsellersTable from '../../components/admin/BestsellersTable';
import HealthStatusBanner from '../../components/common/HealthStatusBanner';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // INR Currency Formatter
  const formatCurrency = useCallback((val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }, []);

  // Standard Number Formatter
  const formatNumber = useCallback((val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN').format(num);
  }, []);

  // Fetch dashboard metrics from existing Spring Boot endpoint
  const fetchMetrics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const reportData = await getDashboardReport();
      setData(reportData);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Dashboard report fetch failed:', err.message);
      setError(
        err.message || 'Unable to retrieve today’s sales metrics from backend server.'
      );
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load metrics once on component mount
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Today's formatted date string
  const todayDateString = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const moduleShortcuts = [
    { title: 'Menu Catalog', path: '/admin/menu', icon: Utensils, phase: 'Live' },
    { title: 'Categories', path: '/admin/categories', icon: Layers, phase: 'Live' },
    { title: 'Bills & Orders', path: '/admin/bills', icon: Receipt, phase: 'Live' },
    { title: 'Staff Accounts', path: '/admin/staff', icon: Users, phase: 'Live' },
    { title: 'Reports', path: '/admin/reports', icon: BarChart3, phase: 'Phase 4.7' },
    { title: 'Settings & GST', path: '/admin/settings', icon: Settings, phase: 'Live' },
    { title: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck, phase: 'Phase 4.7' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-lavender-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-plum-royal mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Store Operations Dashboard</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-plum-royal">
            Overview & Live KPIs
          </h1>
          <p className="text-xs text-body-muted mt-0.5">
            Operational sales metrics for <strong className="font-semibold text-plum-royal">{todayDateString}</strong>
          </p>
        </div>

        {/* Action Controls: Refresh & Last Updated */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {lastUpdated && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-body-muted font-mono bg-white px-3 py-1.5 rounded-full border border-lavender-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-gold-600" />
              <span>Refreshed: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          )}

          <button
            onClick={() => fetchMetrics(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-lavender-100 text-plum-royal border border-lavender-200 text-xs font-semibold shadow-soft hover:shadow-sm transition-all disabled:opacity-50"
            aria-label="Refresh today's sales metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gold-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert State with Retry Action */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-muted/10 border border-rose-muted/30 text-plum-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-muted shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-base text-plum-royal">
                Unable to Load Today’s Sales Metrics
              </h4>
              <p className="text-xs text-body-muted mt-0.5 font-light">
                {error} (Fabricated metrics are strictly suppressed).
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchMetrics(false)}
            className="px-4 py-2 rounded-full bg-plum-royal text-ivory text-xs font-semibold hover:bg-plum-dark transition-colors self-start sm:self-auto shrink-0 shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Primary KPI Row: 4 Essential Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Today's Total Sales */}
        <DashboardKpiCard
          title="Today's Total Sales"
          value={data ? formatCurrency(data.todayTotalSales) : '—'}
          subtitle="Net sales collected across all channels today"
          icon={IndianRupee}
          variant="primary"
          loading={loading}
        />

        {/* 2. Today's Order Count */}
        <DashboardKpiCard
          title="Orders Processed"
          value={data ? formatNumber(data.todayOrderCount) : '—'}
          subtitle={
            data
              ? `${formatNumber(data.todayPaidBills)} Paid · ${formatNumber(data.todayCancelledBills)} Cancelled`
              : 'Completed customer tickets'
          }
          icon={ShoppingBag}
          loading={loading}
        />

        {/* 3. Average Order Value */}
        <DashboardKpiCard
          title="Average Order Value"
          value={data ? formatCurrency(data.averageOrderValue) : '—'}
          subtitle="Average ticket size per settled order"
          icon={TrendingUp}
          loading={loading}
        />

        {/* 4. Settlement Completion Rate */}
        <DashboardKpiCard
          title="Settled Invoices"
          value={
            data
              ? `${formatNumber(data.todayPaidBills)} Bills`
              : '—'
          }
          subtitle={
            data && data.todayOrderCount > 0
              ? `${((data.todayPaidBills / data.todayOrderCount) * 100).toFixed(0)}% completion rate`
              : 'Zero cancellations recorded today'
          }
          icon={CheckCircle2}
          loading={loading}
        />
      </div>

      {/* Visual Analytics & Bestsellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Payment Method Visualizer (Cash vs UPI vs Other) */}
        <PaymentMethodBreakdown
          cashSales={data?.todayCashSales ?? 0}
          upiSales={data?.todayUpiSales ?? 0}
          otherSales={data?.todayOtherSales ?? 0}
          formatCurrency={formatCurrency}
          loading={loading}
        />

        {/* Right: Top 5 Bestselling Dishes */}
        <BestsellersTable
          items={data?.topSellingItems ?? []}
          formatCurrency={formatCurrency}
          loading={loading}
        />
      </div>

      {/* Module Quick Shortcuts */}
      <div className="bg-white rounded-2xl p-6 border border-lavender-200 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-plum-royal">
              Administrative Navigation
            </h3>
            <p className="text-xs text-body-muted font-light mt-0.5">
              Direct access to management modules (scheduled across upcoming phases)
            </p>
          </div>
          <span className="text-[11px] font-mono text-gold-700 bg-lavender-100 px-2.5 py-1 rounded-full">
            7 Modules Scoped
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {moduleShortcuts.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.path}
                to={mod.path}
                className="p-3 rounded-xl bg-lavender-50/60 hover:bg-lavender-100/80 border border-lavender-200 text-center flex flex-col items-center justify-between transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-lavender-200 flex items-center justify-center text-plum-royal group-hover:text-gold-700 mb-2 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-plum-royal block truncate w-full group-hover:text-plum-dark">
                  {mod.title}
                </span>
                <span className="text-[9px] font-mono text-body-muted mt-1">
                  {mod.phase}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Health Check Banner */}
      <div>
        <HealthStatusBanner />
      </div>
    </div>
  );
}
