import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  Layers,
  Receipt,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  ArrowUpRight,
  UtensilsCrossed,
  X,
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/menu', label: 'Menu Management', icon: Utensils },
  { path: '/admin/categories', label: 'Categories', icon: Layers },
  { path: '/admin/bills', label: 'Bills & Orders', icon: Receipt },
  { path: '/admin/staff', label: 'Staff Management', icon: Users },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck },
];

export default function AdminSidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
}) {
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-plum-950/60 backdrop-blur-sm md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-plum-dark text-ivory border-r border-plum-royal/40 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-luxury md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-plum-royal/30">
            <Link
              to="/admin"
              className="flex items-center gap-3 group focus:outline-none overflow-hidden"
              title="The Station Stories – Master Admin Hub"
            >
              <div className="w-10 h-10 rounded-xl bg-plum-royal/80 border border-gold/40 flex items-center justify-center text-gold-300 shrink-0 group-hover:border-gold transition-colors">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-serif font-bold text-sm tracking-wide text-ivory uppercase truncate">
                    Station Stories
                  </span>
                  <span className="text-[10px] font-medium tracking-[0.2em] text-gold-400 uppercase">
                    Admin Hub
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-ivory-200/70 hover:text-ivory hover:bg-plum-royal/40 transition-colors"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-plum-royal text-gold-300 shadow-sm border border-gold/30 font-semibold'
                        : 'text-ivory/70 hover:text-ivory hover:bg-plum-royal/40'
                    } ${collapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-gold-300'
                            : 'text-ivory/60 group-hover:text-gold-400'
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Customer Site Link & Version */}
        <div className="p-3 border-t border-plum-royal/30">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? 'View Customer Site' : undefined}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-ivory/60 hover:text-gold-300 hover:bg-plum-royal/30 transition-colors ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <ArrowUpRight className="w-4 h-4 shrink-0 text-gold-400" />
            {!collapsed && (
              <span className="truncate">Live Customer Site</span>
            )}
          </Link>

          {!collapsed && (
            <div className="mt-2 px-3 text-[10px] text-ivory/40 font-mono flex items-center justify-between">
              <span>TSS Admin v1.0</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
