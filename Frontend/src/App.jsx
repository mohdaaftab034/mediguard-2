import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Pages
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Alerts from './pages/Alerts.jsx';
import BatchVerify from './pages/BatchVerify.jsx';
import NearbyChemist from './pages/NearbyChemist.jsx';
import MedicineInfo from './pages/MedicineInfo.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import MedicalBackground from './components/common/MedicalBackground.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import UserDashboard from './pages/dashboard/UserDashboard.jsx';
import ChemistDashboard from './pages/dashboard/ChemistDashboard.jsx';
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';
import AccessDenied from './pages/AccessDenied.jsx';
import Scanner from './pages/Scanner.jsx';
import ScanHistory from './pages/dashboard/ScanHistory.jsx';

// Routes
import { ROUTES } from './utils/constants.js';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = '';
      }, 10);
    }
  }, [pathname, hash]);

  return null;
};

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === ROUTES.HOME;

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <div className="flex flex-col min-h-screen bg-bg-primary relative">
            <MedicalBackground />
            {!isHomePage && <Navbar />}
            <ScrollToTop />
            
              <div className="flex flex-1">
                {!isHomePage && <Sidebar />}
                <main className="flex-1 overflow-x-hidden">
                  <Routes>
                    {/* Public Routes */}
                    <Route path={ROUTES.HOME} element={<Home />} />
                    <Route path={ROUTES.SCANNER} element={<Scanner />} />
                    <Route path={ROUTES.ALERTS} element={<Alerts />} />
                    <Route path={ROUTES.BATCH_VERIFY} element={<BatchVerify />} />
                    <Route path={ROUTES.NEARBY_CHEMIST} element={<NearbyChemist />} />
                    <Route path={ROUTES.MEDICINE_INFO} element={<MedicineInfo />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Role-Based Protected Routes */}
                <Route
                  path="/dashboard/user"
                  element={
                    <ProtectedRoute requiredRole="public">
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/chemist"
                  element={
                    <ProtectedRoute requiredRole="chemist">
                      <ChemistDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Route */}
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.SCAN_HISTORY} element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>

            {!isHomePage && <Footer />}

            {/* Toast Notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--success)',
                    secondary: 'var(--bg-secondary)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--danger)',
                    secondary: 'var(--bg-secondary)',
                  },
                },
              }}
            />
          </div>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
