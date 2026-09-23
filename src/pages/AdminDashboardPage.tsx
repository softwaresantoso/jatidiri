import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApplicationsForReview } from '@/services/businessApplications'
import { getProductsForReview } from '@/services/products'
import { ROUTES } from '@/constants/routes'

export default function AdminDashboardPage() {
  const [pendingApps, setPendingApps] = useState<number | null>(null)
  const [pendingProducts, setPendingProducts] = useState<number | null>(null)

  useEffect(() => {
    getApplicationsForReview()
      .then((apps) => setPendingApps(apps.length))
      .catch(() => setPendingApps(null))
    getProductsForReview()
      .then((products) => setPendingProducts(products.length))
      .catch(() => setPendingProducts(null))
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard Admin</h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          to={ROUTES.adminApplications}
          className="flex items-center justify-between rounded-md border border-black/10 p-4 hover:bg-black/5"
        >
          <div>
            <p className="font-medium">Pendaftaran Pelaku Industri</p>
            <p className="text-sm text-ink/60">Review, approve, atau tolak pendaftaran usaha baru</p>
          </div>
          {!!pendingApps && (
            <span className="rounded-full bg-brand px-3 py-1 text-sm text-brand-fg">
              {pendingApps} baru
            </span>
          )}
        </Link>

        <Link
          to={ROUTES.adminProducts}
          className="flex items-center justify-between rounded-md border border-black/10 p-4 hover:bg-black/5"
        >
          <div>
            <p className="font-medium">Moderasi Produk</p>
            <p className="text-sm text-ink/60">Review produk baru dari seller</p>
          </div>
          {!!pendingProducts && (
            <span className="rounded-full bg-brand px-3 py-1 text-sm text-brand-fg">
              {pendingProducts} baru
            </span>
          )}
        </Link>
      </div>

      <p className="mt-6 text-sm text-ink/60">
        Verifikasi pembayaran dan pengaturan lain menyusul di fase-fase berikutnya.
      </p>
    </section>
  )
}
