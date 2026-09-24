import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { logOut } from '@/services/auth'
import type { UserRole } from '@/types'

function dashboardLinkFor(role: UserRole | undefined) {
  if (role === 'seller') return ROUTES.sellerDashboard
  if (role === 'admin') return ROUTES.adminDashboard
  return ROUTES.account
}

export default function MainLayout() {
  const { firebaseUser, appUser, loading } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logOut()
    navigate(ROUTES.home)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to={ROUTES.home} className="text-lg font-semibold tracking-tight">
            JATIDIRI
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to={ROUTES.explore}>Jelajahi</Link>

            {firebaseUser && (
              <Link to={ROUTES.cart}>
                Keranjang{itemCount > 0 ? ` (${itemCount})` : ''}
              </Link>
            )}

            {loading ? null : firebaseUser ? (
              <div className="flex items-center gap-3">
                <Link to={dashboardLinkFor(appUser?.role)}>
                  {appUser?.displayName ?? firebaseUser.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-black/20 px-3 py-1"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <>
                <Link to={ROUTES.login}>Masuk</Link>
                <Link
                  to={ROUTES.register}
                  className="rounded-md bg-brand px-3 py-1 text-brand-fg"
                >
                  Daftar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-black/10 py-6 text-center text-sm text-ink/60">
        JATIDIRI — Jatikuwung Digital Ragam Industri
      </footer>
    </div>
  )
}
