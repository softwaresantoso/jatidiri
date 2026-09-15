import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'
import { ROUTES } from '@/constants/routes'

interface RequireRoleProps {
  // Kosongkan allowedRoles kalau cuma butuh "harus login", role apapun boleh.
  allowedRoles?: UserRole[]
  children: ReactNode
}

// Ini proteksi SISI KLIEN (UX: redirect, sembunyikan tombol, dst).
// Proteksi SUNGGUHAN tetap di firestore.rules — jangan pernah anggap
// component ini cukup untuk keamanan data.
export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { firebaseUser, appUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-ink/60">
        Memuat...
      </div>
    )
  }

  if (!firebaseUser) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />
  }

  if (allowedRoles && (!appUser || !allowedRoles.includes(appUser.role))) {
    return <Navigate to={ROUTES.unauthorized} replace />
  }

  return <>{children}</>
}
