import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import LoadingState from '../components/common/LoadingState';

/**
 * Route guard component for the POS billing terminal (/pos)
 * Enforces session authentication and verifies ROLE_ADMIN or ROLE_CASHIER authority.
 * Blocks unauthenticated users (redirects to /admin/login preserving intended route).
 * Rejects any authenticated role that lacks POS counter permissions.
 */
export default function PosProtectedRoute({ children }) {
  const { user, loading, isAuthenticated, isAdmin, isCashier, logout } = useAuth();
  const location = useLocation();

  // 1. Session verification in progress
  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <LoadingState message="Verifying POS terminal access..." />
      </div>
    );
  }

  // 2. Unauthenticated user -> redirect to admin/staff login with return state
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Authenticated but lacks both ROLE_ADMIN and ROLE_CASHIER
  const hasPosAuthority = isAdmin || isCashier;
  if (!hasPosAuthority) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-rose-muted/40 rounded-3xl p-8 shadow-luxury text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-muted/15 border border-rose-muted/40 flex items-center justify-center text-plum-royal mx-auto">
            <ShieldAlert className="w-8 h-8 text-plum-royal" />
          </div>

          <div>
            <h1 className="font-serif font-bold text-2xl text-plum-royal">
              POS Terminal Privileges Required
            </h1>
            <p className="text-xs text-body-muted mt-2 leading-relaxed">
              You are currently signed in as <strong className="text-plum-royal font-semibold">{user?.username || 'User'}</strong> ({user?.companyCardNumber || 'Staff Card'}).
              This billing counter terminal is restricted to accounts possessing <code className="bg-lavender-100 text-plum-royal px-1.5 py-0.5 rounded text-[11px]">ROLE_CASHIER</code> or <code className="bg-lavender-100 text-plum-royal px-1.5 py-0.5 rounded text-[11px]">ROLE_ADMIN</code>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs">
            Please sign in with authorized cashier or manager credentials to operate the POS terminal.
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

  // 4. Authorized cashier or administrator
  return children ? children : <Outlet />;
}
