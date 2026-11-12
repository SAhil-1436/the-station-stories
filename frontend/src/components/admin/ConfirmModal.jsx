import React, { useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

/**
 * Reusable Confirmation Dialog Modal
 * Designed for destructive or consequential actions (e.g., category deletion, bill cancellation).
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary'
  isLoading = false,
  errorMessage = null,
  warningNote = null,
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-dark/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                confirmVariant === 'danger'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-lavender-100 text-plum-royal border border-gold/30'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-plum-royal">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-body-muted hover:text-plum-royal hover:bg-lavender-100 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-4 space-y-3">
          {message && (
            <p className="text-sm text-body leading-relaxed">{message}</p>
          )}

          {warningNote && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{warningNote}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-lavender-50/60 border-t border-lavender-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white shadow-soft transition-all disabled:opacity-50 ${
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-plum-royal hover:bg-plum-dark'
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
