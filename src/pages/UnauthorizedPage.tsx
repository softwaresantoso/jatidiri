import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function UnauthorizedPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Anda tidak memiliki akses ke halaman ini
      </h1>
      <p className="mt-2 text-ink/70">
        Halaman ini terbatas untuk peran tertentu (Pelaku Industri atau
        Admin).
      </p>
      <Link to={ROUTES.home} className="mt-4 inline-block text-brand underline">
        Kembali ke Beranda
      </Link>
    </section>
  )
}
