import React from 'react';
import { IndianRupee, ShoppingBag, Users, TrendingUp, AlertCircle } from 'lucide-react';
import HealthStatusBanner from '../../components/common/HealthStatusBanner';

export default function AdminDashboardPage() {
  const kpiCards = [
    { title: "Today's Gross Sales", value: '₹0.00', icon: IndianRupee, change: 'Phase 5 Ready' },
    { title: "Orders Processed", value: '0', icon: ShoppingBag, change: 'Live counter' },
    { title: "Active Customers", value: '0', icon: Users, change: 'CRM tracking' },
    { title: "Average Ticket Size", value: '₹0.00', icon: TrendingUp, change: 'Analytics' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-charcoal-800">
        <div>
          <h1 className="font-serif font-bold text-xl text-ivory-50">Admin Analytics Dashboard</h1>
          <p className="text-xs text-gray-400">The Station Stories – Master Store Control</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-600/10 border border-gold-600/30 text-gold-500 text-xs">
          <span>Route: /admin</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-charcoal-800/60 border border-charcoal-700/60 rounded-xl p-4">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>{kpi.title}</span>
                <Icon className="w-4 h-4 text-gold-500" />
              </div>
              <div className="font-serif text-2xl font-bold text-ivory-50 mt-2">{kpi.value}</div>
              <div className="text-[11px] text-gray-500 mt-1">{kpi.change}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-charcoal-800/40 border border-charcoal-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-2">
          <AlertCircle className="w-4 h-4" />
          <span>Phase 1 Architecture Status</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          The administrative routing hierarchy and layout scaffolding are established. Full dashboard analytics, menu CRUD operations, price editing, customer purchase CRM, and flexible GST tax controls will be integrated during Phase 5.
        </p>
      </div>

      <div>
        <HealthStatusBanner />
      </div>
    </div>
  );
}
