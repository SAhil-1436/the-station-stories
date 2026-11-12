import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  QrCode, 
  Search, 
  ShoppingBag, 
  BellRing, 
  Check, 
  X, 
  Plus, 
  Minus,
  Sparkles 
} from 'lucide-react';
import { getCategories, getMenu } from '../../services/api';

export default function QrMenuPage() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCabin, setSelectedCabin] = useState('Cabin 1');
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [tray, setTray] = useState({});
  const [isTrayModalOpen, setIsTrayModalOpen] = useState(false);
  const [serverCalled, setServerCalled] = useState(false);

  const cabinOptions = [
    'Cabin 1 (Express Lounge)',
    'Cabin 2 (Royal Cabin)',
    'Cabin 3 (First Class Cabin)',
    'Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5',
    'Table 6', 'Table 7', 'Table 8', 'Table 9', 'Table 10'
  ];

  useEffect(() => {
    Promise.all([getCategories(), getMenu()]).then(([cats, items]) => {
      setCategories(cats || []);
      setMenuItems(items || []);
      if (cats && cats.length > 0) setActiveCategory(cats[0].id);
    });
  }, []);

  const handleAddItem = (item) => {
    setTray(prev => ({
      ...prev,
      [item.id]: {
        item,
        quantity: (prev[item.id]?.quantity || 0) + 1
      }
    }));
  };

  const handleDecrementItem = (itemId) => {
    setTray(prev => {
      const copy = { ...prev };
      if (copy[itemId]) {
        if (copy[itemId].quantity > 1) {
          copy[itemId].quantity -= 1;
        } else {
          delete copy[itemId];
        }
      }
      return copy;
    });
  };

  const trayList = Object.values(tray);
  const totalItems = trayList.reduce((acc, curr) => acc + curr.quantity, 0);
  const grandEstimatedTotal = trayList.reduce((acc, curr) => acc + (Number(curr.item.price) * curr.quantity), 0);

  const handleCallServer = () => {
    setServerCalled(true);
    setTimeout(() => setServerCalled(false), 5000);
  };

  const filteredItems = menuItems.filter(item => {
    if (activeCategory && item.categoryId !== activeCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || (item.hindiName && item.hindiName.includes(q));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-charcoal-950 pb-28">
      {/* Top Sticky Header */}
      <div className="sticky top-16 z-30 bg-plum-950/95 backdrop-blur-md border-b border-gold-500/20 px-4 py-3 shadow-md">
        <div className="max-w-3xl mx-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-gold-400" />
              <span className="font-serif font-bold text-sm text-ivory-100">{t('qr.title')}</span>
            </div>

            {/* Table / Cabin Selector */}
            <div className="flex items-center gap-1.5">
              <select
                value={selectedCabin}
                onChange={(e) => setSelectedCabin(e.target.value)}
                className="bg-plum-900 border border-gold-500/40 text-gold-400 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold-300"
              >
                {cabinOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gold-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('menu.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-plum-900/60 border border-gold-500/30 text-ivory-100 placeholder-ivory-200/40 text-xs focus:outline-none focus:border-gold-400"
            />
          </div>

          {/* Category Tabs Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => {
              const isSelected = activeCategory === cat.id;
              const title = i18n.language.startsWith('hi') && cat.hindiName ? cat.hindiName : cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-gold-500 text-charcoal-950 font-bold shadow'
                      : 'bg-plum-900/50 text-ivory-200/80 border border-gold-500/20 hover:text-gold-400'
                  }`}
                >
                  {title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Table Welcome Banner */}
        <div className="p-3.5 rounded-xl bg-plum-900/40 border border-gold-500/20 flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-gold-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-ivory-100">Welcome to {selectedCabin}</p>
              <p className="text-[11px] text-ivory-200/70">Browse dishes, build your order tray, and call your captain anytime.</p>
            </div>
          </div>
          <button
            onClick={handleCallServer}
            disabled={serverCalled}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              serverCalled
                ? 'bg-green-600 text-white'
                : 'bg-plum-800 text-gold-400 border border-gold-500/40 hover:bg-plum-700'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>{serverCalled ? 'Captain Notified!' : t('qr.callServer')}</span>
          </button>
        </div>

        {/* Compact Dish Items List */}
        <div className="space-y-3">
          {filteredItems.map(item => {
            const count = tray[item.id]?.quantity || 0;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-plum-950/70 border border-gold-500/20 flex items-center justify-between gap-3 hover:border-gold-500/40 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3.5 h-3.5 rounded border border-green-500 bg-white flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    </div>
                    <h3 className="font-serif font-bold text-sm text-ivory-100 truncate">
                      {i18n.language.startsWith('hi') && item.hindiName ? item.hindiName : item.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-ivory-200/60 line-clamp-1">{item.description}</p>
                  <p className="text-sm font-serif font-bold text-gold-400 mt-1">₹{Number(item.price).toFixed(0)}</p>
                </div>

                {/* Add / Adjust Controls */}
                <div className="shrink-0">
                  {count > 0 ? (
                    <div className="inline-flex items-center gap-2 bg-plum-900 border border-gold-500/40 rounded-lg p-1">
                      <button
                        onClick={() => handleDecrementItem(item.id)}
                        className="w-6 h-6 rounded bg-plum-800 text-ivory-100 flex items-center justify-center hover:bg-plum-700"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-gold-400 px-1">{count}</span>
                      <button
                        onClick={() => handleAddItem(item)}
                        className="w-6 h-6 rounded bg-gold-500 text-charcoal-950 flex items-center justify-center hover:bg-gold-400"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddItem(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gold-500 text-charcoal-950 hover:bg-gold-400 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Order Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsTrayModalOpen(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 text-charcoal-950 shadow-2xl font-bold active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5" />
              <span>{totalItems} Items Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-serif">₹{grandEstimatedTotal.toFixed(0)}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-charcoal-950 text-gold-400">View Tray</span>
            </div>
          </button>
        </div>
      )}

      {/* Tray Detail Modal */}
      {isTrayModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsTrayModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-plum-950 border border-gold-500/30 rounded-2xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-plum-900">
              <div>
                <h3 className="font-serif font-bold text-lg text-ivory-100">Order Tray • {selectedCabin}</h3>
                <p className="text-xs text-gold-400">{totalItems} dishes selected</p>
              </div>
              <button
                onClick={() => setIsTrayModalOpen(false)}
                className="p-1 rounded-full text-ivory-200 hover:text-gold-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {trayList.map(({ item, quantity }) => (
                <div key={item.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-plum-900/50">
                  <span className="font-semibold text-ivory-100">{item.name} × {quantity}</span>
                  <span className="font-mono text-gold-400 font-bold">₹{(Number(item.price) * quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-plum-900 flex items-center justify-between text-base font-bold">
              <span className="text-ivory-100">Estimated Total:</span>
              <span className="text-gold-400 font-serif text-xl">₹{grandEstimatedTotal.toFixed(0)}</span>
            </div>

            <p className="text-[11px] text-ivory-200/70 text-center leading-relaxed">
              Show this screen to your table captain or order at the counter.
            </p>

            <button
              onClick={() => setIsTrayModalOpen(false)}
              className="w-full py-3 rounded-xl text-xs font-bold bg-gold-500 text-charcoal-950 hover:bg-gold-400 transition-colors"
            >
              Done & Return to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
