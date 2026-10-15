import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { ToastProvider } from './components/Toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CompareBar from './components/CompareBar';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Search from './pages/Search';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Compare from './pages/Compare';
import Deals from './pages/Deals';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Protected User Pages
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Admin Protected Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminPrices from './pages/AdminPrices';
import AdminCoupons from './pages/AdminCoupons';
import AdminUsers from './pages/AdminUsers';
import AdminSources from './pages/AdminSources';
import AdminReviewAnalyses from './pages/AdminReviewAnalyses';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <CompareProvider>
            <ToastProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/deals" element={<Deals />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* User Protected Routes */}
                    <Route
                      path="/wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Protected Routes */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/products"
                      element={
                        <AdminRoute>
                          <AdminProducts />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/prices"
                      element={
                        <AdminRoute>
                          <AdminPrices />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/coupons"
                      element={
                        <AdminRoute>
                          <AdminCoupons />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <AdminRoute>
                          <AdminUsers />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/sources"
                      element={
                        <AdminRoute>
                          <AdminSources />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/review-analyses"
                      element={
                        <AdminRoute>
                          <AdminReviewAnalyses />
                        </AdminRoute>
                      }
                    />

                    {/* 404 Catch-All */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <CompareBar />
                <Footer />
              </div>
            </ToastProvider>
          </CompareProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
