import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-charcoal-900 text-ivory-100">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-charcoal-800 bg-charcoal-950 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} The Station Stories. All rights reserved.</span>
          <span className="text-[11px] text-gray-400">
            Phase 1 Scaffolding – Customer Web & POS Platform
          </span>
        </div>
      </footer>
    </div>
  );
}
