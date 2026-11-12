import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FloatingWhatsApp from '../components/common/FloatingWhatsApp';
import BackToTop from '../components/common/BackToTop';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-body font-sans selection:bg-gold selection:text-plum-dark">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <BackToTop />
    </div>
  );
}
