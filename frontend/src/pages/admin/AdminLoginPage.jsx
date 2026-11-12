import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  UtensilsCrossed,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function AdminLoginPage() {
  const { isAuthenticated, isAdmin, login, error: contextError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect already authenticated administrators directly to /admin
  if (isAuthenticated && isAdmin) {
    const destination = location.state?.from?.pathname || '/admin';
    return <Navigate to={destination} replace />;
  }

  const validate = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Administrator username is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(username.trim(), password);

      if (result.success) {
        const destination = location.state?.from?.pathname || '/admin';
        navigate(destination, { replace: true });
      } else {
        setErrorMessage(
          result.message || 'Authentication failed. Please verify credentials.'
        );
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'An unexpected error occurred during authentication.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine active display error (local submit error or context session error)
  const activeError = errorMessage || contextError;

  return (
    <div className="min-h-screen bg-ivory text-body flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-gold-300 selection:text-plum-dark">
      {/* Top Header / Return link */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-plum-royal/80 hover:text-plum-royal hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gold" />
          <span>Return to Customer Website</span>
        </Link>
        <span className="text-[11px] font-mono uppercase tracking-wider text-gold-700 bg-lavender-100 px-2.5 py-1 rounded-full border border-gold/30">
          Admin Portal
        </span>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-luxury border border-lavender-200">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-plum-royal border border-gold/40 flex items-center justify-center text-gold-300 mx-auto mb-4 shadow-sm">
              <UtensilsCrossed className="w-8 h-8" />
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-wide uppercase text-plum-royal">
              The Station Stories
            </h1>
            <p className="text-xs uppercase tracking-[0.22em] text-gold-700 font-medium mt-1">
              Executive Restaurant Management
            </p>
            <p className="text-xs text-body-muted mt-2 font-light">
              Sign in with your verified administrative credentials to access master controls.
            </p>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div
              className="mb-6 p-4 rounded-2xl bg-rose-muted/10 border border-rose-muted/30 text-plum-dark text-xs flex items-start gap-3 animate-fade-in"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-rose-muted shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-plum-royal">
                  Authentication Notice
                </span>
                <span className="text-body-muted">{activeError}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold text-plum-royal uppercase tracking-wider mb-2"
              >
                Administrator Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-plum-royal/60">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  disabled={isSubmitting}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) {
                      setFieldErrors((prev) => ({ ...prev, username: null }));
                    }
                  }}
                  placeholder="e.g. admin"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs bg-lavender-50 border text-body placeholder:text-body-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                    fieldErrors.username
                      ? 'border-rose-muted ring-1 ring-rose-muted/40'
                      : 'border-lavender-200'
                  }`}
                />
              </div>
              {fieldErrors.username && (
                <p className="mt-1.5 text-[11px] text-rose-muted font-medium">
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-plum-royal uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-plum-royal/60">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: null }));
                    }
                  }}
                  placeholder="Enter administrator password"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl text-xs bg-lavender-50 border text-body placeholder:text-body-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all ${
                    fieldErrors.password
                      ? 'border-rose-muted ring-1 ring-rose-muted/40'
                      : 'border-lavender-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-plum-royal/60 hover:text-plum-royal transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-[11px] text-rose-muted font-medium">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-plum-royal hover:bg-plum-dark text-ivory text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-luxury hover:shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-ivory/30 border-t-gold animate-spin" />
                    <span>Verifying Authority...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
                    <span>Sign In to Admin Portal</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-lavender-200 text-center">
            <p className="text-[11px] text-body-muted">
              Restricted Area · Role Guard: <span className="font-mono text-plum-royal font-semibold">ROLE_ADMIN</span>
            </p>
            <p className="text-[10px] text-body-subtle mt-1">
              Cashier staff accounts must access the localized POS terminal.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="w-full max-w-md mx-auto text-center mt-6">
        <p className="text-[11px] text-body-subtle">
          © {new Date().getFullYear()} The Station Stories · All Rights Reserved
        </p>
      </div>
    </div>
  );
}
