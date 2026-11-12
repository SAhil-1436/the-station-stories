import React from 'react';
import { Award, Flame, UtensilsCrossed } from 'lucide-react';

export default function BestsellersTable({
  items = [],
  formatCurrency,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-lavender-200 shadow-soft animate-pulse space-y-4">
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 bg-lavender-200 rounded w-48" />
          <div className="h-4 bg-lavender-100 rounded w-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-lavender-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-lavender-200 shadow-soft">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-muted" />
            <h3 className="font-serif font-bold text-lg text-plum-royal">
              Top 5 Bestselling Dishes
            </h3>
          </div>
          <p className="text-xs text-body-muted mt-0.5 font-light">
            Ranked by total quantity sold today through dine-in, counter, and QR orders
          </p>
        </div>

        {hasItems && (
          <span className="text-xs font-semibold text-plum-royal bg-lavender-100 px-3 py-1 rounded-full border border-gold/30 self-start sm:self-auto">
            {items.length} Leaderboard Dishes
          </span>
        )}
      </div>

      {/* Content */}
      {!hasItems ? (
        <div className="py-12 px-4 rounded-xl bg-lavender-50/50 border border-lavender-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-lavender-100 border border-gold/30 text-plum-royal flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-6 h-6 text-plum-royal/70" />
          </div>
          <h4 className="font-serif font-bold text-base text-plum-royal">
            No Dish Sales Recorded Yet Today
          </h4>
          <p className="text-xs text-body-muted max-w-md mx-auto leading-relaxed font-light">
            As counter orders and QR digital invoices are finalized, the top 5 highest-velocity menu items will automatically appear here with their sales volumes and revenues.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-lavender-200 text-[11px] font-semibold text-body-muted uppercase tracking-wider bg-lavender-50/60">
                <th className="py-3 px-3.5 rounded-l-xl w-14">Rank</th>
                <th className="py-3 px-4">Dish Name</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lavender-100">
              {items.map((item, index) => {
                const isTop1 = index === 0;
                return (
                  <tr
                    key={item.itemName || index}
                    className="hover:bg-lavender-50/40 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isTop1
                            ? 'bg-plum-royal text-gold-300 border border-gold shadow-xs'
                            : 'bg-lavender-100 text-plum-royal'
                        }`}
                      >
                        {isTop1 ? <Award className="w-3.5 h-3.5" /> : index + 1}
                      </div>
                    </td>

                    {/* Dish Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-plum-royal group-hover:text-gold-700 transition-colors">
                        {item.itemName}
                      </div>
                      {isTop1 && (
                        <span className="text-[10px] text-gold-700 font-medium tracking-wider uppercase">
                          #1 Today’s Chef Favorite
                        </span>
                      )}
                    </td>

                    {/* Quantity Sold */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-lavender-100 text-plum-royal">
                        {item.quantitySold} units
                      </span>
                    </td>

                    {/* Total Revenue */}
                    <td className="py-3.5 px-4 text-right font-serif font-bold text-sm text-plum-royal">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
