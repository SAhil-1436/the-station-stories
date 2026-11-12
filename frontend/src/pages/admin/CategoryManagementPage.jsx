import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';
import { getCategories, deleteCategory } from '../../services/adminApi.js';
import CategoryModal, { getCategoryIconComponent } from '../../components/admin/CategoryModal.jsx';
import ConfirmModal from '../../components/admin/ConfirmModal.jsx';

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      // Sort primarily by displayOrder ascending
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      );
      setCategories(sorted);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load categories. Please verify your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    return categories.filter((cat) => {
      const name = (cat.name || '').toLowerCase();
      const hindi = (cat.hindiName || '').toLowerCase();
      return name.includes(query) || hindi.includes(query);
    });
  }, [categories, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive !== false).length;
    const totalDishes = categories.reduce((sum, c) => sum + (Number(c.itemCount) || 0), 0);
    return { total, active, totalDishes };
  }, [categories]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  // Saved callback (Create or Edit)
  const handleSaved = (savedCategory) => {
    fetchCategories();
    showToast(
      editingCategory
        ? `Category "${savedCategory.name}" updated successfully`
        : `Category "${savedCategory.name}" created successfully`
    );
  };

  // Open Delete Modal
  const handleOpenDelete = (cat) => {
    setDeletingCategory(cat);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  // Confirm Category Deletion
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteCategory(deletingCategory.id);
      setIsDeleteModalOpen(false);
      setDeletingCategory(null);
      showToast(`Category "${deletingCategory.name}" removed safely`);
      fetchCategories();
    } catch (err) {
      // Backend returns HTTP 400 Bad Request if category contains dishes
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to delete category.';
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-lavender-200 shadow-luxury animate-slideDown">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold text-plum-royal">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-body-muted hover:text-plum-royal ml-2"
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
        <span className="text-plum-royal font-semibold">Category Management</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-lavender-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif font-bold text-2xl text-plum-royal">
              Category Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold-700 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Live Catalog</span>
            </span>
          </div>
          <p className="text-xs text-body-muted mt-0.5">
            Organize food categories, sequence display order, and maintain catalog taxonomy
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchCategories}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-lavender-200 bg-white text-xs font-semibold text-plum-royal hover:bg-lavender-100 transition-colors disabled:opacity-50"
            title="Refresh Categories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all"
          >
            <Plus className="w-4 h-4 text-gold" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">Total Categories</span>
            <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center text-plum-royal">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-plum-royal mt-2">
            {metrics.total}
          </p>
          <span className="text-[11px] text-body-muted">Configured catalog sections</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">Active On Public Menu</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-emerald-700 mt-2">
            {metrics.active}
          </p>
          <span className="text-[11px] text-body-muted">
            {metrics.total - metrics.active > 0
              ? `${metrics.total - metrics.active} category currently hidden`
              : 'All categories visible'}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-lavender-200 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-body-muted">Total Associated Dishes</span>
            <div className="w-8 h-8 rounded-xl bg-gold/15 text-gold-700 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif font-bold text-2xl text-plum-royal mt-2">
            {metrics.totalDishes}
          </p>
          <span className="text-[11px] text-body-muted">Active items across all categories</span>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-lavender-200 shadow-soft flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-body-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by English or Hindi name..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-ivory-50 border border-lavender-200 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
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
        <span className="text-xs text-body-muted px-2 hidden sm:inline">
          Showing <b>{filteredCategories.length}</b> of {categories.length}
        </span>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeleton */
        <div className="bg-white rounded-3xl border border-lavender-200 shadow-soft p-6 space-y-4">
          <div className="h-6 w-48 bg-lavender-100 rounded-lg animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 bg-ivory-50 rounded-2xl border border-lavender-200/60 animate-pulse flex items-center justify-between px-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-lavender-200/50" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-lavender-200/60 rounded" />
                    <div className="h-3 w-20 bg-lavender-200/40 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 bg-lavender-200/50 rounded-full" />
                  <div className="h-8 w-20 bg-lavender-200/60 rounded-full" />
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
            Failed to Load Categories
          </h3>
          <p className="text-xs text-body-muted max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchCategories}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-plum-royal text-white text-xs font-semibold hover:bg-plum-dark transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-lavender-200 p-12 text-center space-y-4 shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-lg text-plum-royal">
            {searchQuery ? 'No Matching Categories Found' : 'No Categories Configured'}
          </h3>
          <p className="text-xs text-body-muted max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? `No categories match "${searchQuery}". Try searching with a different term.`
              : 'Add your first menu category to structure and organize the restaurant catalog.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-full border border-lavender-200 text-xs font-semibold text-plum-royal hover:bg-lavender-100 transition-colors"
            >
              Clear Search Query
            </button>
          ) : (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-plum-royal hover:bg-plum-dark text-white text-xs font-semibold shadow-soft transition-all"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span>Create First Category</span>
            </button>
          )}
        </div>
      ) : (
        /* Data Table */
        <div className="bg-white rounded-3xl border border-lavender-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-lavender-50/60 border-b border-lavender-200 text-[11px] font-semibold text-plum-royal uppercase tracking-wider">
                  <th className="py-3.5 px-5 text-center w-16">Seq</th>
                  <th className="py-3.5 px-4">Category Details</th>
                  <th className="py-3.5 px-4 text-center">Associated Dishes</th>
                  <th className="py-3.5 px-4 text-center">Visibility</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender-100 text-xs">
                {filteredCategories.map((cat) => {
                  const IconComponent = getCategoryIconComponent(cat.iconName);
                  const isCatActive = cat.isActive !== false;
                  const count = Number(cat.itemCount) || 0;

                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-ivory-50/70 transition-colors group"
                    >
                      {/* Sequence Number */}
                      <td className="py-4 px-5 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-lavender-100 font-semibold text-[11px] text-plum-royal border border-gold/30">
                          {cat.displayOrder ?? 0}
                        </span>
                      </td>

                      {/* Category Name & Icon */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-lavender-100/70 border border-gold/30 flex items-center justify-center text-plum-royal flex-shrink-0 group-hover:bg-plum-royal group-hover:text-gold transition-colors">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-plum-royal text-sm">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-body-muted">#{cat.id}</span>
                            </div>
                            {cat.hindiName ? (
                              <p className="text-xs text-body-muted font-hindi">
                                {cat.hindiName}
                              </p>
                            ) : (
                              <p className="text-[11px] text-body-muted/70 italic">
                                No Hindi title
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Associated Dish Count */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            count > 0
                              ? 'bg-lavender-100 text-plum-royal border border-gold/30'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5 text-gold-600" />
                          <span>{count} {count === 1 ? 'dish' : 'dishes'}</span>
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-4 text-center">
                        {isCatActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Hidden
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-2 rounded-xl text-body-muted hover:text-plum-royal hover:bg-lavender-100 border border-transparent hover:border-lavender-200 transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDelete(cat)}
                            className="p-2 rounded-xl text-body-muted hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                            title={
                              count > 0
                                ? `Contains ${count} dishes. Must be reassigned before deleting.`
                                : 'Delete Category'
                            }
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Category Create/Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={editingCategory}
        onSaved={handleSaved}
      />

      {/* Category Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCategory(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Menu Category"
        message={
          deletingCategory
            ? `Are you sure you want to permanently delete "${deletingCategory.name}" (#${deletingCategory.id})?`
            : 'Are you sure you want to delete this category?'
        }
        warningNote={
          deletingCategory && Number(deletingCategory.itemCount) > 0
            ? `Note: This category currently contains ${deletingCategory.itemCount} menu item(s). The system will safely reject deletion if dishes are still attached.`
            : null
        }
        errorMessage={deleteError}
        confirmText="Delete Category"
        cancelText="Keep Category"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
