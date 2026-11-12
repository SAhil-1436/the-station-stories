import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Monitor, ArrowLeft, Clock } from 'lucide-react';
import LanguageToggle from '../components/common/LanguageToggle';

export default function PosLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950 text-ivory-100">
      {/* POS Top Header */}
      <header className="h-14 bg-charcoal-900 border-b border-charcoal-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-ivory-50 tracking-wide">
              THE STATION STORIES – POS TERMINAL
            </div>
            <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
              <span>Counter Station 1</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">Shift Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-gold-500" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>

          <LanguageToggle />

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-charcoal-800 hover:bg-charcoal-700 text-ivory-200 border border-charcoal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit POS</span>
          </Link>
        </div>
      </header>

      {/* POS Viewport */}
      <main className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
