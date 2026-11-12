import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

/**
 * Keyboard Shortcuts Modal for Counter Staff
 * Displays rapid navigation and billing hotkeys.
 */
export default function PosShortcutsModal({ isOpen, onClose }) {
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

  const shortcuts = [
    { key: '/', desc: 'Focus product search bar immediately' },
    { key: 'Esc', desc: 'Close dialogs / blur search / deselect cart item' },
    { key: '+ or =', desc: 'Increase quantity of selected cart item (+1)' },
    { key: '- or _', desc: 'Decrease quantity of selected cart item (-1)' },
    { key: 'Del or Backspace', desc: 'Remove selected item from order cart' },
    { key: 'Alt + C', desc: 'Open confirmation dialog to clear cart' },
    { key: 'Alt + D', desc: 'Switch order mode to DINE-IN' },
    { key: 'Alt + T', desc: 'Switch order mode to TAKEAWAY' },
    { key: 'Alt + P', desc: 'Open Thermal Receipt preview modal' },
    { key: '?', desc: 'Toggle this keyboard shortcuts reference' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-dark/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-lavender-200 bg-lavender-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal">
              <Keyboard className="w-5 h-5 text-plum-royal" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-plum-royal">
                POS Keyboard Shortcuts
              </h3>
              <p className="text-[11px] text-body-muted">
                Fast keyboard counter operation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-body-muted hover:text-plum-royal hover:bg-lavender-100 transition-colors"
            aria-label="Close shortcuts guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-ivory-50 border border-lavender-200 text-xs"
            >
              <span className="text-body font-medium">{item.desc}</span>
              <kbd className="px-2 py-1 rounded-md bg-plum-royal text-ivory font-mono text-[11px] font-semibold shadow-xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end px-6 py-4 bg-lavender-50/70 border-t border-lavender-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
