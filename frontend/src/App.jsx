import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import StarryBackground from './components/layout/StarryBackground';
import HomePage from './pages/HomePage';
import MoonExplorerPage from './pages/MoonExplorerPage';
import MarsExplorerPage from './pages/MarsExplorerPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';

export default function App() {
  return (
    <div className="relative flex flex-col min-h-screen selection:bg-cyan-500 selection:text-black">
      {/* Animated Twinkling Canvas Background with Meteors */}
      <StarryBackground />

      {/* Main App Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/moon" element={<MoonExplorerPage />} />
            <Route path="/mars" element={<MarsExplorerPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}
