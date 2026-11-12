import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Layers,
  Utensils,
  Coffee,
  Pizza,
  Sandwich,
  Sparkles,
  Flame,
  Wine,
  Soup,
  Cake,
  IceCream,
  Beer,
  Salad,
  Cookie,
  Apple,
} from 'lucide-react';
import { createCategory, updateCategory } from '../../services/adminApi.js';

export const CATEGORY_ICONS = [
  { name: 'Sandwich', icon: Sandwich, label: 'Sandwich' },
  { name: 'Pizza', icon: Pizza, label: 'Pizza' },
  { name: 'Utensils', icon: Utensils, label: 'Utensils' },
  { name: 'Coffee', icon: Coffee, label: 'Beverage / Coffee' },
  { name: 'Sparkles', icon: Sparkles, label: 'Special / Chaat' },
  { name: 'Flame', icon: Flame, label: 'Spicy / Grill' },
  { name: 'Wine', icon: Wine, label: 'Wine / Drinks' },
  { name: 'Soup', icon: Soup, label: 'Soup / Bowls' },
  { name: 'Cake', icon: Cake, label: 'Bakery / Cake' },
  { name: 'IceCream', icon: IceCream, label: 'Dessert' },
  { name: 'Beer', icon: Beer, label: 'Brew' },
  { name: 'Salad', icon: Salad, label: 'Salad / Greens' },
  { name: 'Cookie', icon: Cookie, label: 'Snacks / Bites' },
  { name: 'Apple', icon: Apple, label: 'Fresh Fruits' },
  { name: 'Layers', icon: Layers, label: 'General Hierarchy' },
];

export function getCategoryIconComponent(iconName) {
  const match = CATEGORY_ICONS.find((item) => item.name === iconName);
  return match ? match.icon : Layers;
}

export default function CategoryModal({
  isOpen,
  onClose,
  category = null, // null for create, object for edit
  onSaved,
}) {
  const isEditing = Boolean(category && category.id);

  const [formData, setFormData] = useState({
    name: '',
    hindiName: '',
    displayOrder: 0,
    isActive: true,
    iconName: 'Utensils',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        hindiName: category.hindiName || '',
        displayOrder: category.displayOrder ?? 0,
        isActive: category.isActive !== undefined ? Boolean(category.isActive) : true,
        iconName: category.iconName || 'Utensils',
      });
    } else {
      setFormData({
        name: '',
        hindiName: '',
        displayOrder: 0,
        isActive: true,
        iconName: 'Utensils',
      });
    }
    setErrors({});
    setApiError(null);
  }, [category, isOpen]);

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

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Category name cannot exceed 100 characters';
    }

    if (formData.displayOrder === '' || isNaN(Number(formData.displayOrder)) || Number(formData.displayOrder) < 0) {
      newErrors.displayOrder = 'Display order must be 0 or a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        hindiName: formData.hindiName.trim() || null,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
        isActive: Boolean(formData.isActive),
        iconName: formData.iconName || 'Utensils',
      };

      let result;
      if (isEditing) {
        result = await updateCategory(category.id, payload);
      } else {
        result = await createCategory(payload);
      }

      onSaved(result);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to save category. Please check your connection and try again.';
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
        className="w-full max-w-lg bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-lavender-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-plum-royal">
                {isEditing ? 'Edit Category' : 'Create Category'}
              </h3>
              <p className="text-xs text-body-muted">
                {isEditing
                  ? `Updating #${category.id} – ${category.name}`
                  : 'Define a new menu catalog section'}
              </p>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          {apiError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Unable to save category</p>
                <p className="mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-plum-royal mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Burgers & Sandwiches"
              maxLength={100}
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                errors.name
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-lavender-200 focus:border-gold'
              }`}
            />
            {errors.name ? (
              <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>
            ) : (
              <p className="text-[11px] text-body-muted mt-1">Maximum 100 characters</p>
            )}
          </div>

          {/* Hindi Name Field */}
          <div>
            <label className="block text-xs font-semibold text-plum-royal mb-1.5">
              Hindi Name (Optional)
            </label>
            <input
              type="text"
              value={formData.hindiName}
              onChange={(e) => setFormData({ ...formData, hindiName: e.target.value })}
              placeholder="e.g. बर्गर और सैंडविच"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body font-hindi focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
            />
            <p className="text-[11px] text-body-muted mt-1">
              Devanagari script displayed alongside English name on bilingual guest menus
            </p>
          </div>

          {/* Display Order & Active Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                Display Order Sequence
              </label>
              <input
                type="number"
                min={0}
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                  errors.displayOrder
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-lavender-200 focus:border-gold'
                }`}
              />
              {errors.displayOrder ? (
                <p className="text-[11px] text-red-600 mt-1">{errors.displayOrder}</p>
              ) : (
                <p className="text-[11px] text-body-muted mt-1">Lower numbers appear first</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                Catalog Status
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-ivory-50 border border-lavender-200">
                <span className="text-xs font-medium text-body">
                  {formData.isActive ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Active Catalog
                    </span>
                  ) : (
                    <span className="text-body-muted flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                      Hidden / Inactive
                    </span>
                  )}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={isSubmitting}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plum-royal"></div>
                </label>
              </div>
              <p className="text-[11px] text-body-muted mt-1">Controls public customer visibility</p>
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-plum-royal mb-1.5">
              Category Icon
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 border border-lavender-200 rounded-2xl bg-ivory-50/50">
              {CATEGORY_ICONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = formData.iconName === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, iconName: opt.name })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-plum-royal text-gold shadow-soft border border-gold/40'
                        : 'bg-white hover:bg-lavender-100 text-body-muted hover:text-plum-royal border border-lavender-200/60'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-medium truncate w-full">
                      {opt.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-body-muted mt-1">
              Selected icon will be rendered on the digital QR menu and POS navigation
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
            <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
