import React, { useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen, LogOut, ShieldCheck, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function AdminHeader({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
}) {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = user?.fullName || user?.username || 'Administrator';
  const roleLabel = (user?.roles && user.roles[0]) || 'ROLE_ADMIN';

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-lavender-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Left Section: Mobile Menu & Desktop Sidebar Collapse Toggle */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-xl text-plum-royal hover:bg-lavender-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:inline-flex p-2 rounded-xl text-plum-royal/70 hover:text-plum-royal hover:bg-lavender-100 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle sidebar width"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold text-plum-royal">
            The Station Stories Management
          </span>
          <span className="text-[10px] text-body-muted">
            Official Restaurant Portal
          </span>
        </div>
      </div>

      {/* Right Section: Admin Profile Badge & Logout */}
      <div className="flex items-center gap-3">
        {/* Admin User Info Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-lavender-50 border border-lavender-200">
          <div className="w-7 h-7 rounded-full bg-plum-royal text-gold-300 flex items-center justify-center font-bold text-xs shadow-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-plum-royal leading-tight truncate max-w-[140px]">
              {displayName}
            </span>
            <span className="text-[9px] font-mono font-medium text-gold-600 leading-tight">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Logout Action Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sign out of Admin Dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-plum-royal bg-lavender-100 hover:bg-rose-muted/20 hover:text-rose-muted transition-colors disabled:opacity-50"
          aria-label="Sign out"
        >
          <LogOut className="w-3.5 h-3.5 text-plum-royal" />
          <span className="hidden sm:inline">
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </span>
        </button>
      </div>
    </header>
  );
}
