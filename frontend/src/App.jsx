import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react'; // Import useEffect
import LoginPage from '@/pages/LoginPage';
import CashierPage from '@/pages/CashierPage';
import HistoryPage from '@/pages/HistoryPage';
import { ReceiptPage } from '@/pages/ReceiptPage';
import ProductManagementPage from '@/pages/ProductManagementPage';
import ReportsPage from '@/pages/ReportsPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher'; // Import switcher
import { cn } from '@/lib/utils';

function NavLink({ to, children }) {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} className={cn("px-3 py-2 rounded-md text-sm font-medium",isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-200 hover:text-gray-900")}>
            {children}
        </Link>
    );
}

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Use the hook

  // Handle RTL layout for Arabic
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); } catch (error) { console.error("Logout failed:", error); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {user && (
          <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                   <Link to="/" className="text-xl font-bold text-gray-800 me-6">CashierPro</Link>
                   <div className="flex items-baseline space-x-4">
                     <NavLink to="/">{t('cashier')}</NavLink>
                     <NavLink to="/history">{t('salesHistory')}</NavLink>
                     {user && user.role === 'admin' && ( <>
                        <NavLink to="/products">{t('productManagement')}</NavLink>
                        <NavLink to="/reports">{t('reports')}</NavLink>
                     </> )}
                   </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{t('welcomeUser', { username: user.username })} ({user.role})</span>
                  <LanguageSwitcher />
                  <Button variant="outline" size="sm" onClick={handleLogout}>{t('logout')}</Button>
                </div>
              </div>
            </nav>
          </header>
      )}

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><CashierPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/receipt/:saleId" element={<ProtectedRoute><ReceiptPage /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductManagementPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;