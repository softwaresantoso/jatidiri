import { Route, Routes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import ExplorePage from '@/pages/ExplorePage'
import CategoryPage from '@/pages/CategoryPage'
import StorefrontPage from '@/pages/StorefrontPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import SellerRegisterPage from '@/pages/SellerRegisterPage'
import AccountPage from '@/pages/AccountPage'
import SellerDashboardPage from '@/pages/SellerDashboardPage'
import SellerStoreProfilePage from '@/pages/SellerStoreProfilePage'
import SellerProductsPage from '@/pages/SellerProductsPage'
import SellerProductFormPage from '@/pages/SellerProductFormPage'
import SellerServicesPage from '@/pages/SellerServicesPage'
import SellerServiceFormPage from '@/pages/SellerServiceFormPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AdminApplicationsListPage from '@/pages/AdminApplicationsListPage'
import AdminApplicationDetailPage from '@/pages/AdminApplicationDetailPage'
import AdminProductsListPage from '@/pages/AdminProductsListPage'
import AdminServicesListPage from '@/pages/AdminServicesListPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { RequireRole } from '@/components/auth/RequireRole'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Publik */}
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/kategori/:slug" element={<CategoryPage />} />
        <Route path="/toko/:slug" element={<StorefrontPage />} />
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

        {/* Butuh role spesifik */}
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

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
