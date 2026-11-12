import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Monitor,
  ArrowLeft,
  Clock,
  Shield,
  User as UserIcon,
  Keyboard,
  LogOut,
  Sparkles,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import LanguageToggle from '../components/common/LanguageToggle';
import PosShortcutsModal from '../components/pos/PosShortcutsModal';

/**
 * POS Desktop Terminal Layout
 * Adheres strictly to the locked Ivory + Royal Plum + Champagne Gold design system.
 * Features live IST counter clock, active cashier/staff indicator, quick navigation,
 * and keyboard shortcuts modal.
 */
export default function PosLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Live real-time clock updating every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-ivory text-body overflow-hidden font-sans select-none">
      {/* POS Top Header Bar (Royal Plum & Champagne Gold) */}
      <header className="h-14 bg-plum-900 border-b border-plum-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-soft text-ivory">
        {/* Left: Branding & Station Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-plum-800 border border-gold/40 flex items-center justify-center text-gold shadow-sm">
            <Monitor className="w-5 h-5 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm tracking-wider text-ivory">
                THE STATION STORIES
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-gold/20 text-gold-light border border-gold/30">
                POS Terminal
              </span>
            </div>
            <div className="text-[11px] text-ivory-200/70 flex items-center gap-2 font-mono">
              <span>Counter Station 1</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Shift Active
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Real-Time Indian Standard Time (IST) Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-plum-950/60 border border-plum-800/80 text-xs font-mono shadow-xs">
          <Clock className="w-3.5 h-3.5 text-gold" />
          <span className="text-ivory-200">{formattedDate}</span>
          <span className="text-gold/60">•</span>
          <span className="text-gold font-semibold tracking-wider">{formattedTime}</span>
          <span className="text-[10px] text-ivory-200/60">IST</span>
        </div>

        {/* Right: Actions, Staff Badge, Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Keyboard Shortcuts Trigger */}
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-plum-800/70 hover:bg-plum-800 text-ivory-200 hover:text-white border border-plum-700/60 transition-colors"
            title="Keyboard Shortcuts (Press ?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] font-medium">Shortcuts</span>
            <kbd className="text-[10px] bg-plum-950/60 px-1 py-0.5 rounded text-gold/90 font-mono">
              ?
            </kbd>
          </button>

          {/* Language Toggle */}
          <LanguageToggle className="scale-90" />

          {/* Authenticated Staff Badge */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-plum-800/80 border border-gold/30 text-xs">
              <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[11px] font-bold">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left leading-tight pr-1">
                <div className="text-xs font-semibold text-ivory truncate max-w-[120px]">
                  {user.fullName || user.username}
                </div>
                <div className="text-[9px] text-gold-light flex items-center gap-1">
                  <span>{isAdmin ? 'Admin' : 'Cashier'}</span>
                  {user.companyCardNumber && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-ivory-200/80">{user.companyCardNumber}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-plum-800/60 hover:bg-plum-800 border border-plum-700 text-xs text-ivory-200 hover:text-white transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px]">Staff Sign In</span>
            </Link>
          )}

          {/* Admin Portal Shortcut (If user is Admin) */}
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gold/20 hover:bg-gold/30 text-gold-light border border-gold/40 transition-colors font-medium"
              title="Return to Admin Management Hub"
            >
              <Shield className="w-3.5 h-3.5 text-gold" />
              <span className="hidden xl:inline">Admin Hub</span>
            </Link>
          )}

          {/* Exit POS Navigation */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-plum-950/70 hover:bg-plum-950 text-ivory-200 hover:text-red-300 border border-plum-800 transition-colors"
              title="Sign Out / Exit Terminal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-plum-950/70 hover:bg-plum-950 text-ivory-200 hover:text-white border border-plum-800 transition-colors"
              title="Exit POS to Public Website"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit POS</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Terminal Viewport */}
      <main className="flex-1 overflow-hidden p-3 sm:p-4 bg-ivory flex flex-col">
        <Outlet />
      </main>

      {/* Keyboard Shortcuts Reference Dialog */}
      <PosShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
