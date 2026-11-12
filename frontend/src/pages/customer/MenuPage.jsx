import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Utensils, 
  Filter, 
  Sparkles, 
  Info, 
  ShoppingBag, 
  X, 
  ArrowRight,
  Pizza,
  Coffee,
  Check
} from 'lucide-react';
import { getCategories, getMenu } from '../../services/api';
import DishCard from '../../components/menu/DishCard';

export default function MenuPage() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // null = All
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trayItems, setTrayItems] = useState([]);
  const [isTrayOpen, setIsTrayOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, items] = await Promise.all([
          getCategories(),
          getMenu(),
        ]);
        setCategories(cats || []);
        setMenuItems(items || []);
      } catch (err) {
        console.error('Failed to load menu data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered Dishes
  const filteredDishes = useMemo(() => {
    return menuItems.filter(item => {
      // Category filter
      if (selectedCategory !== null && item.categoryId !== selectedCategory) {
        return false;
      }
      // Veg filter
      if (isVegOnly && !item.isVeg) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchHindi = item.hindiName ? item.hindiName.includes(q) : false;
        const matchDesc = item.description ? item.description.toLowerCase().includes(q) : false;
        return matchName || matchHindi || matchDesc;
      }
      return true;
    });
  }, [menuItems, selectedCategory, isVegOnly, searchQuery]);

  // Handle Add to Tray
  const handleAddToTray = (item) => {
    setTrayItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromTray = (id) => {
    setTrayItems(prev => prev.filter(i => i.id !== id));
  };

  const trayTotal = trayItems.reduce((acc, i) => acc + (Number(i.price) * i.quantity), 0);

  return (
    <div className="py-10 min-h-screen bg-charcoal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-gold-500 font-semibold">
            {t('brand.name')}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-ivory-100">
            {t('menu.title')}
          </h1>
          <p className="text-ivory-200/80 text-sm sm:text-base font-light">
            {t('menu.subtitle')}
          </p>

          {/* Representative Disclaimer Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-plum-950/80 border border-gold-500/20 text-xs text-ivory-200/70 mt-3">
            <Info className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Images marked with [Representative Image] are reference placeholders while we photograph our live culinary kitchen dishes.</span>
          </div>
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-gold-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('menu.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-plum-950/70 border border-gold-500/30 text-ivory-100 placeholder-ivory-200/40 text-sm focus:outline-none focus:border-gold-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory-200/50 hover:text-ivory-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Veg Switch & Tray Button */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Veg Only Toggle */}
              <button
                onClick={() => setIsVegOnly(!isVegOnly)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isVegOnly
                    ? 'bg-green-950/60 border-green-500 text-green-400 shadow-sm'
                    : 'bg-plum-950/60 border-gold-500/30 text-ivory-200 hover:border-gold-500/60'
                }`}
              >
                <div className="w-4 h-4 rounded border border-green-500 bg-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                </div>
                <span>{t('menu.vegOnly')}</span>
              </button>

              {/* Order Tray Pill */}
              {trayItems.length > 0 && (
                <button
                  onClick={() => setIsTrayOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gold-500 text-charcoal-950 hover:bg-gold-400 shadow-lg animate-bounce"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tray ({trayItems.reduce((a, b) => a + b.quantity, 0)}) • ₹{trayTotal.toFixed(0)}</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs Rail */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-md'
                  : 'bg-plum-950/60 border border-gold-500/20 text-ivory-200 hover:text-gold-400 hover:bg-plum-900'
              }`}
            >
              {t('menu.all')} ({menuItems.length})
            </button>

            {categories.map((cat) => {
              const count = menuItems.filter(i => i.categoryId === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              const title = i18n.language.startsWith('hi') && cat.hindiName ? cat.hindiName : cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-gold-500 text-charcoal-950 font-bold shadow-md'
                      : 'bg-plum-950/60 border border-gold-500/20 text-ivory-200 hover:text-gold-400 hover:bg-plum-900'
                  }`}
                >
                  {title} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Dishes Grid */}
        {loading ? (
          <div className="py-20 text-center text-gold-400 space-y-3">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">{t('common.loading')}</p>
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-plum-950/30 rounded-2xl border border-gold-500/10 p-8">
            <Utensils className="w-12 h-12 text-gold-500/40 mx-auto" />
            <h3 className="font-serif text-lg text-ivory-100">{t('menu.emptyResults')}</h3>
            <button
              onClick={() => { setSelectedCategory(null); setSearchQuery(''); setIsVegOnly(false); }}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-plum-900 text-gold-400 border border-gold-500/40 hover:bg-plum-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => {
              const isAdded = trayItems.some(i => i.id === dish.id);
              return (
                <DishCard
                  key={dish.id}
                  item={dish}
                  onAddToTray={handleAddToTray}
                  isAdded={isAdded}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-out Order Tray Drawer */}
      {isTrayOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsTrayOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-plum-950 h-full border-l border-gold-500/30 flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tray Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-plum-900">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gold-400" />
                  <h3 className="font-serif font-bold text-lg text-ivory-100">{t('qr.orderTray')}</h3>
                </div>
                <button
                  onClick={() => setIsTrayOpen(false)}
                  className="p-1 rounded-full text-ivory-200 hover:text-gold-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {trayItems.length === 0 ? (
                  <p className="text-xs text-ivory-200/50 text-center py-10">Your tray is empty.</p>
                ) : (
                  trayItems.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-plum-900/50 border border-gold-500/20 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-serif font-semibold text-sm text-ivory-100">{item.name}</p>
                        <p className="text-xs text-gold-400 font-mono">₹{Number(item.price).toFixed(0)} × {item.quantity} = ₹{(Number(item.price) * item.quantity).toFixed(0)}</p>
                      </div>
                      <button
                        onClick={() => removeFromTray(item.id)}
                        className="text-xs text-red-400 hover:text-red-300 p-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tray Footer */}
            <div className="pt-4 border-t border-plum-900 space-y-3">
              <div className="flex items-center justify-between text-base font-bold">
                <span className="text-ivory-200">{t('qr.total')}:</span>
                <span className="text-gold-400 font-serif text-xl">₹{trayTotal.toFixed(0)}</span>
              </div>
              <p className="text-[11px] text-ivory-200/60 text-center leading-relaxed">
                {t('qr.placeOrderNotice')}
              </p>
              <button
                onClick={() => setIsTrayOpen(false)}
                className="w-full py-3 rounded-xl text-sm font-bold bg-gold-500 text-charcoal-950 hover:bg-gold-400 transition-colors"
              >
                Close & Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
