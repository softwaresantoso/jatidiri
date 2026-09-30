import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getMyOrders } from '@/services/orders'
import { ORDER_STATUS_LABELS } from '@/constants/orderStatus'
import { ROUTES } from '@/constants/routes'
import type { Order } from '@/types/order'

export default function OrdersListPage() {
  const { firebaseUser } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firebaseUser) return
    getMyOrders(firebaseUser.uid)
      .then(setOrders)
      .catch((err: unknown) => {
        console.error('Gagal memuat pesanan:', err)
        setError('Gagal memuat pesanan. Cek Console browser (F12).')
      })
      .finally(() => setLoading(false))
  }, [firebaseUser])

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Pesanan Saya</h1>

      {loading && <p className="mt-6 text-sm text-ink/60">Memuat...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Belum ada pesanan.</p>
      )}

      <div className="mt-6 divide-y divide-black/10 rounded-md border border-black/10">
        {orders.map((o) => (
          <Link
            key={o.id}
            to={ROUTES.order(o.id)}
            className="flex items-center justify-between px-4 py-3 hover:bg-black/5"
          >
            <div>
              <p className="font-mono text-sm">{o.id.slice(0, 8)}</p>
              <p className="text-sm text-ink/60">
                {o.createdAt?.toDate().toLocaleDateString('id-ID')} · Rp
                {o.total.toLocaleString('id-ID')}
              </p>
            </div>
            <span className="rounded-full bg-black/10 px-3 py-1 text-xs">
              {ORDER_STATUS_LABELS[o.status]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
