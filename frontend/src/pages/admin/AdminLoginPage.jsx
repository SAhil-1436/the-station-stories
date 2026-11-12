import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-charcoal-900 border border-charcoal-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gold-600/10 border border-gold-600/30 text-gold-500 mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-serif font-bold text-xl text-ivory-50">Admin Authentication</h1>
          <p className="text-xs text-gray-400 mt-1">The Station Stories – Management Portal</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                disabled
                placeholder="admin"
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-xs text-ivory-100 placeholder-gray-500 opacity-70 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                disabled
                placeholder="••••••••••••"
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-xs text-ivory-100 placeholder-gray-500 opacity-70 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center">
            Phase 1 Placeholder: Authentication logic and JWT issuance will be connected in Phase 2.
          </div>

          <Link
            to="/admin"
            className="w-full block text-center py-2.5 rounded-lg bg-gold-600 hover:bg-gold-500 text-charcoal-950 font-semibold text-xs transition-colors"
          >
            Preview Admin Dashboard (Phase 1)
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-charcoal-800 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold-500 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Customer Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
