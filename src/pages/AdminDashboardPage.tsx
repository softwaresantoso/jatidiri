import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApplicationsForReview } from '@/services/businessApplications'
import { getProductsForReview } from '@/services/products'
import { getServicesForReview } from '@/services/services'
import { getOrdersForPaymentReview } from '@/services/orders'
import { ROUTES } from '@/constants/routes'

interface QueueCardProps {
  to: string
  title: string
  description: string
  count: number | null
}

function QueueCard({ to, title, description, count }: QueueCardProps) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-md border border-black/10 p-4 hover:bg-black/5"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-ink/60">{description}</p>
      </div>
      {!!count && (
        <span className="rounded-full bg-brand px-3 py-1 text-sm text-brand-fg">
          {count} baru
        </span>
      )}
    </Link>
  )
}

export default function AdminDashboardPage() {
  const [pendingApps, setPendingApps] = useState<number | null>(null)
  const [pendingProducts, setPendingProducts] = useState<number | null>(null)
  const [pendingServices, setPendingServices] = useState<number | null>(null)
  const [pendingPayments, setPendingPayments] = useState<number | null>(null)

  useEffect(() => {
    getApplicationsForReview()
      .then((list) => setPendingApps(list.length))
      .catch(() => setPendingApps(null))
    getProductsForReview()
      .then((list) => setPendingProducts(list.length))
      .catch(() => setPendingProducts(null))
    getServicesForReview()
      .then((list) => setPendingServices(list.length))
      .catch(() => setPendingServices(null))
    getOrdersForPaymentReview()
      .then((list) => setPendingPayments(list.length))
      .catch(() => setPendingPayments(null))
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard Admin</h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <QueueCard
          to={ROUTES.adminApplications}
          title="Pendaftaran Pelaku Industri"
          description="Review, approve, atau tolak pendaftaran usaha baru"
          count={pendingApps}
        />
        <QueueCard
          to={ROUTES.adminProducts}
          title="Moderasi Produk"
          description="Review produk baru dari seller"
          count={pendingProducts}
        />
        <QueueCard
          to={ROUTES.adminServices}
          title="Moderasi Jasa"
          description="Review jasa baru dari seller"
          count={pendingServices}
        />
        <QueueCard
          to={ROUTES.adminPayments}
          title="Verifikasi Pembayaran"
          description="Cek bukti transfer dari customer"
          count={pendingPayments}
        />
        <QueueCard
          to={ROUTES.adminShipping}
          title="Metode Pengiriman"
          description="Kelola opsi & biaya pengiriman untuk checkout"
          count={null}
        />
      </div>

      <p className="mt-6 text-sm text-ink/60">
        Pengaturan komisi menyusul di fase berikutnya.
      </p>
    </section>
  )
}
