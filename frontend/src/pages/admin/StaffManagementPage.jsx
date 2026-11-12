import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  CreditCard,
  KeyRound,
  User,
  Phone,
  Sparkles,
  Info,
} from 'lucide-react';
import { createStaff } from '../../services/adminApi.js';

export default function StaffManagementPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    companyCardNumber: '',
    role: 'ROLE_CASHIER', // Safe default
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3 || formData.username.trim().length > 50) {
      newErrors.username = 'Username must be between 3 and 50 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.companyCardNumber.trim()) {
      newErrors.companyCardNumber = 'Company card verification number is mandatory';
    }

    if (formData.phone && formData.phone.trim()) {
      const cleanPhone = formData.phone.trim();
      if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid 10-digit mobile number';
      }
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
        username: formData.username.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim() || null,
        companyCardNumber: formData.companyCardNumber.trim(),
        role: formData.role,
      };

      const res = await createStaff(payload);
      const user = res?.data || res;

      // On success, capture created user info and immediately clear password from state
      setCreatedUser(user);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        phone: '',
        companyCardNumber: '',
        role: 'ROLE_CASHIER',
      });
      setErrors({});
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to provision staff account. Please verify details and try again.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNewStaff = () => {
    setCreatedUser(null);
    setApiError(null);
    setErrors({});
    setFormData({
      username: '',
      password: '',
      fullName: '',
      phone: '',
      companyCardNumber: '',
      role: 'ROLE_CASHIER',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-body-muted">
        <Link to="/admin" className="hover:text-plum-royal transition-colors">
          Admin Hub
        </Link>
        <span>/</span>
        <span className="text-plum-royal font-semibold">Staff Management</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-lavender-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif font-bold text-2xl text-plum-royal">
              Staff Account Provisioning
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold-700 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>RBAC Provisioning</span>
            </span>
          </div>
          <p className="text-xs text-body-muted mt-0.5">
            Create verified cashier and administrative accounts with mandatory company card validation
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-100 border border-gold/30 text-plum-royal text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
          <span>Admin Privilege</span>
        </span>
      </div>

      {/* Backend Architecture Scope Notice */}
      <div className="p-4 rounded-3xl bg-lavender-50/70 border border-lavender-200 text-xs text-body flex items-start gap-3 shadow-soft">
        <Info className="w-5 h-5 text-plum-royal flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-plum-royal">
            Architecture Notice: Account Provisioning Scope
          </p>
          <p className="text-body-muted leading-relaxed text-[11px]">
            In strict alignment with the Spring Boot backend service, this module provides <strong>authoritative staff account creation only</strong>.
            User listing, credential modification, and account deactivation endpoints are not exposed by the backend and are intentionally not simulated.
            Newly provisioned staff can immediately authenticate with their credentials.
          </p>
        </div>
      </div>

      {/* Success View or Provisioning Form */}
      {createdUser ? (
        /* Account Created Confirmation Card */
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-luxury space-y-6 animate-scaleUp">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-plum-royal">
                Account Provisioned Successfully
              </h2>
              <p className="text-xs text-body-muted mt-0.5">
                Staff credentials have been securely hashed and stored in the database.
              </p>
            </div>
          </div>

          {/* Provisioned Account Details */}
          <div className="p-5 rounded-2xl bg-ivory-50 border border-lavender-200 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-lavender-100">
              <span className="text-body-muted">Staff Member ID:</span>
              <span className="font-mono font-semibold text-plum-royal">#{createdUser.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lavender-100">
              <span className="text-body-muted">Full Name:</span>
              <span className="font-semibold text-plum-royal">{createdUser.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lavender-100">
              <span className="text-body-muted">Login Username:</span>
              <span className="font-mono font-semibold text-plum-royal">{createdUser.username}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-lavender-100">
              <span className="text-body-muted">Assigned Role:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-lavender-100 text-plum-royal text-[11px] font-semibold border border-gold/30">
                {Array.isArray(createdUser.roles) ? createdUser.roles.join(', ') : createdUser.roles}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-lavender-100">
              <span className="text-body-muted">Company Card Verification:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified & Recorded</span>
              </span>
            </div>
            {createdUser.phone && (
              <div className="flex justify-between py-1 border-b border-lavender-100">
                <span className="text-body-muted">Contact Phone:</span>
                <span className="text-body">{createdUser.phone}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-body-muted">Account Status:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active & Ready for Login
              </span>
            </div>
          </div>

          {/* Security & Access Instructions */}
          <div className="p-4 rounded-2xl bg-lavender-50 border border-lavender-200 text-xs text-body-muted space-y-1.5">
            <p className="font-semibold text-plum-royal">Important Staff Access Notice:</p>
            <p className="text-[11px] leading-relaxed">
              The user can now sign in using their username (<strong className="text-plum-royal">{createdUser.username}</strong>) and the secret password chosen during provisioning.
              For regulatory compliance, passwords are never stored in plaintext and cannot be retrieved.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetForNewStaff}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all"
            >
              <UserPlus className="w-4 h-4 text-gold" />
              <span>Provision Another Staff Member</span>
            </button>

            <Link
              to="/admin"
              className="px-5 py-2.5 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors"
            >
              Return to Admin Hub
            </Link>
          </div>
        </div>
      ) : (
        /* Provisioning Form Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender-200 shadow-luxury">
          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Unable to provision staff account</p>
                  <p className="mt-0.5">{apiError}</p>
                </div>
              </div>
            )}

            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-body-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      errors.fullName
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-lavender-200 focus:border-gold'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                  Login Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. cashier_ramesh"
                  maxLength={50}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                    errors.username
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-lavender-200 focus:border-gold'
                  }`}
                />
                {errors.username ? (
                  <p className="text-[11px] text-red-600 mt-1">{errors.username}</p>
                ) : (
                  <p className="text-[11px] text-body-muted mt-1">
                    3–50 characters, unique identifier used for authentication
                  </p>
                )}
              </div>
            </div>

            {/* Password & Show/Hide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-body-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-lavender-200 focus:border-gold'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-body-muted hover:text-plum-royal"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-[11px] text-red-600 mt-1">{errors.password}</p>
                ) : (
                  <p className="text-[11px] text-body-muted mt-1">Minimum 8 characters</p>
                )}
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                  Account Role & Authorities <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border border-lavender-200 text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                >
                  <option value="ROLE_CASHIER">
                    ROLE_CASHIER — Counter Staff / POS Billing
                  </option>
                  <option value="ROLE_ADMIN">
                    ROLE_ADMIN — Store Manager & Full System Admin
                  </option>
                </select>
                <p className="text-[11px] text-body-muted mt-1">
                  {formData.role === 'ROLE_CASHIER'
                    ? 'Permitted for POS ordering, receipt printing, and cashier operations.'
                    : 'Full access to admin dashboard, price updates, cancellation, and tax settings.'}
                </p>
              </div>
            </div>

            {/* Company Card Number & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                  Company Card Verification Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-body-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.companyCardNumber}
                    onChange={(e) => setFormData({ ...formData, companyCardNumber: e.target.value })}
                    placeholder="e.g. CARD-2026-008"
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body font-mono focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      errors.companyCardNumber
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-lavender-200 focus:border-gold'
                    }`}
                  />
                </div>
                {errors.companyCardNumber ? (
                  <p className="text-[11px] text-red-600 mt-1">{errors.companyCardNumber}</p>
                ) : (
                  <p className="text-[11px] text-body-muted mt-1">
                    Mandatory physical employee badge or internal company verification number
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-plum-royal mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-body-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-ivory-50 border transition-all text-body focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                      errors.phone
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-lavender-200 focus:border-gold'
                    }`}
                  />
                </div>
                {errors.phone ? (
                  <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>
                ) : (
                  <p className="text-[11px] text-body-muted mt-1">
                    Optional contact number for staff records
                  </p>
                )}
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-lavender-200 flex items-center justify-end gap-3">
              <Link
                to="/admin"
                className="px-5 py-2.5 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-plum-royal hover:bg-plum-dark shadow-soft transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Provisioning Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-gold" />
                    <span>Provision Staff Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
