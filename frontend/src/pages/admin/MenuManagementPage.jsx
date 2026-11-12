import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Camera,
  IndianRupee,
  Edit3,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Flame,
  Layers,
  Image as ImageIcon,
  Tag,
  Loader2,
} from 'lucide-react';
import {
  getMenuItems,
  getCategories,
  toggleMenuAvailability,
} from '../../services/adminApi.js';
import DishModal from '../../components/admin/DishModal.jsx';
import PriceModal from '../../components/admin/PriceModal.jsx';
import PhotoUploadModal from '../../components/admin/PhotoUploadModal.jsx';

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedVegFilter, setSelectedVegFilter] = useState('ALL'); // 'ALL' | 'VEG' | 'NON_VEG'
  const [selectedAvailability, setSelectedAvailability] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'UNAVAILABLE'

  // Modals state
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [pricingDish, setPricingDish] = useState(null);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoDish, setPhotoDish] = useState(null);

  // Toggle availability loading tracker: { [id]: boolean }
  const [toggleLoading, setToggleLoading] = useState({});

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch menu and categories
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [menuData, categoryData] = await Promise.all([
        getMenuItems(),
        getCategories(),
      ]);

      const sortedCategories = (Array.isArray(categoryData) ? categoryData : []).sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      );
      setCategories(sortedCategories);
      setMenuItems(Array.isArray(menuData) ? menuData : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load menu catalog. Please verify your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Search query (English name, Hindi name, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (item.name || '').toLowerCase().includes(q);
        const hindiMatch = (item.hindiName || '').toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        if (!nameMatch && !hindiMatch && !descMatch) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        const catId = Number(selectedCategory);
        if (item.categoryId !== catId) {
          return false;
        }
      }

      // Veg / Non-Veg filter
      const isVeg = item.veg !== undefined ? Boolean(item.veg) : (item.isVeg !== undefined ? Boolean(item.isVeg) : true);
      if (selectedVegFilter === 'VEG' && !isVeg) return false;
      if (selectedVegFilter === 'NON_VEG' && isVeg) return false;

      // Availability filter
      const isAvail = item.available !== undefined ? Boolean(item.available) : (item.isAvailable !== undefined ? Boolean(item.isAvailable) : true);
      if (selectedAvailability === 'AVAILABLE' && !isAvail) return false;
      if (selectedAvailability === 'UNAVAILABLE' && isAvail) return false;

      return true;
    });
  }, [menuItems, searchQuery, selectedCategory, selectedVegFilter, selectedAvailability]);

  // Catalog Metrics
  const metrics = useMemo(() => {
    const total = menuItems.length;
    let availableCount = 0;
    let vegCount = 0;

    menuItems.forEach((item) => {
      const isAvail = item.available !== undefined ? Boolean(item.available) : (item.isAvailable !== undefined ? Boolean(item.isAvailable) : true);
      const isVeg = item.veg !== undefined ? Boolean(item.veg) : (item.isVeg !== undefined ? Boolean(item.isVeg) : true);
      if (isAvail) availableCount += 1;
      if (isVeg) vegCount += 1;
    });

    return {
      total,
      available: availableCount,
      unavailable: total - availableCount,
      veg: vegCount,
      nonVeg: total - vegCount,
    };
  }, [menuItems]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedVegFilter('ALL');
    setSelectedAvailability('ALL');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'ALL' ||
    selectedVegFilter !== 'ALL' ||
    selectedAvailability !== 'ALL';

  // Toggle availability (86 switch)
  const handleToggleAvailability = async (item) => {
    const currentStatus =
      item.available !== undefined ? Boolean(item.available) : (item.isAvailable !== undefined ? Boolean(item.isAvailable) : true);
    const targetStatus = !currentStatus;

    setToggleLoading((prev) => ({ ...prev, [item.id]: true }));
    try {
      const updated = await toggleMenuAvailability(item.id);

      // Optimistically update item in local state
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...updated, available: targetStatus, isAvailable: targetStatus } : i))
      );

      showToast(
        targetStatus
          ? `"${item.name}" is now IN STOCK (Available)`
          : `"${item.name}" is now 86'd (Unavailable)`,
        targetStatus ? 'success' : 'info'
      );
    } catch (err) {
      showToast(
        err?.response?.data?.message || 'Failed to toggle availability',
        'error'
      );
    } finally {
      setToggleLoading((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  // Dish Modal Openers
  const handleOpenCreateDish = () => {
    setEditingDish(null);
    setIsDishModalOpen(true);
  };

  const handleOpenEditDish = (item) => {
    setEditingDish(item);
    setIsDishModalOpen(true);
  };

  const handleDishSaved = (savedItem) => {
    fetchData();
    showToast(
      editingDish
        ? `Dish "${savedItem.name}" updated successfully`
        : `Dish "${savedItem.name}" registered successfully`
    );
  };

  // Price Modal Opener
  const handleOpenPriceModal = (item) => {
    setPricingDish(item);
    setIsPriceModalOpen(true);
  };

  const handlePriceSaved = (savedItem) => {
    fetchData();
    showToast(`Price for "${savedItem.name}" updated to ₹${Number(savedItem.price).toFixed(2)}`);
  };

  // Photo Modal Opener
  const handleOpenPhotoModal = (item) => {
    setPhotoDish(item);
    setIsPhotoModalOpen(true);
  };

  const handlePhotoSaved = (savedItem) => {
    fetchData();
    showToast(`Photograph updated for "${savedItem.name}"`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-lavender-200 shadow-luxury animate-slideDown">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold text-plum-royal">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-body-muted hover:text-plum-royal ml-2 text-base font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-body-muted">
        <Link to="/admin" className="hover:text-plum-royal transition-colors">
          Admin Hub
        </Link>
        <span>/</span>
        <span className="text-plum-royal font-semibold">Menu Management</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-lavender-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif font-bold text-2xl text-plum-royal">
              Menu Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold-700 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Catalog Master</span>
            </span>
          </div>
          <p className="text-xs text-body-muted mt-0.5">
            Master dish catalog, real-time 86 availability toggle, quick pricing, and photograph management
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-lavender-200 bg-white text-xs font-semibold text-plum-royal hover:bg-lavender-100 transition-colors disabled:opacity-50"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateDish}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all"
          >
            <Plus className="w-4 h-4 text-gold" />
            <span>New Dish</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Dishes */}
        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">Total Dishes</span>
            <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center text-plum-royal">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-plum-royal mt-2">
            {metrics.total}
          </p>
          <span className="text-[11px] text-body-muted">All catalog recipes</span>
        </div>

        {/* In Stock */}
        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">In Stock / Available</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-emerald-700 mt-2">
            {metrics.available}
          </p>
          <span className="text-[11px] text-body-muted">
            {metrics.total > 0
              ? `${Math.round((metrics.available / metrics.total) * 100)}% of catalog ready`
              : '0 items'}
          </span>
        </div>

        {/* 86'd / Unavailable */}
        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">86’d (Unavailable)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-rose-700 mt-2">
            {metrics.unavailable}
          </p>
          <span className="text-[11px] text-body-muted">Temporarily out of stock</span>
        </div>

        {/* Veg vs Non-Veg */}
        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">Classification</span>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded border border-emerald-600 flex items-center justify-center bg-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              </span>
              <span className="w-3.5 h-3.5 rounded border border-red-600 flex items-center justify-center bg-white">
                <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-600"></span>
              </span>
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-plum-royal mt-2">
            {metrics.veg} <span className="text-sm font-sans font-normal text-body-muted">Veg</span> / {metrics.nonVeg} <span className="text-sm font-sans font-normal text-body-muted">Non-Veg</span>
          </p>
          <span className="text-[11px] text-body-muted">Dietary breakdown</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-lavender-200 shadow-soft space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Query */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-body-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by dish name, Hindi name, or ingredients..."
              className="w-full pl-10 pr-8 py-2 text-xs bg-ivory-50 border border-lavender-200 rounded-2xl text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-body-muted hover:text-plum-royal"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-ivory-50 border border-lavender-200 rounded-2xl text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.hindiName ? `(${c.hindiName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedVegFilter}
              onChange={(e) => setSelectedVegFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-ivory-50 border border-lavender-200 rounded-2xl text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            >
              <option value="ALL">All Diet Types</option>
              <option value="VEG">Pure Veg Only</option>
              <option value="NON_VEG">Non-Veg Only</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-ivory-50 border border-lavender-200 rounded-2xl text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">In Stock Only</option>
              <option value="UNAVAILABLE">86’d / Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Results Count & Clear Button */}
        <div className="flex items-center justify-between text-xs text-body-muted pt-1 border-t border-lavender-100">
          <span>
            Showing <b>{filteredItems.length}</b> of {menuItems.length} dish items
          </span>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-plum-royal hover:underline font-semibold"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="bg-white rounded-3xl border border-lavender-200 shadow-soft p-6 space-y-4">
          <div className="h-6 w-48 bg-lavender-100 rounded-lg animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-16 bg-ivory-50 rounded-2xl border border-lavender-200/60 animate-pulse flex items-center justify-between px-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-lavender-200/50" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-lavender-200/60 rounded" />
                    <div className="h-3 w-24 bg-lavender-200/40 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-6 w-16 bg-lavender-200/50 rounded-full" />
                  <div className="h-8 w-24 bg-lavender-200/60 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-4 shadow-soft">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-plum-royal">
            Failed to Load Menu Catalog
          </h3>
          <p className="text-xs text-body-muted max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-plum-royal text-white text-xs font-semibold hover:bg-plum-dark transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-lavender-200 p-12 text-center space-y-4 shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal mx-auto">
            <Utensils className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-lg text-plum-royal">
            {hasActiveFilters ? 'No Matching Dishes Found' : 'Catalog is Currently Empty'}
          </h3>
          <p className="text-xs text-body-muted max-w-md mx-auto leading-relaxed">
            {hasActiveFilters
              ? 'No dishes match the selected filter criteria. Try adjusting or clearing your filters.'
              : 'Start building the restaurant menu by registering your first dish.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-full border border-lavender-200 text-xs font-semibold text-plum-royal hover:bg-lavender-100 transition-colors"
            >
              Reset All Filters
            </button>
          ) : (
            <button
              onClick={handleOpenCreateDish}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span>Register First Dish</span>
            </button>
          )}
        </div>
      ) : (
        /* Dish Table */
        <div className="bg-white rounded-3xl border border-lavender-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-lavender-50/60 border-b border-lavender-200 text-[11px] font-semibold text-plum-royal uppercase tracking-wider">
                  <th className="py-3.5 px-5">Dish</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Spice</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  <th className="py-3.5 px-4 text-center">Stock (86 Switch)</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender-100 text-xs">
                {filteredItems.map((item) => {
                  const isVeg = item.veg !== undefined ? Boolean(item.veg) : (item.isVeg !== undefined ? Boolean(item.isVeg) : true);
                  const isAvailable = item.available !== undefined ? Boolean(item.available) : (item.isAvailable !== undefined ? Boolean(item.isAvailable) : true);
                  const isOriginal = item.originalImage !== undefined ? Boolean(item.originalImage) : (item.isOriginalImage !== undefined ? Boolean(item.isOriginalImage) : false);
                  const isThisToggleLoading = Boolean(toggleLoading[item.id]);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-ivory-50/70 transition-colors group ${
                        !isAvailable ? 'bg-slate-50/40 opacity-75' : ''
                      }`}
                    >
                      {/* Dish Thumbnail & Titles */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3.5">
                          {/* Image Thumbnail */}
                          <div className="relative w-12 h-12 rounded-2xl bg-lavender-100 border border-lavender-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div
                              className={`flex items-center justify-center text-body-muted/60 ${
                                item.imageUrl ? 'hidden' : ''
                              }`}
                            >
                              <ImageIcon className="w-5 h-5" />
                            </div>

                            {/* Authentic Badge */}
                            {isOriginal && (
                              <span
                                className="absolute bottom-0 right-0 bg-gold-600 text-white p-0.5 rounded-tl-lg shadow"
                                title="Authentic Kitchen Photo"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>

                          {/* Titles & Dietary Icon */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {/* Veg / Non-Veg Icon */}
                              {isVeg ? (
                                <span
                                  className="w-3.5 h-3.5 rounded border border-emerald-600 flex items-center justify-center bg-white flex-shrink-0"
                                  title="Pure Vegetarian"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                </span>
                              ) : (
                                <span
                                  className="w-3.5 h-3.5 rounded border border-red-600 flex items-center justify-center bg-white flex-shrink-0"
                                  title="Non-Vegetarian"
                                >
                                  <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-600"></span>
                                </span>
                              )}

                              <span className="font-semibold text-plum-royal text-sm truncate">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-body-muted">#{item.id}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              {item.hindiName ? (
                                <span className="text-xs text-body-muted font-hindi">
                                  {item.hindiName}
                                </span>
                              ) : null}
                              {item.description && (
                                <span className="text-[11px] text-body-muted truncate max-w-xs hidden lg:inline">
                                  &bull; {item.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Pill */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-lavender-100 text-plum-royal border border-gold/30 text-[11px] font-semibold">
                          <Layers className="w-3 h-3 text-gold-600" />
                          <span>{item.categoryName || 'General'}</span>
                        </span>
                      </td>

                      {/* Spice Level */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-0.5">
                          {item.spiceLevel > 0 ? (
                            Array.from({ length: item.spiceLevel }).map((_, idx) => (
                              <Flame
                                key={idx}
                                className="w-3.5 h-3.5 text-amber-500 fill-amber-500"
                              />
                            ))
                          ) : (
                            <span className="text-[10px] text-body-muted/60">Mild</span>
                          )}
                        </div>
                      </td>

                      {/* Price (INR) */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-serif font-bold text-sm text-plum-royal">
                          ₹{Number(item.price || 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Live 86 Switch (In Stock vs Unavailable) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAvailable}
                              onChange={() => handleToggleAvailability(item)}
                              disabled={isThisToggleLoading}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>

                          {isThisToggleLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-plum-royal" />
                          ) : isAvailable ? (
                            <span className="text-[11px] font-semibold text-emerald-700 hidden sm:inline">
                              In Stock
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-rose-700 hidden sm:inline">
                              86’d
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Quick Price Update */}
                          <button
                            type="button"
                            onClick={() => handleOpenPriceModal(item)}
                            className="p-2 rounded-xl text-body-muted hover:text-plum-royal hover:bg-lavender-100 border border-transparent hover:border-lavender-200 transition-colors"
                            title="Quick Price Update"
                          >
                            <IndianRupee className="w-4 h-4 text-gold-600" />
                          </button>

                          {/* Upload/Change Photo */}
                          <button
                            type="button"
                            onClick={() => handleOpenPhotoModal(item)}
                            className="p-2 rounded-xl text-body-muted hover:text-plum-royal hover:bg-lavender-100 border border-transparent hover:border-lavender-200 transition-colors"
                            title="Change Photograph"
                          >
                            <Camera className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditDish(item)}
                            className="p-2 rounded-xl text-body-muted hover:text-plum-royal hover:bg-lavender-100 border border-transparent hover:border-lavender-200 transition-colors"
                            title="Edit Dish Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dish Create/Edit Modal */}
      <DishModal
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
        dish={editingDish}
        categories={categories}
        onSaved={handleDishSaved}
      />

      {/* Quick Price Modal */}
      <PriceModal
        isOpen={isPriceModalOpen}
        onClose={() => {
          setIsPriceModalOpen(false);
          setPricingDish(null);
        }}
        dish={pricingDish}
        onSaved={handlePriceSaved}
      />

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          setPhotoDish(null);
        }}
        dish={photoDish}
        onSaved={handlePhotoSaved}
      />
    </div>
  );
}
