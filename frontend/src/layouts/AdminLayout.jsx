import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Utensils, Users, Receipt, Settings, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const adminNav = [
    { path: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/admin/menu', label: 'Menu Management', icon: Utensils },
    { path: '/admin/bills', label: 'Billing History', icon: Receipt },
    { path: '/admin/customers', label: 'Customer CRM', icon: Users },
    { path: '/admin/settings', label: 'Restaurant Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-charcoal-900 text-ivory-100">
      {/* Admin Sidebar Placeholder */}
      <aside className="w-full sm:w-64 bg-charcoal-950 border-b sm:border-b-0 sm:border-r border-charcoal-800 p-4 shrink-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 pb-5 border-b border-charcoal-800">
            <div className="w-8 h-8 rounded-lg bg-gold-600/20 border border-gold-600/40 flex items-center justify-center text-gold-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-ivory-50">Admin Hub</div>
              <div className="text-[10px] text-gold-600">The Station Stories</div>
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-gold-600/20 text-gold-500 border border-gold-600/30'
                      : 'text-gray-400 hover:text-ivory-50 hover:bg-charcoal-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-charcoal-800/80 mt-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gold-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Customer Site</span>
          </Link>
        </div>
      </aside>

      {/* Admin Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-charcoal-800 px-6 flex items-center justify-between bg-charcoal-900/60">
          <span className="text-xs text-gray-400 font-mono">Phase 1 Protected Route Placeholder</span>
          <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Role Guard: ROLE_ADMIN
          </span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
