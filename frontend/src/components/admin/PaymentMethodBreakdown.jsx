import React from 'react';
import { Banknote, QrCode, CreditCard, PieChart } from 'lucide-react';

export default function PaymentMethodBreakdown({
  cashSales = 0,
  upiSales = 0,
  otherSales = 0,
  formatCurrency,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-lavender-200 shadow-soft animate-pulse space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-lavender-200 rounded w-48" />
          <div className="h-4 bg-lavender-100 rounded w-20" />
        </div>
        <div className="h-6 bg-lavender-200 rounded-full w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="h-20 bg-lavender-100 rounded-xl" />
          <div className="h-20 bg-lavender-100 rounded-xl" />
          <div className="h-20 bg-lavender-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const cash = Number(cashSales) || 0;
  const upi = Number(upiSales) || 0;
  const other = Number(otherSales) || 0;
  const total = cash + upi + other;

  const cashPct = total > 0 ? (cash / total) * 100 : 0;
  const upiPct = total > 0 ? (upi / total) * 100 : 0;
  const otherPct = total > 0 ? (other / total) * 100 : 0;

  const channels = [
    {
      label: 'Cash Intake',
      amount: cash,
      pct: cashPct,
      color: 'bg-plum-royal',
      textColor: 'text-plum-royal',
      borderColor: 'border-plum-royal/30',
      icon: Banknote,
      description: 'Physical cash counter receipts',
    },
    {
      label: 'UPI QR Payments',
      amount: upi,
      pct: upiPct,
      color: 'bg-gold',
      textColor: 'text-gold-700',
      borderColor: 'border-gold/40',
      icon: QrCode,
      description: 'Digital dynamic UPI transactions',
    },
    {
      label: 'Card / Other',
      amount: other,
      pct: otherPct,
      color: 'bg-rose-muted',
      textColor: 'text-rose-muted',
      borderColor: 'border-rose-muted/40',
      icon: CreditCard,
      description: 'Card terminal & other channels',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-lavender-200 shadow-soft">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-gold-600" />
            <h3 className="font-serif font-bold text-lg text-plum-royal">
              Payment Method Breakdown
            </h3>
          </div>
          <p className="text-xs text-body-muted mt-0.5 font-light">
            Distribution of today's settled customer payments across settlement channels
          </p>
        </div>

        <div className="text-xs font-semibold text-plum-royal bg-lavender-100 px-3 py-1 rounded-full border border-gold/30 self-start sm:self-auto">
          Total: {formatCurrency(total)}
        </div>
      </div>

      {/* Multi-segment Visual Breakdown Bar */}
      <div className="space-y-2 mb-6">
        <div className="h-5 rounded-full bg-lavender-100 overflow-hidden flex shadow-inner border border-lavender-200">
          {total > 0 ? (
            <>
              {cashPct > 0 && (
                <div
                  style={{ width: `${cashPct}%` }}
                  className="bg-plum-royal transition-all duration-500 hover:opacity-90"
                  title={`Cash: ${formatCurrency(cash)} (${cashPct.toFixed(1)}%)`}
                />
              )}
              {upiPct > 0 && (
                <div
                  style={{ width: `${upiPct}%` }}
                  className="bg-gold transition-all duration-500 hover:opacity-90"
                  title={`UPI: ${formatCurrency(upi)} (${upiPct.toFixed(1)}%)`}
                />
              )}
              {otherPct > 0 && (
                <div
                  style={{ width: `${otherPct}%` }}
                  className="bg-rose-muted transition-all duration-500 hover:opacity-90"
                  title={`Other: ${formatCurrency(other)} (${otherPct.toFixed(1)}%)`}
                />
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-center text-[10px] text-body-muted font-medium italic">
              No transactions recorded yet today
            </div>
          )}
        </div>

        {/* Proportional Percentage Indicators */}
        {total > 0 && (
          <div className="flex items-center justify-between text-[11px] text-body-muted font-mono px-1">
            <span className="text-plum-royal font-semibold">
              Cash: {cashPct.toFixed(1)}%
            </span>
            <span className="text-gold-700 font-semibold">
              UPI: {upiPct.toFixed(1)}%
            </span>
            <span className="text-rose-muted font-semibold">
              Other: {otherPct.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Legend & Channel Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <div
              key={channel.label}
              className="p-4 rounded-xl bg-lavender-50/60 border border-lavender-200 flex flex-col justify-between hover:bg-lavender-100/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-plum-royal flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${channel.color}`} />
                  {channel.label}
                </span>
                <div className="w-7 h-7 rounded-lg bg-white border border-lavender-200 flex items-center justify-center text-plum-royal">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="my-1">
                <span className="font-serif text-xl font-bold text-plum-royal block">
                  {formatCurrency(channel.amount)}
                </span>
                <span className="text-[11px] font-mono text-gold-700 font-semibold">
                  {channel.pct.toFixed(1)}% of sales
                </span>
              </div>

              <p className="text-[10px] text-body-muted font-light mt-1 border-t border-lavender-200/60 pt-1.5">
                {channel.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
