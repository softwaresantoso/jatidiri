import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getMyBusiness } from '@/services/businesses'
import { getOrdersForSeller } from '@/services/orders'
import { ORDER_STATUS_LABELS } from '@/constants/orderStatus'
import { ROUTES } from '@/constants/routes'
import type { Order } from '@/types/order'

export default function SellerOrdersListPage() {
  const { firebaseUser } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      if (!firebaseUser) return
      try {
        const business = await getMyBusiness(firebaseUser.uid)
        if (!business) {
          if (isMounted) {
            setError('Toko kamu belum ditemukan. Pastikan pendaftaran sudah disetujui admin.')
            setLoading(false)
          }
          return
        }
        const data = await getOrdersForSeller(firebaseUser.uid)
        if (isMounted) setOrders(data)
      } catch (err) {
        console.error(err)
        if (isMounted) setError('Gagal memuat daftar pesanan.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [firebaseUser])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-gray-500">Memuat pesanan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  // Order yang masih butuh perhatian seller (sudah lewat verifikasi
  // pembayaran) ditaruh di atas; yang masih menunggu pembayaran customer
  // ditaruh di bawah karena belum ada yang bisa seller lakukan.
  const actionable = orders.filter((o) =>
    ['payment_verified', 'processing', 'shipped'].includes(o.status),
  )
  const others = orders.filter(
    (o) => !['payment_verified', 'processing', 'shipped'].includes(o.status),
  )
  const sortedOrders = [...actionable, ...others]

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Pesanan Masuk</h1>

      {sortedOrders.length === 0 ? (
        <p className="text-gray-500">Belum ada pesanan.</p>
      ) : (
        <div className="space-y-3">
          {sortedOrders.map((order) => (
            <Link
              key={order.id}
              to={ROUTES.sellerOrderDetail(order.id)}
              className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    #{order.id.slice(0, 8)} · {order.shipping.recipientName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} item · Rp{order.total.toLocaleString('id-ID')}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
