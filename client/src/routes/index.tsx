import { Route, Routes } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminRoute } from '../components/AdminRoute';

import { HomePage } from '../pages/customer/HomePage';
import { BooksPage } from '../pages/customer/BooksPage';
import { BookDetailsPage } from '../pages/customer/BookDetailsPage';
import { SearchPage } from '../pages/customer/SearchPage';
import { CartPage } from '../pages/customer/CartPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrderSuccessPage } from '../pages/customer/OrderSuccessPage';
import { MyOrdersPage } from '../pages/customer/MyOrdersPage';
import { OrderDetailsPage } from '../pages/customer/OrderDetailsPage';
import { WishlistPage } from '../pages/customer/WishlistPage';
import { MyReviewsPage } from '../pages/customer/MyReviewsPage';
import { ProfilePage } from '../pages/customer/ProfilePage';
import { LoginPage } from '../pages/customer/LoginPage';
import { RegisterPage } from '../pages/customer/RegisterPage';
import { NotFoundPage } from '../pages/customer/NotFoundPage';

import { DashboardPage } from '../pages/admin/DashboardPage';
import { AdminBooksPage } from '../pages/admin/AdminBooksPage';
import { AddBookPage } from '../pages/admin/AddBookPage';
import { EditBookPage } from '../pages/admin/EditBookPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { InventoryPage } from '../pages/admin/InventoryPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminReviewsPage } from '../pages/admin/AdminReviewsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="books" element={<BooksPage />} />
        <Route path="books/:id" element={<BookDetailsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-success/:id"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reviews"
          element={
            <ProtectedRoute>
              <MyReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route
        path="admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="books" element={<AdminBooksPage />} />
        <Route path="books/new" element={<AddBookPage />} />
        <Route path="books/:id" element={<EditBookPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}