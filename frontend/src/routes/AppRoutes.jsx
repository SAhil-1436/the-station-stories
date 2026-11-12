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

// Admin & POS Placeholders (Separate from Phase 3 Customer Application)
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
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

      {/* POS Terminal Routes (Preserved Placeholders) */}
      <Route path="/pos" element={<PosLayout />}>
        <Route index element={<PosPage />} />
      </Route>

      {/* Admin Management Routes (Preserved Placeholders) */}
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
