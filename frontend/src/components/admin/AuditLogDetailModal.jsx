import React, { useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  User,
  Layers,
  Globe,
  ArrowRight,
  ShieldAlert,
  FileText,
  Copy,
  Check,
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
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(d);
  } catch (e) {
    return String(isoString);
  }
}

export function formatLogValue(val) {
  if (val === null || val === undefined || val === '') return null;
  try {
    const parsed = JSON.parse(val);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return String(val);
  }
}

export default function AuditLogDetailModal({ isOpen, onClose, log = null }) {
  const [copiedField, setCopiedField] = React.useState(null);

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

  if (!isOpen || !log) return null;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedOld = formatLogValue(log.oldValue);
  const formattedNew = formatLogValue(log.newValue);

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

  return (
    <div
      className="fixed inset-0 z-50 bg-plum-dark/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-lavender-200 shadow-2xl p-6 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-lavender-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 border border-gold/40 flex items-center justify-center text-plum-royal">
              <ShieldCheck className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-plum-royal">
                  Audit Event #{log.id}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${getActionBadgeColor(
                    log.action
                  )}`}
                >
                  {log.action || 'EVENT'}
                </span>
              </div>
              <p className="text-xs text-body-muted mt-0.5">
                Recorded {formatKolkataDateTime(log.createdAt)} (Asia/Kolkata)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ivory-100 hover:bg-lavender-100 text-body-muted hover:text-plum-royal flex items-center justify-center transition-colors"
            aria-label="Close detail modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-lavender-50/50 p-4 rounded-2xl border border-lavender-200">
          <div>
            <span className="text-[10px] font-semibold uppercase text-body-muted tracking-wider block">
              Entity Target
            </span>
            <span className="text-xs font-semibold text-plum-royal block mt-0.5">
              {log.entityName || '—'}
            </span>
            <span className="text-[10px] font-mono text-body-muted">
              ID: {log.entityId ?? '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-body-muted tracking-wider block">
              Performed By
            </span>
            <span className="text-xs font-semibold text-plum-royal flex items-center gap-1 mt-0.5">
              <User className="w-3 h-3 text-gold-600" />
              <span>{log.performedBy || 'SYSTEM'}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-body-muted tracking-wider block">
              Client IP Address
            </span>
            <span className="text-xs font-mono font-semibold text-plum-royal block mt-0.5">
              {log.ipAddress || '—'}
            </span>
            <span className="text-[9px] text-body-muted">
              {log.ipAddress ? 'Logged IP' : 'Unavailable'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase text-body-muted tracking-wider block">
              Interface Access
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-plum-royal mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Read-Only</span>
            </span>
            <span className="text-[9px] text-body-muted block">Admin View</span>
          </div>
        </div>

        {/* Value Comparison: Old Value vs New Value */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-plum-royal flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gold-600" />
              <span>State Delta & Value Payloads</span>
            </h4>
            <span className="text-[11px] text-body-muted">
              Safely escaped textual snapshot
            </span>
          </div>

          {/* Old Value */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-plum-royal flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-muted" />
                <span>Previous State (Old Value)</span>
              </label>
              {formattedOld && (
                <button
                  type="button"
                  onClick={() => handleCopy(formattedOld, 'old')}
                  className="text-[11px] text-gold-700 hover:text-plum-royal inline-flex items-center gap-1 transition-colors"
                >
                  {copiedField === 'old' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {formattedOld ? (
              <pre className="text-xs font-mono p-4 rounded-2xl bg-ivory-50 border border-lavender-200 text-body whitespace-pre-wrap break-all overflow-x-auto max-h-52 leading-relaxed">
                {formattedOld}
              </pre>
            ) : (
              <div className="text-xs text-body-muted italic p-3 rounded-xl bg-ivory-50 border border-lavender-200">
                None (Initial record creation or invariant operation with no preceding state)
              </div>
            )}
          </div>

          {/* New Value */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-plum-royal flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Updated State (New Value)</span>
              </label>
              {formattedNew && (
                <button
                  type="button"
                  onClick={() => handleCopy(formattedNew, 'new')}
                  className="text-[11px] text-gold-700 hover:text-plum-royal inline-flex items-center gap-1 transition-colors"
                >
                  {copiedField === 'new' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {formattedNew ? (
              <pre className="text-xs font-mono p-4 rounded-2xl bg-ivory-50 border border-lavender-200 text-body whitespace-pre-wrap break-all overflow-x-auto max-h-52 leading-relaxed">
                {formattedNew}
              </pre>
            ) : (
              <div className="text-xs text-body-muted italic p-3 rounded-xl bg-ivory-50 border border-lavender-200">
                None (No updated value payload recorded)
              </div>
            )}
          </div>
        </div>

        {/* Read-Only Notice */}
        <div className="p-3.5 rounded-2xl bg-lavender-50/70 border border-lavender-200 text-body-muted text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-plum-royal shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-plum-royal font-semibold">Audit Record Notice:</strong> Audit records are presented as a read-only history in this admin interface. Edit and delete controls are intentionally suppressed. Backend-level tamper-proof or cryptographic verification is not currently implemented.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-plum-royal hover:bg-plum-dark text-ivory text-xs font-semibold transition-colors shadow-soft"
          >
            Close Audit Event
          </button>
        </div>
      </div>
    </div>
  );
}
