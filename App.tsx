import React, { useState } from 'react';
import { HashRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import TableMapView from './pages/TableMapView';
import KitchenView from './pages/KitchenView';
import DashboardView from './pages/DashboardView';
import FeedbackView from './pages/FeedbackView';
import HomeCommandCenter from './pages/HomeCommandCenter';
import CustomerTablePortal from './pages/CustomerTablePortal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { MenuManagerModal } from './components/MenuManagerModal';
import { DashboardConfigModal } from './components/DashboardConfigModal';

import CustomerExperienceHub from './components/customer/CustomerExperienceHub';
import Restaurant3DLanding from './pages/Restaurant3DLanding';
import CoffeeCultureLanding from './pages/CoffeeCultureLanding';
import PetpoojaLanding from './pages/PetpoojaLanding';
import RestroLandingPage from './pages/RestroLandingPage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isCustomerPortal =
    location.pathname === '/' ||
    location.pathname === '/petpooja' ||
    location.pathname === '/restro' ||
    location.pathname === '/coffee' ||
    location.pathname === '/restaurant' ||
    location.pathname.startsWith('/menu/') ||
    location.pathname === '/experience' ||
    location.pathname === '/showcase' ||
    location.pathname === '/3d';

  const { isAdminAuthenticated } = useAppContext();
  const [isMenuManagerOpen, setIsMenuManagerOpen] = useState(false);
  const [isDashboardConfigOpen, setIsDashboardConfigOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#C82032] selection:text-white font-sans relative overflow-x-clip">
      {/* 1. Only enforce Admin Auth Modal when on staff management views and not authenticated */}
      {!isCustomerPortal && !isAdminAuthenticated && <AdminAuthModal />}

      {/* 2. Top Header for Staff/Admin Management (Staff Only) */}
      {!isCustomerPortal && isAdminAuthenticated && (
        <Header
          onOpenMenuManager={() => setIsMenuManagerOpen(true)}
          onOpenDashboardConfig={() => setIsDashboardConfigOpen(true)}
        />
      )}

      {/* 3. Main Route Navigation Hub */}
      <main
        className={
          isCustomerPortal
            ? 'w-full'
            : location.pathname === '/tables'
              ? 'w-full px-2 sm:px-3 pt-2 pb-0 relative z-10'
              : 'max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10'
        }
      >
        <Routes>
          {/* Default Primary Landing Page: Exact Petpooja Restaurant POS Platform */}
          <Route path="/" element={<PetpoojaLanding />} />
          <Route path="/petpooja" element={<PetpoojaLanding />} />
          <Route path="/restro" element={<RestroLandingPage />} />

          {/* 3D Coffee Brand Showcase */}
          <Route path="/coffee" element={<CoffeeCultureLanding />} />

          {/* Full Live Restaurant & Ordering System (Accessible After Demo Approval) */}
          <Route path="/restaurant" element={<Restaurant3DLanding />} />
          <Route path="/showcase" element={<Restaurant3DLanding />} />
          <Route path="/3d" element={<Restaurant3DLanding />} />
          <Route path="/menu/:tableId" element={<CustomerExperienceHub />} />
          <Route path="/experience" element={<CustomerExperienceHub />} />

          {/* Protected Staff & Servant Portal Routes (Hidden from Customers) */}
          <Route
            path="/tables"
            element={isAdminAuthenticated ? <TableMapView /> : <AdminAuthModal />}
          />
          <Route
            path="/kitchen"
            element={isAdminAuthenticated ? <KitchenView /> : <AdminAuthModal />}
          />
          <Route
            path="/admin"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={isAdminAuthenticated ? <DashboardView /> : <AdminAuthModal />}
          />
          <Route
            path="/feedback/:tableId"
            element={isAdminAuthenticated ? <FeedbackView /> : <AdminAuthModal />}
          />
        </Routes>
      </main>

      {/* 4. Global Management Modals */}
      <MenuManagerModal
        isOpen={isMenuManagerOpen}
        onClose={() => setIsMenuManagerOpen(false)}
      />
      <DashboardConfigModal
        isOpen={isDashboardConfigOpen}
        onClose={() => setIsDashboardConfigOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
}

export default App;
