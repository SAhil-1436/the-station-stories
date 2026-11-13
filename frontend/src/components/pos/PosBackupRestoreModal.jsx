import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Loader2,
  Save,
} from 'lucide-react';
import { posDb } from '../../db/posDatabase';
import { performBackupToStorage, restoreBackupFromContent } from '../../utils/backupRestore';

/**
 * POS USB Backup & Restore Modal
 * Implements offline data protection with SHA-256 cryptographic checksums.
 */
export default function PosBackupRestoreModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('BACKUP'); // 'BACKUP' | 'RESTORE'
  const [localStats, setLocalStats] = useState({ bills: 0, unsynced: 0, items: 0 });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  // Restore State
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStats();
      setFeedback(null);
      setError(null);
      setSelectedFile(null);
    }
  }, [isOpen]);

  const loadStats = async () => {
    try {
      const [bills, unsynced, items] = await Promise.all([
        posDb.localBills.count(),
        posDb.syncQueue.where('status').anyOf(['PENDING', 'FAILED']).count(),
        posDb.localBillItems.count(),
      ]);
      setLocalStats({ bills, unsynced, items });
    } catch (e) {
      console.error('Error loading stats:', e);
    }
  };

  if (!isOpen) return null;

  const handleBackup = async () => {
    setLoading(true);
    setFeedback(null);
    setError(null);
    try {
      const result = await performBackupToStorage();
      setFeedback({
        type: 'success',
        message: `Backup created successfully! File: ${result.pathOrFilename}`,
        checksum: result.meta?.checksum,
        method: result.usedFileSystemApi ? 'Direct USB / Directory Write' : 'Browser Download',
      });
      loadStats();
    } catch (err) {
      setError(err.message || 'Failed to generate backup.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFeedback(null);
      setError(null);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setFeedback(null);
    setError(null);

    try {
      const content = await selectedFile.text();
      const result = await restoreBackupFromContent(content);
      setFeedback({
        type: 'success',
        message: result.message,
        checksum: result.backupMeta?.sha256,
      });
      setSelectedFile(null);
      setRestoreConfirmOpen(false);
      loadStats();
    } catch (err) {
      setError(err.message || 'Restoration failed. File may be corrupted or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-plum-dark/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-lavender-200 bg-lavender-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-plum-royal text-gold flex items-center justify-center shadow-xs">
              <HardDrive className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-plum-royal">
                USB Backup & Restore
              </h2>
              <p className="text-[11px] text-body-muted">
                SHA-256 integrity-protected offline database archive
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-body-muted hover:text-plum-royal hover:bg-lavender-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 bg-lavender-50/40 border-b border-lavender-200 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('BACKUP');
              setFeedback(null);
              setError(null);
            }}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'BACKUP'
                ? 'border-plum-royal text-plum-royal bg-white shadow-xs'
                : 'border-transparent text-body-muted hover:text-plum-royal'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Create Backup (USB / Disk)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('RESTORE');
              setFeedback(null);
              setError(null);
            }}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'RESTORE'
                ? 'border-plum-royal text-plum-royal bg-white shadow-xs'
                : 'border-transparent text-body-muted hover:text-plum-royal'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore from File</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-lavender-50/30 text-xs">
          {feedback && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedback.message}</span>
              </div>
              {feedback.checksum && (
                <div className="text-[10px] text-emerald-800 font-mono break-all pt-1">
                  SHA-256: {feedback.checksum}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Error</span>
              </div>
              <p className="text-[11px] text-red-800 leading-relaxed whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {activeTab === 'BACKUP' ? (
            /* BACKUP TAB */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-lavender-200 shadow-xs space-y-3">
                <div className="font-semibold text-plum-royal text-sm flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-gold" />
                  <span>Local Data Summary for Export</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-lavender-50 border border-lavender-200">
                    <span className="text-[10px] text-body-muted block">Local Bills</span>
                    <span className="font-mono font-bold text-base text-plum-royal">{localStats.bills}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-lavender-50 border border-lavender-200">
                    <span className="text-[10px] text-body-muted block">Line Items</span>
                    <span className="font-mono font-bold text-base text-plum-royal">{localStats.items}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-lavender-50 border border-lavender-200">
                    <span className="text-[10px] text-body-muted block">Pending Sync</span>
                    <span className="font-mono font-bold text-base text-plum-royal">{localStats.unsynced}</span>
                  </div>
                </div>
                <p className="text-[11px] text-body-muted leading-relaxed">
                  Export includes all offline cash transactions, snapshot dish items, and pending sync queue items.
                  An encrypted SHA-256 checksum is calculated and embedded for tamper detection.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-lavender-50/80 border border-lavender-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-plum-royal text-xs">Direct USB Storage</div>
                  <div className="text-[10.5px] text-body-muted">
                    If prompted, select your USB flash drive or local backup folder.
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleBackup}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-plum-royal hover:bg-plum-dark text-white font-semibold text-xs shadow-soft transition-all disabled:opacity-50 active:scale-95 shrink-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                      <span>Exporting Data...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-gold" />
                      <span>Export Backup</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* RESTORE TAB */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-lavender-200 shadow-xs space-y-3">
                <div className="font-semibold text-plum-royal text-sm flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-gold" />
                  <span>Import & Verify Backup Package</span>
                </div>
                <p className="text-[11px] text-body-muted leading-relaxed">
                  Select a valid <code>.json</code> backup file generated by Station Stories POS.
                  The cryptographic SHA-256 checksum will be verified against the data content before any database modifications occur.
                </p>

                <div className="p-4 rounded-2xl border-2 border-dashed border-lavender-300 bg-lavender-50/50 text-center space-y-2">
                  <input
                    type="file"
                    accept=".json"
                    id="pos-backup-file-input"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="pos-backup-file-input"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-lavender-200 text-plum-royal font-semibold text-xs shadow-xs hover:bg-lavender-50 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-gold" />
                    <span>{selectedFile ? 'Select Different File' : 'Browse JSON Backup File'}</span>
                  </label>
                  {selectedFile && (
                    <div className="text-[11px] font-mono text-plum-royal pt-1">
                      Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>

              {selectedFile && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
                  <div className="font-semibold flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Confirmation Required</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Restoring records will merge archived offline bills into your IndexedDB store without overwriting existing entries.
                  </p>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleRestore}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-soft transition-all disabled:opacity-50 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Verifying & Restoring...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Verify Checksum & Restore</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-lavender-50/70 border-t border-lavender-200 flex justify-end shrink-0">
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
  );
}
