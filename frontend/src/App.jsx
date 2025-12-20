import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import useAuthStore from './store/useAuthStore';
import { useEffect } from 'react';
import useCartStore from './store/useCartStore';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AddEditProduct from './pages/admin/AddEditProduct';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import ActivityLogs from './pages/admin/ActivityLogs';

import PageTitleUpdater from './components/common/PageTitleUpdater';

function App() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  return (
    <Router>
      <PageTitleUpdater />
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            background: '#ffffff',
            color: '#333',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 99999, // Ensure it's above everything
          },
          success: {
            iconTheme: {
              primary: '#4f46e5', // Indigo-600
              secondary: '#eef2ff',
            },
            style: {
              border: '1px solid #e0e7ff',
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Red-500
              secondary: '#fef2f2',
            },
            style: {
              border: '1px solid #fee2e2',
            }
          },
        }}
      />
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Routes - Independent Layout */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AddEditProduct />} />
            <Route path="products/edit/:id" element={<AddEditProduct />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="activity" element={<ActivityLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Public Routes - MainLayout */}
        <Route path="*" element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
