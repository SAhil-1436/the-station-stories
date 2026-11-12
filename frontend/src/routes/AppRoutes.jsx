import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import PosLayout from '../layouts/PosLayout';

// Customer Pages
import HomePage from '../pages/customer/HomePage';
import MenuPage from '../pages/customer/MenuPage';
import QrMenuPage from '../pages/customer/QrMenuPage';
import GalleryPage from '../pages/customer/GalleryPage';
import AboutPage from '../pages/customer/AboutPage';
import ContactPage from '../pages/customer/ContactPage';
import PublicInvoicePage from '../pages/customer/PublicInvoicePage';

import ProtectedRoute from './ProtectedRoute';
import PosProtectedRoute from './PosProtectedRoute';

// Admin Pages
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import MenuManagementPage from '../pages/admin/MenuManagementPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import BillsManagementPage from '../pages/admin/BillsManagementPage';
import StaffManagementPage from '../pages/admin/StaffManagementPage';
import ReportsPage from '../pages/admin/ReportsPage';
import SettingsPage from '../pages/admin/SettingsPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';

// POS Placeholder
import PosPage from '../pages/pos/PosPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Facing Web Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="qr-menu" element={<QrMenuPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="bill/view/:uuid" element={<PublicInvoicePage />} />
      </Route>

      {/* POS Terminal Counter Routes (Phase 5.2 Protected: ROLE_ADMIN, ROLE_CASHIER) */}
      <Route
        path="/pos"
        element={
          <PosProtectedRoute>
            <PosLayout />
          </PosProtectedRoute>
        }
      >
        <Route index element={<PosPage />} />
      </Route>

      {/* Admin Public Route (Login) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Management Routes (Protected with ROLE_ADMIN) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="categories" element={<CategoryManagementPage />} />
        <Route path="bills" element={<BillsManagementPage />} />
        <Route path="staff" element={<StaffManagementPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
