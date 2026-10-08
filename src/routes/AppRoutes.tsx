import { Route, Routes } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import MainLayout from '@/layouts/MainLayout'
import { RequireRole } from '@/components/auth/RequireRole'
import HomePage from '@/pages/HomePage'
import ExplorePage from '@/pages/ExplorePage'
import CategoryPage from '@/pages/CategoryPage'
import StorefrontPage from '@/pages/StorefrontPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import SellerRegisterPage from '@/pages/SellerRegisterPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import AccountPage from '@/pages/AccountPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import OrdersListPage from '@/pages/OrdersListPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import SellerDashboardPage from '@/pages/SellerDashboardPage'
import SellerStoreProfilePage from '@/pages/SellerStoreProfilePage'
import SellerProductsPage from '@/pages/SellerProductsPage'
import SellerProductFormPage from '@/pages/SellerProductFormPage'
import SellerServicesPage from '@/pages/SellerServicesPage'
import SellerServiceFormPage from '@/pages/SellerServiceFormPage'
import SellerOrdersListPage from '@/pages/SellerOrdersListPage'
import SellerOrderDetailPage from '@/pages/SellerOrderDetailPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AdminApplicationsListPage from '@/pages/AdminApplicationsListPage'
import AdminApplicationDetailPage from '@/pages/AdminApplicationDetailPage'
import AdminProductsListPage from '@/pages/AdminProductsListPage'
import AdminServicesListPage from '@/pages/AdminServicesListPage'
import AdminPaymentsPage from '@/pages/AdminPaymentsPage'
import AdminShippingPage from '@/pages/AdminShippingPage'
import AdminCommissionPage from '@/pages/AdminCommissionPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Publik */}
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/kategori/:slug" element={<CategoryPage />} />
        <Route path="/toko/:slug" element={<StorefrontPage />} />
        <Route path="/produk/:slug" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pelaku/daftar" element={<SellerRegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Butuh login, role apapun */}
        <Route
          path="/account"
          element={
            <RequireRole>
              <AccountPage />
            </RequireRole>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireRole>
              <CartPage />
            </RequireRole>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireRole>
              <CheckoutPage />
            </RequireRole>
          }
        />
        <Route
          path="/pesanan"
          element={
            <RequireRole>
              <OrdersListPage />
            </RequireRole>
          }
        />
        <Route
          path="/pesanan/:id"
          element={
            <RequireRole>
              <OrderDetailPage />
            </RequireRole>
          }
        />

        {/* Butuh role seller */}
        <Route
          path="/pelaku/dashboard"
          element={
            <RequireRole allowedRoles={['seller']}>
              <SellerDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="/pelaku/toko"
          element={
            <RequireRole allowedRoles={['seller']}>
              <SellerStoreProfilePage />
            </RequireRole>
          }
        />
        <Route
          path="/pelaku/produk"
          element={
            <RequireRole allowedRoles={['seller']}>
              <SellerProductsPage />
            </RequireRole>
          }
        />
        <Route
          path="/pelaku/produk/baru"
          element={
            <RequireRole allowedRoles={['seller']}>
              <SellerProductFormPage />
            </RequireRole>
          }
        />
        <Route
          path="/pelaku/produk/:id/edit"
          element={
            <RequireRole allowedRoles={['seller']}>
              <SellerProductFormPage />
            </RequireRole>
          }
        />
                <Route
          path={ROUTES.sellerOrders}
          element={
            <RequireRole allowedRoles={['seller']}>
              <SellerOrdersListPage />
            </RequireRole>
          }
        />
        <Route
          path="/jual/pesanan/:id"
          element={
            <RequireRole allowedRoles={['seller']}>
              <SellerOrderDetailPage />
            </RequireRole>
          }
        />
        <Route
          path="/pelaku/jasa"
          element={
            <RequireRole allowedRoles={['seller']}>
              <SellerServicesPage />
            </RequireRole>
          }
        />
        <Route
          path="/pelaku/jasa/baru"
          element={
            <RequireRole allowedRoles={['seller']}>
              <SellerServiceFormPage />
            </RequireRole>
          }
        />
        <Route
          path="/pelaku/jasa/:id/edit"
          element={
            <RequireRole allowedRoles={['seller']}>
              <SellerServiceFormPage />
            </RequireRole>
          }
        />

        {/* Butuh role admin */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireRole allowedRoles={['admin']}>
              <AdminDashboardPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/pelaku"
          element={
            <RequireRole allowedRoles={['admin']}>
              <AdminApplicationsListPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/pelaku/:id"
          element={
            <RequireRole allowedRoles={['admin']}>
              <AdminApplicationDetailPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/produk"
          element={
            <RequireRole allowedRoles={['admin']}>
              <AdminProductsListPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/jasa"
          element={
            <RequireRole allowedRoles={['admin']}>
              <AdminServicesListPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/pembayaran"
          element={
            <RequireRole allowedRoles={['admin']}>
              <AdminPaymentsPage />
            </RequireRole>
          }
        />
                <Route
          path="/admin/shipping"
          element={
            <RequireRole allowedRoles={['admin']}>
              <AdminShippingPage />
            </RequireRole>
          }
        />
        <Route
          path={ROUTES.adminCommission}
          element={
            <RequireRole allowedRoles={['admin']}>
              <AdminCommissionPage />
            </RequireRole>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
