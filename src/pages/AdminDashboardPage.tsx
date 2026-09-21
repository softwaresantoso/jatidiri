import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApplicationsForReview } from '@/services/businessApplications'
import { ROUTES } from '@/constants/routes'

export default function AdminDashboardPage() {
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  useEffect(() => {
    getApplicationsForReview()
      .then((apps) => setPendingCount(apps.length))
      .catch(() => setPendingCount(null))
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard Admin</h1>

      <Link
        to={ROUTES.adminApplications}
        className="mt-6 flex items-center justify-between rounded-md border border-black/10 p-4 hover:bg-black/5"
      >
        <div>
          <p className="font-medium">Pendaftaran Pelaku Industri</p>
          <p className="text-sm text-ink/60">Review, approve, atau tolak pendaftaran usaha baru</p>
        </div>
        {pendingCount !== null && pendingCount > 0 && (
          <span className="rounded-full bg-brand px-3 py-1 text-sm text-brand-fg">
            {pendingCount} baru
          </span>
        )}
      </Link>

      <p className="mt-6 text-sm text-ink/60">
        Moderasi produk, verifikasi pembayaran, dan pengaturan lain menyusul
        di fase-fase berikutnya.
      </p>
    </section>
  )
}
