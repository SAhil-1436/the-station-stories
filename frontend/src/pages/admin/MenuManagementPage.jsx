import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ArrowLeft, Clock, Sparkles } from 'lucide-react';

export default function MenuManagementPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-body-muted">
        <Link to="/admin" className="hover:text-plum-royal transition-colors">
          Admin Hub
        </Link>
        <span>/</span>
        <span className="text-plum-royal font-semibold">Menu Management</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-lavender-200">
        <div>
          <h1 className="font-serif font-bold text-2xl text-plum-royal">
            Menu Management
          </h1>
          <p className="text-xs text-body-muted mt-0.5">
            Master dish catalog, availability toggle, and price management
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-100 border border-gold/30 text-plum-royal text-xs font-semibold self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-gold-600" />
          <span>Scheduled for Phase 4.4</span>
        </span>
      </div>

      {/* Scoped Placeholder Card */}
      <div className="bg-white rounded-3xl p-8 border border-lavender-200 shadow-soft text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal mx-auto">
          <Utensils className="w-7 h-7 text-plum-royal" />
        </div>
        <h2 className="font-serif font-bold text-xl text-plum-royal">
          Menu Engineering & Dish Catalog Module
        </h2>
        <p className="text-xs text-body-muted max-w-lg mx-auto leading-relaxed">
          The layout and routing for menu management are verified. Master catalog CRUD, real-time 86 availability toggle, quick price updates, and multipart photograph uploads will be implemented in Phase 4.4.
        </p>

        <div className="pt-2">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lavender-100 hover:bg-lavender-200 text-plum-royal text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gold-600" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
