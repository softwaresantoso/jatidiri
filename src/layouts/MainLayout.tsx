import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to={ROUTES.home} className="text-lg font-semibold tracking-tight">
            JATIDIRI
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to={ROUTES.explore}>Jelajahi</Link>
            <Link to={ROUTES.login}>Masuk</Link>
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
