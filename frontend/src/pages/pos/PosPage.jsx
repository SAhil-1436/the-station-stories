import React from 'react';
import { ShoppingCart, Printer, Search, CreditCard, Banknote, QrCode } from 'lucide-react';
import HealthStatusBanner from '../../components/common/HealthStatusBanner';

export default function PosPage() {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
      {/* Left Pane: Catalog & Category Selector Placeholder */}
      <div className="flex-1 flex flex-col bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-charcoal-800 gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              disabled
              placeholder="Search dishes or scan code (Phase 4)..."
              className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-ivory-100 placeholder-gray-500 opacity-60 cursor-not-allowed"
            />
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-gold-600/10 text-gold-500 border border-gold-600/30 whitespace-nowrap">
            Route: /pos
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
          <div className="w-12 h-12 rounded-xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-gold-500 mb-3">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-bold text-lg text-ivory-50">POS Product Catalog Placeholder</h2>
          <p className="text-xs max-w-md mt-2 text-gray-400 leading-relaxed">
            Fast touch and keyboard item selection grid, category buttons (Burgers, Pizzas, Fast Food, Beverages), and live dish stock toggles will be fully connected to backend APIs in Phase 4.
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-charcoal-800">
          <HealthStatusBanner />
        </div>
      </div>

      {/* Right Pane: Live Cart & Thermal Print Simulator Placeholder */}
      <div className="w-full lg:w-96 bg-charcoal-900 border border-charcoal-800 rounded-xl p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h3 className="font-serif font-bold text-sm text-ivory-50 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-gold-500" />
              <span>Current Order Cart</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">0 Items</span>
          </div>

          <div className="py-8 text-center text-xs text-gray-500">
            Cart is empty. Items selected from counter catalog will populate here.
          </div>

          <div className="space-y-2 pt-4 border-t border-charcoal-800/80 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span className="font-mono text-ivory-100">₹0.00</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Discount</span>
              <span className="font-mono text-ivory-100">₹0.00</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tax (GST Disabled)</span>
              <span className="font-mono text-emerald-400">₹0.00</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-gold-500 pt-2 border-t border-charcoal-700/60">
              <span>Payable Total</span>
              <span className="font-mono">₹0.00</span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 pt-6 border-t border-charcoal-800">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              disabled
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gray-400 opacity-60 cursor-not-allowed"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Cash</span>
            </button>
            <button
              disabled
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700 text-gray-400 opacity-60 cursor-not-allowed"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>UPI QR</span>
            </button>
          </div>

          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold-600/40 text-charcoal-950 font-semibold text-xs opacity-60 cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span>Settle & Print Thermal Receipt (Phase 4)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
