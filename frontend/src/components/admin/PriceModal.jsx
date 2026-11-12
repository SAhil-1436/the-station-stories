import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, IndianRupee, ShieldCheck } from 'lucide-react';
import { updateMenuPrice } from '../../services/adminApi.js';

export default function PriceModal({
  isOpen,
  onClose,
  dish = null,
  onSaved,
}) {
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dish) {
      setPrice(dish.price !== undefined ? String(dish.price) : '');
    } else {
      setPrice('');
    }
    setError('');
    setApiError(null);
  }, [dish, isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !dish) return null;

  const currentPrice = Number(dish.price || 0).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setError('');

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Price must be a valid positive amount greater than ₹0.00');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateMenuPrice(dish.id, numPrice);
      onSaved(updated);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to update price. Please try again.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-lavender-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal">
              <IndianRupee className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-plum-royal">
                Update Dish Price
              </h3>
              <p className="text-xs text-body-muted">Quick catalog pricing revision</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-body-muted hover:text-plum-royal hover:bg-lavender-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Dish Details Card */}
          <div className="p-4 rounded-2xl bg-ivory-50 border border-lavender-200 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-plum-royal text-sm">{dish.name}</h4>
              <p className="text-xs text-body-muted mt-0.5">
                {dish.categoryName || 'Menu Catalog'} &bull; #{dish.id}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-body-muted uppercase tracking-wider block">
                Current
              </span>
              <span className="font-serif font-bold text-base text-plum-royal">
                ₹{currentPrice}
              </span>
            </div>
          </div>

          {/* New Price Input */}
          <div>
            <label className="block text-xs font-semibold text-plum-royal mb-1.5">
              New Price (INR ₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body-muted font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.50"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 150.00"
                disabled={isSubmitting}
                autoFocus
                className={`w-full pl-8 pr-4 py-2.5 rounded-2xl text-sm font-semibold bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                  error
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-lavender-200 focus:border-gold'
                }`}
              />
            </div>
            {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
          </div>

          {/* Compliance & Snapshot Notice */}
          <div className="p-3 rounded-2xl bg-lavender-50 border border-lavender-200 text-xs text-body-muted flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-plum-royal flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              This price change takes effect immediately for guest and POS orders.
              All past invoices remain immutable with their captured snapshot pricing.
            </p>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-lavender-50/60 border-t border-lavender-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-plum-royal hover:bg-plum-dark shadow-soft transition-all disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Update Price</span>
          </button>
        </div>
      </div>
    </div>
  );
}
