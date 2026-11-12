import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import PosLayout from '../layouts/PosLayout';

// Pages
import HomePage from '../pages/customer/HomePage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import PosPage from '../pages/pos/PosPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Facing Web Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* POS Terminal Routes */}
      <Route path="/pos" element={<PosLayout />}>
        <Route index element={<PosPage />} />
      </Route>

      {/* Admin Management Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
