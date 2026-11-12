import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Calendar,
  Globe,
  Clock,
  Info,
} from 'lucide-react';
import { getAuditLogs } from '../../services/adminApi';
import AuditLogDetailModal, {
  formatKolkataDateTime,
} from '../../components/admin/AuditLogDetailModal';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Client search within currently loaded page
  const [searchQuery, setSearchQuery] = useState('');

  // Selected audit log for detail modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch paginated audit logs from backend
  const fetchLogs = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const res = await getAuditLogs({ page, size });
        const data = res?.data || res;

        const content = Array.isArray(data?.content) ? data.content : [];
        setLogs(content);
        setTotalElements(data?.totalElements ?? content.length);
        setTotalPages(data?.totalPages ?? 1);
      } catch (err) {
        console.warn('Audit logs fetch failed:', err.message);
        setError(
          err?.message ||
            'Unable to retrieve compliance audit logs from server. Please verify connection.'
        );
        setLogs([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, size]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Page size change handler
  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0); // Reset to page 0 per pagination best practices
  };

  // Client-filtered logs (strictly scoped to currently loaded page)
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase().trim();
    return logs.filter((log) => {
      const idMatch = String(log.id).includes(q);
      const entityMatch = (log.entityName || '').toLowerCase().includes(q);
      const actionMatch = (log.action || '').toLowerCase().includes(q);
      const userMatch = (log.performedBy || '').toLowerCase().includes(q);
      const ipMatch = (log.ipAddress || '').toLowerCase().includes(q);
      const oldMatch = (log.oldValue || '').toLowerCase().includes(q);
      const newMatch = (log.newValue || '').toLowerCase().includes(q);
      return (
        idMatch ||
        entityMatch ||
        actionMatch ||
        userMatch ||
        ipMatch ||
        oldMatch ||
        newMatch
      );
    });
  }, [logs, searchQuery]);

  const handleOpenDetail = (log) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedLog(null);
  };

  const getActionBadgeColor = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (act.includes('CANCEL')) {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    if (act.includes('PRICE')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (act.includes('TAX') || act.includes('SETTING')) {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    }
    if (act.includes('STAFF') || act.includes('USER')) {
      return 'bg-sky-50 text-sky-800 border-sky-200';
    }
    return 'bg-lavender-100 text-plum-royal border-lavender-200';
  };

  const startRecord = totalElements === 0 ? 0 : page * size + 1;
  const endRecord = Math.min((page + 1) * size, totalElements);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-body-muted">
        <Link to="/admin" className="hover:text-plum-royal transition-colors">
          Admin Hub
        </Link>
        <span>/</span>
        <span className="text-plum-royal font-semibold">Audit Logs</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-lavender-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-plum-royal mb-1">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            <span>Regulatory Compliance Trail</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-plum-royal">
            Audit Logs
          </h1>
          <p className="text-xs text-body-muted mt-0.5">
            Chronological read-only record of administrative actions, price edits, cancellations, and logins
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Total Events Counter */}
          <div className="text-xs font-semibold text-plum-royal bg-white px-3.5 py-1.5 rounded-full border border-lavender-200 shadow-2xs font-mono">
            Total Events: <span className="text-gold-700">{totalElements}</span>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-lavender-200 text-xs">
            <span className="text-body-muted text-[11px]">Size:</span>
            <select
              value={size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              disabled={loading || refreshing}
              className="bg-transparent font-semibold text-plum-royal focus:outline-none cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => fetchLogs(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-lavender-100 text-plum-royal border border-lavender-200 text-xs font-semibold shadow-soft hover:shadow-sm transition-all disabled:opacity-50"
            aria-label="Refresh compliance audit trail"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-gold-600 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Logs'}</span>
          </button>
        </div>
      </div>

      {/* Honest Limitation & Search Notice Bar */}
      <div className="bg-white rounded-2xl p-4 border border-lavender-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Quick Filter on Current Page */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-body-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search on currently loaded page..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-ivory-50 border border-lavender-200 text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
          />
        </div>

        {/* Search Scope Context Banner */}
        <div className="text-[11px] text-body-muted flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-gold-600 shrink-0" />
          <span>
            Search filters current page records. Backend pagination navigates full history ({totalElements} events, Asia/Kolkata).
          </span>
        </div>
      </div>

      {/* Error Alert with Retry Action */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-muted/10 border border-rose-muted/30 text-plum-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-muted shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-base text-plum-royal">
                Unable to Load Compliance Audit Trail
              </h4>
              <p className="text-xs text-body-muted mt-0.5 font-light">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchLogs(false)}
            className="px-4 py-2 rounded-full bg-plum-royal text-ivory text-xs font-semibold hover:bg-plum-dark transition-colors self-start sm:self-auto shrink-0 shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Audit Logs Table Container */}
      <div className="bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden">
        {loading ? (
          /* Loading Skeleton */
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-lavender-200 rounded w-48 mb-6" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-12 bg-lavender-50 rounded-xl flex items-center px-4 justify-between"
              >
                <div className="h-3 bg-lavender-200 rounded w-16" />
                <div className="h-3 bg-lavender-200 rounded w-32" />
                <div className="h-3 bg-lavender-200 rounded w-24" />
                <div className="h-3 bg-lavender-200 rounded w-20" />
                <div className="h-3 bg-lavender-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-lavender-100 border border-gold/30 text-plum-royal flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-plum-royal" />
            </div>
            <h3 className="font-serif font-bold text-lg text-plum-royal">
              {searchQuery ? 'No Matching Events on this Page' : 'No Audit Records Found'}
            </h3>
            <p className="text-xs text-body-muted max-w-md mx-auto leading-relaxed font-light">
              {searchQuery
                ? `No event records match "${searchQuery}" in the currently loaded ${logs.length} page entries. Try clearing your search filter.`
                : 'No compliance audit records have been captured yet. Administrative operations will be chronologically logged here.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-lavender-100 text-plum-royal text-xs font-semibold hover:bg-lavender-200 transition-colors mt-2"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          /* Audit Logs Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-lavender-200 text-[11px] font-semibold text-body-muted uppercase tracking-wider bg-lavender-50/60">
                  <th className="py-3 px-4 font-mono w-16">ID</th>
                  <th className="py-3 px-4">Date & Time (IST)</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Change Preview</th>
                  <th className="py-3 px-4 font-mono">IP Address</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender-100">
                {filteredLogs.map((log) => {
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-lavender-50/40 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(log)}
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-plum-royal">
                        #{log.id}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-body">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                          <span>{formatKolkataDateTime(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-plum-royal block">
                          {log.entityName || '—'}
                        </span>
                        <span className="text-[10px] font-mono text-body-muted">
                          ID: {log.entityId ?? '—'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action || 'EVENT'}
                        </span>
                      </td>

                      {/* Performed By */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-body font-medium">
                          <User className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                          <span>{log.performedBy || 'SYSTEM'}</span>
                        </div>
                      </td>

                      {/* Change Preview */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-body-muted text-[11px] font-mono">
                        {log.newValue ? (
                          <span className="text-body truncate block">
                            {log.newValue.length > 45
                              ? `${log.newValue.substring(0, 45)}...`
                              : log.newValue}
                          </span>
                        ) : log.oldValue ? (
                          <span className="text-body-muted line-through truncate block">
                            {log.oldValue.length > 45
                              ? `${log.oldValue.substring(0, 45)}...`
                              : log.oldValue}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">None</span>
                        )}
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-4 font-mono text-body-muted whitespace-nowrap text-[11px]">
                        {log.ipAddress || '—'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(log);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-100 hover:bg-plum-royal text-plum-royal hover:text-ivory text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalElements > 0 && (
          <div className="p-4 bg-lavender-50/60 border-t border-lavender-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="text-body-muted font-mono">
              Showing <strong className="text-plum-royal">{startRecord}</strong> to{' '}
              <strong className="text-plum-royal">{endRecord}</strong> of{' '}
              <strong className="text-plum-royal">{totalElements}</strong> events · Page{' '}
              <strong className="text-plum-royal">{page + 1}</strong> of{' '}
              <strong className="text-plum-royal">{totalPages}</strong>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0 || loading || refreshing}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-lavender-100 text-plum-royal border border-lavender-200 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="px-3 py-1 bg-white rounded-full border border-lavender-200 font-mono text-plum-royal font-semibold text-xs shadow-2xs">
                {page + 1} / {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={page >= totalPages - 1 || loading || refreshing}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-lavender-100 text-plum-royal border border-lavender-200 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Detail Modal */}
      <AuditLogDetailModal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        log={selectedLog}
      />
    </div>
  );
}
