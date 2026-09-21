import { Route, Routes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import HomePage from '@/pages/HomePage'
import ExplorePage from '@/pages/ExplorePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import SellerRegisterPage from '@/pages/SellerRegisterPage'
import AccountPage from '@/pages/AccountPage'
import SellerDashboardPage from '@/pages/SellerDashboardPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AdminApplicationsListPage from '@/pages/AdminApplicationsListPage'
import AdminApplicationDetailPage from '@/pages/AdminApplicationDetailPage'
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

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
