import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Utensils,
  Flame,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { createMenuItem, updateMenuItem } from '../../services/adminApi.js';

export default function DishModal({
  isOpen,
  onClose,
  dish = null,
  categories = [],
  onSaved,
}) {
  const isEditing = Boolean(dish && dish.id);

  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    hindiName: '',
    description: '',
    price: '',
    isVeg: true,
    isAvailable: true,
    imageUrl: '',
    isOriginalImage: false,
    spiceLevel: 0,
    displayOrder: 0,
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dish) {
      setFormData({
        categoryId: dish.categoryId ? String(dish.categoryId) : '',
        name: dish.name || '',
        hindiName: dish.hindiName || '',
        description: dish.description || '',
        price: dish.price !== undefined ? String(dish.price) : '',
        isVeg: dish.veg !== undefined ? Boolean(dish.veg) : (dish.isVeg !== undefined ? Boolean(dish.isVeg) : true),
        isAvailable: dish.available !== undefined ? Boolean(dish.available) : (dish.isAvailable !== undefined ? Boolean(dish.isAvailable) : true),
        imageUrl: dish.imageUrl || '',
        isOriginalImage: dish.originalImage !== undefined ? Boolean(dish.originalImage) : (dish.isOriginalImage !== undefined ? Boolean(dish.isOriginalImage) : false),
        spiceLevel: dish.spiceLevel ?? 0,
        displayOrder: dish.displayOrder ?? 0,
      });
    } else {
      setFormData({
        categoryId: categories.length > 0 ? String(categories[0].id) : '',
        name: '',
        hindiName: '',
        description: '',
        price: '',
        isVeg: true,
        isAvailable: true,
        imageUrl: '',
        isOriginalImage: false,
        spiceLevel: 0,
        displayOrder: 0,
      });
    }
    setErrors({});
    setApiError(null);
  }, [dish, categories, isOpen]);

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

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a menu category';
    }

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Dish name is required';
    } else if (formData.name.trim().length > 150) {
      newErrors.name = 'Dish name cannot exceed 150 characters';
    }

    const numPrice = parseFloat(formData.price);
    if (!formData.price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Price must be greater than ₹0.00';
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
        categoryId: Number(formData.categoryId),
        name: formData.name.trim(),
        hindiName: formData.hindiName.trim() || null,
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        isVeg: Boolean(formData.isVeg),
        isAvailable: Boolean(formData.isAvailable),
        imageUrl: formData.imageUrl.trim() || null,
        isOriginalImage: Boolean(formData.isOriginalImage),
        spiceLevel: parseInt(formData.spiceLevel, 10) || 0,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
      };

      let result;
      if (isEditing) {
        result = await updateMenuItem(dish.id, payload);
      } else {
        result = await createMenuItem(payload);
      }

      onSaved(result);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to save dish item. Please check your inputs.';
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
        className="w-full max-w-2xl bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden animate-scaleUp max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-lavender-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal">
              <Utensils className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-plum-royal">
                {isEditing ? 'Edit Dish Details' : 'Register New Dish'}
              </h3>
              <p className="text-xs text-body-muted">
                {isEditing
                  ? `Updating #${dish.id} – ${dish.name}`
                  : 'Add a culinary recipe to the restaurant catalog'}
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
                <p className="font-semibold">Unable to save dish item</p>
                <p className="mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          {/* Category & Display Order Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                Category Section <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                  errors.categoryId
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-lavender-200 focus:border-gold'
                }`}
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.hindiName ? `(${c.hindiName})` : ''}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-[11px] text-red-600 mt-1">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
              />
              <p className="text-[11px] text-body-muted mt-1">
                Sequence order inside this category
              </p>
            </div>
          </div>

          {/* Dish Name (English) & Hindi Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                Dish Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Gourmet Veg Cheese Burger"
                maxLength={150}
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
                <p className="text-[11px] text-body-muted mt-1">Max 150 characters</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                Hindi Name (Optional)
              </label>
              <input
                type="text"
                value={formData.hindiName}
                onChange={(e) => setFormData({ ...formData, hindiName: e.target.value })}
                placeholder="e.g. वेज चीज़ बर्गर"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body font-hindi focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
              />
              <p className="text-[11px] text-body-muted mt-1">Devanagari script for bilingual menu</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-plum-royal mb-1.5">
              Dish Description & Ingredients
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Crispy vegetable patty topped with melted cheddar, lettuce, tomatoes, and house garlic mayonnaise..."
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none"
            />
          </div>

          {/* Price, Dietary Type & Spice Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                Price (INR ₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-muted font-semibold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.50"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="120.00"
                  disabled={isSubmitting}
                  className={`w-full pl-8 pr-3 py-2.5 rounded-2xl text-xs font-semibold bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                    errors.price
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-lavender-200 focus:border-gold'
                  }`}
                />
              </div>
              {errors.price && (
                <p className="text-[11px] text-red-600 mt-1">{errors.price}</p>
              )}
            </div>

            {/* Food Type: Veg / Non-Veg */}
            <div>
              <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                Food Classification
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-ivory-50 border border-lavender-200 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVeg: true })}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                    formData.isVeg
                      ? 'bg-emerald-600 text-white shadow-soft'
                      : 'text-body-muted hover:text-plum-royal'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded border border-white flex items-center justify-center bg-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  </span>
                  <span>Veg</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVeg: false })}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                    !formData.isVeg
                      ? 'bg-red-600 text-white shadow-soft'
                      : 'text-body-muted hover:text-plum-royal'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded border border-white flex items-center justify-center bg-white">
                    <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-600"></span>
                  </span>
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>

            {/* Spice Level */}
            <div>
              <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                Spice Intensity
              </label>
              <div className="flex items-center justify-between p-1 bg-ivory-50 border border-lavender-200 rounded-2xl">
                {[0, 1, 2, 3].map((level) => {
                  const labels = ['Mild', 'Med', 'Hot', 'Extra'];
                  const isSelected = Number(formData.spiceLevel) === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, spiceLevel: level })}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold transition-all text-center ${
                        isSelected
                          ? 'bg-plum-royal text-gold shadow-soft'
                          : 'text-body-muted hover:text-plum-royal'
                      }`}
                    >
                      {labels[level]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Availability and Authentic Photo Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Availability */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-ivory-50 border border-lavender-200">
              <div>
                <p className="text-xs font-semibold text-plum-royal">
                  Item Availability (In Stock)
                </p>
                <p className="text-[11px] text-body-muted">
                  {formData.isAvailable ? 'Guests can order this dish' : '86’d / Out of stock'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  disabled={isSubmitting}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Authentic Restaurant Photo */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-ivory-50 border border-lavender-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-plum-royal">
                    Authentic Kitchen Photo
                  </p>
                  <p className="text-[11px] text-body-muted">
                    Show gold authentic badge on menu
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isOriginalImage}
                  onChange={(e) => setFormData({ ...formData, isOriginalImage: e.target.checked })}
                  disabled={isSubmitting}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plum-royal"></div>
              </label>
            </div>
          </div>

          {/* Optional Direct Image URL */}
          <div>
            <label className="block text-xs font-semibold text-plum-royal mb-1.5">
              Image URL (Optional)
            </label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="/images/food/dish-photo.webp"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />
            <p className="text-[11px] text-body-muted mt-1">
              You can also use the photo camera icon in the table to upload directly from your device.
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
            <span>{isEditing ? 'Save Changes' : 'Register Dish'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
