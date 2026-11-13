import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Store,
  Globe,
  CreditCard,
  Percent,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Save,
  ShieldAlert,
  Info,
  Clock,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { getSettings, updateSettings } from '../../services/adminApi.js';
import ConfirmModal from '../../components/admin/ConfirmModal.jsx';

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
      hour12: true,
      timeZone: 'Asia/Kolkata',
    }).format(d);
  } catch (e) {
    return String(isoString);
  }
}

export function isPendingPlaceholder(val) {
  return typeof val === 'string' && val.toLowerCase().includes('pending owner confirmation');
}

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    tagline: '',
    address: '',
    phonePrimary: '',
    phoneSecondary: '',
    whatsappNumber: '',
    email: '',
    openingHours: '',
    googleMapsUrl: '',
    instagramHandle: '',
    upiId: '',
    currencySymbol: '₹',
    gstEnabled: false,
    gstin: '',
    cgstRate: '0.00',
    sgstRate: '0.00',
  });

  const [updatedAt, setUpdatedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);

  // GST Confirmation Modal
  const [isGstConfirmModalOpen, setIsGstConfirmModalOpen] = useState(false);
  const [pendingGstState, setPendingGstState] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch settings on mount
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getSettings();
      const data = res?.data || res;

      setFormData({
        restaurantName: data.restaurantName || '',
        tagline: data.tagline || '',
        address: data.address || '',
        phonePrimary: data.phonePrimary || '',
        phoneSecondary: data.phoneSecondary || '',
        whatsappNumber: data.whatsappNumber || '',
        email: data.email || '',
        openingHours: data.openingHours || '',
        googleMapsUrl: data.googleMapsUrl || '',
        instagramHandle: data.instagramHandle || '',
        upiId: data.upiId || '',
        currencySymbol: data.currencySymbol || '₹',
        gstEnabled: Boolean(data.gstEnabled),
        gstin: data.gstin || '',
        cgstRate: data.cgstRate !== undefined ? String(data.cgstRate) : '0.00',
        sgstRate: data.sgstRate !== undefined ? String(data.sgstRate) : '0.00',
      });
      setUpdatedAt(data.updatedAt);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load restaurant settings. Please verify connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle GST toggle with warning check
  const handleToggleGst = (checked) => {
    if (checked) {
      // Prompt warning confirmation before enabling GST
      setPendingGstState(true);
      setIsGstConfirmModalOpen(true);
    } else {
      // Disabling GST directly
      setFormData((prev) => ({ ...prev, gstEnabled: false }));
    }
  };

  const handleConfirmGstEnable = () => {
    setFormData((prev) => ({ ...prev, gstEnabled: true }));
    setIsGstConfirmModalOpen(false);
    showToast('GST tax policy toggled ON. Please review GSTIN and tax rates.', 'info');
  };

  const validate = () => {
    const errs = {};

    if (!formData.restaurantName.trim()) {
      errs.restaurantName = 'Restaurant name is required';
    }

    if (!formData.address.trim()) {
      errs.address = 'Physical restaurant address is required';
    }

    if (!formData.phonePrimary.trim()) {
      errs.phonePrimary = 'Primary telephone number is required';
    }

    if (!formData.whatsappNumber.trim()) {
      errs.whatsappNumber = 'WhatsApp contact number is required';
    }

    if (!formData.openingHours.trim()) {
      errs.openingHours = 'Operating / service hours are required';
    }

    const cgst = parseFloat(formData.cgstRate);
    if (isNaN(cgst) || cgst < 0) {
      errs.cgstRate = 'CGST rate must be a non-negative decimal (e.g. 2.50)';
    }

    const sgst = parseFloat(formData.sgstRate);
    if (isNaN(sgst) || sgst < 0) {
      errs.sgstRate = 'SGST rate must be a non-negative decimal (e.g. 2.50)';
    }

    if (formData.gstEnabled && formData.gstin && formData.gstin.trim()) {
      const normalizedGstin = formData.gstin.trim().toUpperCase();
      if (!/^[0-9A-Z]{15}$/.test(normalizedGstin)) {
        errs.gstin = 'GSTIN must be exactly 15 alphanumeric characters';
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedGstin = formData.gstin && formData.gstin.trim()
        ? formData.gstin.trim().toUpperCase()
        : null;

      const payload = {
        restaurantName: formData.restaurantName.trim(),
        tagline: formData.tagline.trim() || null,
        address: formData.address.trim(),
        phonePrimary: formData.phonePrimary.trim(),
        phoneSecondary: formData.phoneSecondary.trim() || null,
        whatsappNumber: formData.whatsappNumber.trim(),
        email: formData.email.trim() || null,
        gstEnabled: Boolean(formData.gstEnabled),
        gstin: normalizedGstin,
        cgstRate: parseFloat(formData.cgstRate) || 0,
        sgstRate: parseFloat(formData.sgstRate) || 0,
        upiId: formData.upiId.trim() || null,
        currencySymbol: formData.currencySymbol.trim() || '₹',
        openingHours: formData.openingHours.trim(),
        googleMapsUrl: formData.googleMapsUrl.trim() || null,
        instagramHandle: formData.instagramHandle.trim() || null,
      };

      const res = await updateSettings(payload);
      const updated = res?.data || res;

      // Update state with server returned values
      setFormData({
        restaurantName: updated.restaurantName || '',
        tagline: updated.tagline || '',
        address: updated.address || '',
        phonePrimary: updated.phonePrimary || '',
        phoneSecondary: updated.phoneSecondary || '',
        whatsappNumber: updated.whatsappNumber || '',
        email: updated.email || '',
        openingHours: updated.openingHours || '',
        googleMapsUrl: updated.googleMapsUrl || '',
        instagramHandle: updated.instagramHandle || '',
        upiId: updated.upiId || '',
        currencySymbol: updated.currencySymbol || '₹',
        gstEnabled: Boolean(updated.gstEnabled),
        gstin: updated.gstin || '',
        cgstRate: updated.cgstRate !== undefined ? String(updated.cgstRate) : '0.00',
        sgstRate: updated.sgstRate !== undefined ? String(updated.sgstRate) : '0.00',
      });
      setUpdatedAt(updated.updatedAt);
      setFormErrors({});

      showToast('Restaurant settings and tax configuration saved successfully');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to save settings. Please verify details and try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedTotalTax = (parseFloat(formData.cgstRate || 0) + parseFloat(formData.sgstRate || 0)).toFixed(2);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-lavender-200 shadow-luxury animate-slideDown">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold text-plum-royal">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-body-muted hover:text-plum-royal ml-2 text-base font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-body-muted">
        <Link to="/admin" className="hover:text-plum-royal transition-colors">
          Admin Hub
        </Link>
        <span>/</span>
        <span className="text-plum-royal font-semibold">Settings</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-lavender-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif font-bold text-2xl text-plum-royal">
              Restaurant Settings & GST Policy
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold-700 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Store Master</span>
            </span>
          </div>
          <p className="text-xs text-body-muted mt-0.5">
            Store configuration, UPI VPA parameters, and dynamic GST tax policies
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {updatedAt && (
            <span className="text-[11px] text-body-muted hidden md:inline">
              Last saved: <b>{formatKolkataDateTime(updatedAt)}</b>
            </span>
          )}

          <button
            type="button"
            onClick={fetchSettings}
            disabled={isLoading || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-lavender-200 bg-white text-xs font-semibold text-plum-royal hover:bg-lavender-100 transition-colors disabled:opacity-50"
            title="Reload Settings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-gold" />
            )}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-lavender-200 shadow-soft space-y-4 animate-pulse"
            >
              <div className="h-5 w-48 bg-lavender-200/60 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-10 bg-ivory-50 rounded-2xl" />
                <div className="h-10 bg-ivory-50 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error && !formData.restaurantName ? (
        /* Fetch Error State */
        <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-4 shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-plum-royal">
            Failed to Load Restaurant Settings
          </h3>
          <p className="text-xs text-body-muted max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchSettings}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-plum-royal text-white text-xs font-semibold hover:bg-plum-dark transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to save settings</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Section A: Restaurant Profile */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-lavender-200 shadow-luxury space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-lavender-100">
              <div className="w-9 h-9 rounded-xl bg-lavender-100 text-plum-royal border border-gold/30 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-plum-royal">
                  A. Restaurant Profile & Identity
                </h2>
                <p className="text-[11px] text-body-muted">
                  Official brand title, physical address, and guest contact numbers
                </p>
              </div>
            </div>

            {/* Restaurant Name & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    Restaurant Name <span className="text-red-500">*</span>
                  </label>
                  {isPendingPlaceholder(formData.restaurantName) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  placeholder="e.g. THE STATION STORIES"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body font-semibold focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                    formErrors.restaurantName
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-lavender-200 focus:border-gold'
                  }`}
                />
                {formErrors.restaurantName && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.restaurantName}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    Brand Tagline
                  </label>
                  {isPendingPlaceholder(formData.tagline) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Fast Food & Restaurant"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                />
                <p className="text-[11px] text-body-muted mt-1">
                  Printed beneath brand header on guest thermal receipts
                </p>
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-plum-royal">
                  Physical Store Address <span className="text-red-500">*</span>
                </label>
                {isPendingPlaceholder(formData.address) && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                    Pending Confirmation
                  </span>
                )}
              </div>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Complete street address, landmark, city and PIN code..."
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none ${
                  formErrors.address
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-lavender-200 focus:border-gold'
                }`}
              />
              {formErrors.address && (
                <p className="text-[11px] text-red-600 mt-1">{formErrors.address}</p>
              )}
            </div>

            {/* Contact Phones & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    Primary Phone <span className="text-red-500">*</span>
                  </label>
                  {isPendingPlaceholder(formData.phonePrimary) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.phonePrimary}
                  onChange={(e) => setFormData({ ...formData, phonePrimary: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                    formErrors.phonePrimary
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-lavender-200 focus:border-gold'
                  }`}
                />
                {formErrors.phonePrimary && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.phonePrimary}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    Secondary Phone (Optional)
                  </label>
                  {isPendingPlaceholder(formData.phoneSecondary) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.phoneSecondary}
                  onChange={(e) => setFormData({ ...formData, phoneSecondary: e.target.value })}
                  placeholder="e.g. 0522-123456"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  {isPendingPlaceholder(formData.whatsappNumber) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="e.g. 919876543210"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                    formErrors.whatsappNumber
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-lavender-200 focus:border-gold'
                  }`}
                />
                {formErrors.whatsappNumber && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.whatsappNumber}</p>
                )}
              </div>
            </div>

            {/* Email & Operating Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    Email Address
                  </label>
                  {isPendingPlaceholder(formData.email) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. info@thestationstories.com"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    Opening Hours <span className="text-red-500">*</span>
                  </label>
                  {isPendingPlaceholder(formData.openingHours) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  placeholder="e.g. 11:00 AM - 11:00 PM (Daily)"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                    formErrors.openingHours
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-lavender-200 focus:border-gold'
                  }`}
                />
                {formErrors.openingHours && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.openingHours}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section B: Online Presence */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-lavender-200 shadow-luxury space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-lavender-100">
              <div className="w-9 h-9 rounded-xl bg-lavender-100 text-plum-royal border border-gold/30 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-plum-royal">
                  B. Online & Social Presence
                </h2>
                <p className="text-[11px] text-body-muted">
                  Navigation link for customer directions and social media profile
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    Google Maps URL
                  </label>
                  {isPendingPlaceholder(formData.googleMapsUrl) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    Instagram Handle
                  </label>
                  {isPendingPlaceholder(formData.instagramHandle) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.instagramHandle}
                  onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                  placeholder="@thestationstories"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Section C: Payment Configuration */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-lavender-200 shadow-luxury space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-lavender-100">
              <div className="w-9 h-9 rounded-xl bg-lavender-100 text-plum-royal border border-gold/30 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-plum-royal">
                  C. Payment Gateway & UPI Configuration
                </h2>
                <p className="text-[11px] text-body-muted">
                  Unified Payments Interface VPA for dynamic cashier billing and thermal receipt QR codes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    Restaurant UPI VPA Identifier
                  </label>
                  {isPendingPlaceholder(formData.upiId) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="e.g. stationstories@upi"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                />
                <p className="text-[11px] text-body-muted mt-1">
                  Used by the backend to construct dynamic `upi://pay` payment links on printed receipts
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  placeholder="₹"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body font-semibold focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                />
                <p className="text-[11px] text-body-muted mt-1">
                  Default currency notation for customer invoices and POS counter
                </p>
              </div>
            </div>
          </div>

          {/* Section D: GST & Dynamic Tax Policy */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-lavender-200 shadow-luxury space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-lavender-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-lavender-100 text-plum-royal border border-gold/30 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-base text-plum-royal">
                    D. GST Regulatory & Tax Policy
                  </h2>
                  <p className="text-[11px] text-body-muted">
                    Enable or disable dynamic Goods and Services Tax computation on food bills
                  </p>
                </div>
              </div>

              {/* Master GST Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-plum-royal hidden sm:inline">
                  {formData.gstEnabled ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      GST Active
                    </span>
                  ) : (
                    <span className="text-body-muted flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      GST Disabled
                    </span>
                  )}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.gstEnabled}
                    onChange={(e) => handleToggleGst(e.target.checked)}
                    disabled={isSubmitting}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plum-royal"></div>
                </label>
              </div>
            </div>

            {/* Warning Banner when GST is enabled */}
            {formData.gstEnabled ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">GST Billing Active</p>
                  <p className="text-[11px] leading-relaxed">
                    All new bills finalized at the POS counter will compute CGST ({formData.cgstRate}%) and SGST ({formData.sgstRate}%)
                    totaling <strong>{calculatedTotalTax}%</strong> on taxable line items.
                    Ensure the GSTIN below matches your authentic Ministry of Finance registration certificate.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-ivory-50 border border-lavender-200 text-body-muted text-xs flex items-start gap-3">
                <Info className="w-4 h-4 text-plum-royal flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  GST is currently disabled. Guest bills will be generated without separate CGST and SGST line items.
                  Before enabling, confirm your establishment's GST composition scheme or regular registration status with your accountant.
                </p>
              </div>
            )}

            {/* GSTIN, CGST & SGST Rates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-plum-royal">
                    GST Identification Number (GSTIN)
                  </label>
                  {isPendingPlaceholder(formData.gstin) && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-300">
                      Pending Confirmation
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  maxLength={15}
                  disabled={!formData.gstEnabled || isSubmitting}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body font-mono uppercase focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                    !formData.gstEnabled
                      ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                      : formErrors.gstin
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-lavender-200 focus:border-gold'
                  }`}
                />
                {formErrors.gstin && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.gstin}</p>
                )}
                <p className="text-[10px] text-body-muted mt-1">15-character alphanumeric format</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                  Central GST Rate (CGST %)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    value={formData.cgstRate}
                    onChange={(e) => setFormData({ ...formData, cgstRate: e.target.value })}
                    placeholder="2.50"
                    disabled={!formData.gstEnabled || isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body font-semibold focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      !formData.gstEnabled
                        ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                        : formErrors.cgstRate
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-lavender-200 focus:border-gold'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-body-muted text-xs font-semibold">
                    %
                  </span>
                </div>
                {formErrors.cgstRate && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.cgstRate}</p>
                )}
                <p className="text-[10px] text-body-muted mt-1">Rate must be non-negative</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                  State GST Rate (SGST %)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    value={formData.sgstRate}
                    onChange={(e) => setFormData({ ...formData, sgstRate: e.target.value })}
                    placeholder="2.50"
                    disabled={!formData.gstEnabled || isSubmitting}
                    className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body font-semibold focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      !formData.gstEnabled
                        ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200'
                        : formErrors.sgstRate
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-lavender-200 focus:border-gold'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-body-muted text-xs font-semibold">
                    %
                  </span>
                </div>
                {formErrors.sgstRate && (
                  <p className="text-[11px] text-red-600 mt-1">{formErrors.sgstRate}</p>
                )}
                <p className="text-[10px] text-body-muted mt-1">Rate must be non-negative</p>
              </div>
            </div>

            {/* Immutability & Financial Snapshot Rule Notice */}
            <div className="p-3.5 rounded-2xl bg-lavender-50/70 border border-lavender-200 text-body-muted text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-plum-royal flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <span className="font-semibold text-plum-royal">Historical Snapshot Protection:</span> Updating GST rates or status applies exclusively to future invoices generated by the POS. Past finalized and printed invoices permanently preserve their captured tax snapshots for audit integrity.
              </p>
            </div>
          </div>

          {/* Sticky or Bottom Action Bar */}
          <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-body-muted">
              {updatedAt ? (
                <span>Last successfully persisted to database: <b>{formatKolkataDateTime(updatedAt)}</b></span>
              ) : (
                <span>Unsaved changes</span>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <Link
                to="/admin"
                className="px-5 py-2.5 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors"
              >
                Return to Dashboard
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-plum-royal hover:bg-plum-dark shadow-soft transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Persisting Settings...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-gold" />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Confirmation Modal Before Enabling GST */}
      <ConfirmModal
        isOpen={isGstConfirmModalOpen}
        onClose={() => setIsGstConfirmModalOpen(false)}
        onConfirm={handleConfirmGstEnable}
        title="Confirm GST Policy Activation"
        message="Enabling GST will immediately apply tax calculation to all newly generated customer bills. Please confirm that your restaurant holds a valid GST registration certificate and that the applicable CGST/SGST rates have been confirmed with your chartered accountant."
        warningNote="Historical bills remain unchanged, but all future POS bills will include separate CGST and SGST line items."
        confirmText="Acknowledge & Enable GST"
        cancelText="Keep GST Disabled"
        confirmVariant="primary"
      />
    </div>
  );
}
