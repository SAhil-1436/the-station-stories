import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import LoadingState from '../components/common/LoadingState';

/**
 * Route guard component for administrative areas
 * Enforces session authentication and strict ROLE_ADMIN verification.
 * Blocks unauthenticated users (redirects to /admin/login).
 * Rejects cashier accounts with an explicit access-denied state.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  // 1. Session verification in progress
  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <LoadingState message="Verifying administrative credentials..." />
      </div>
    );
  }

  // 2. Unauthenticated user -> redirect to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated as non-admin (e.g. ROLE_CASHIER) -> Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-rose-muted/40 rounded-3xl p-8 shadow-luxury text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-muted/15 border border-rose-muted/40 flex items-center justify-center text-plum-royal mx-auto">
            <ShieldAlert className="w-8 h-8 text-plum-royal" />
          </div>

          <div>
            <h1 className="font-serif font-bold text-2xl text-plum-royal">
              Administrator Privileges Required
            </h1>
            <p className="text-xs text-body-muted mt-2 leading-relaxed">
              You are currently signed in as <strong className="text-plum-royal font-semibold">{user?.username || 'Staff'}</strong> ({user?.companyCardNumber || 'Staff Card'}).
              This management portal is strictly restricted to accounts possessing <code className="bg-lavender-100 text-plum-royal px-1.5 py-0.5 rounded text-[11px]">ROLE_ADMIN</code>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs">
            Cashier staff accounts must use the authorized POS billing terminal.
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => logout()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-plum-royal hover:bg-plum-dark text-ivory text-xs font-semibold transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4 text-gold" />
              <span>Switch Account</span>
            </button>
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-lavender-100 hover:bg-lavender-200 text-plum-royal text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized administrator
  return children ? children : <Outlet />;
}
