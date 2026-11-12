import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FloatingWhatsApp from '../components/common/FloatingWhatsApp';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950 text-ivory-100 font-sans selection:bg-gold-500 selection:text-charcoal-950">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
