import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  Layers,
  Receipt,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import HealthStatusBanner from '../../components/common/HealthStatusBanner';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const moduleCards = [
    {
      title: 'Menu Management',
      description: 'Master dish catalog, real-time 86 availability toggle, price editing, and multipart photo uploads.',
      path: '/admin/menu',
      icon: Utensils,
      phase: 'Phase 4.4',
    },
    {
      title: 'Category Hierarchy',
      description: 'Menu categories, display sequencing, active states, and orphan dish prevention check.',
      path: '/admin/categories',
      icon: Layers,
      phase: 'Phase 4.4',
    },
    {
      title: 'Bills & Orders',
      description: 'Historical bill audit, status & payment method filters, item breakdown drawer, and soft cancellation.',
      path: '/admin/bills',
      icon: Receipt,
      phase: 'Phase 4.5',
    },
    {
      title: 'Staff Management',
      description: 'Provision staff & cashier credentials with mandatory company card validation.',
      path: '/admin/staff',
      icon: Users,
      phase: 'Phase 4.6',
    },
    {
      title: 'Reports & Analytics',
      description: 'Today’s sales KPIs, cash vs UPI revenue split, bestsellers, and daily settlement sheet.',
      path: '/admin/reports',
      icon: BarChart3,
      phase: 'Phase 4.7',
    },
    {
      title: 'Restaurant Settings',
      description: 'Restaurant brand details, UPI VPA configuration, and dynamic GST tax policy toggle.',
      path: '/admin/settings',
      icon: Settings,
      phase: 'Phase 4.6',
    },
    {
      title: 'Compliance Audit Trail',
      description: 'Regulatory audit log stream recording price adjustments, cancellations, and tax policy changes.',
      path: '/admin/audit-logs',
      icon: ShieldCheck,
      phase: 'Phase 4.7',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-plum-dark via-plum-royal to-plum-dark text-ivory rounded-3xl p-6 sm:p-8 shadow-luxury border border-plum-royal/40 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold-300 text-[11px] font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Administrative Portal</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-wide text-ivory">
            Welcome back, {user?.fullName || user?.username || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-ivory/80 mt-2 font-light leading-relaxed">
            The Station Stories administrative layout, routing foundation, and session security are active.
            Select a module below to inspect navigation destinations. Live sales metrics and KPI cards will be integrated in Phase 4.3.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <LayoutDashboard className="w-64 h-64 text-gold" />
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-lg text-plum-royal">
            Administrative Modules
          </h2>
          <span className="text-xs text-body-muted">
            8 Scoped Destinations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                className="group p-5 rounded-2xl bg-white border border-lavender-200 hover:border-gold/50 shadow-soft hover:shadow-luxury transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-lavender-100 group-hover:bg-plum-royal text-plum-royal group-hover:text-gold-300 border border-gold/30 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lavender-50 border border-lavender-200 text-plum-royal">
                      {card.phase}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-plum-royal group-hover:text-plum-dark transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-body-muted mt-1.5 leading-relaxed font-light">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-lavender-100 flex items-center justify-between text-xs font-semibold text-plum-royal group-hover:text-gold-600 transition-colors">
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Backend & Database Health Banner */}
      <div className="pt-2">
        <HealthStatusBanner />
      </div>
    </div>
  );
}
