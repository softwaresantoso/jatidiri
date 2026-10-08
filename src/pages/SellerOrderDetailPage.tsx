import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderById, markOrderProcessing, markOrderShipped } from '@/services/orders'
import { ORDER_STATUS_LABELS } from '@/constants/orderStatus'
import OrderStatusTimeline from '@/components/orders/OrderStatusTimeline'
import type { Order } from '@/types/order'

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      if (!id) return
      try {
        const data = await getOrderById(id)
        if (isMounted) setOrder(data)
      } catch (err) {
        console.error(err)
        if (isMounted) setError('Gagal memuat detail pesanan.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [id])

  async function handleProcess() {
    if (!order) return
    setActionLoading(true)
    setError(null)
    try {
      await markOrderProcessing(order.id)
      setOrder({ ...order, status: 'processing' })
    } catch (err) {
      console.error(err)
      setError('Gagal memperbarui status pesanan.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleShip() {
    if (!order) return
    setActionLoading(true)
    setError(null)
    try {
      await markOrderShipped(order.id)
      setOrder({ ...order, status: 'shipped' })
    } catch (err) {
      console.error(err)
      setError('Gagal memperbarui status pesanan.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-gray-500">Memuat pesanan...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-red-600">Pesanan tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Pesanan #{order.id.slice(0, 8)}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Status saat ini:{' '}
        <span className="font-medium text-gray-700">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </p>

      <OrderStatusTimeline status={order.status} />

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-gray-900">Penerima</h2>
        <p className="text-sm text-gray-700">{order.shipping.recipientName}</p>
        <p className="text-sm text-gray-700">{order.shipping.phone}</p>
        <p className="text-sm text-gray-700">{order.shipping.address}</p>
        <p className="mt-1 text-sm text-gray-500">
          Pengiriman: {order.shipping.method} · Rp
          {order.shipping.cost.toLocaleString('id-ID')}
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-gray-900">Item</h2>
        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between py-2 text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 text-sm font-semibold">
          <span>Total</span>
          <span>Rp{order.total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {order.status === 'payment_verified' && (
        <button
          onClick={handleProcess}
          disabled={actionLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {actionLoading ? 'Memproses...' : 'Proses Pesanan'}
        </button>
      )}

      {order.status === 'processing' && (
        <button
          onClick={handleShip}
          disabled={actionLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {actionLoading ? 'Memperbarui...' : 'Tandai Dikirim'}
        </button>
      )}

      {order.status === 'shipped' && (
        <p className="text-sm text-gray-500">
          Menunggu customer mengkonfirmasi penerimaan pesanan.
        </p>
      )}

      {order.status === 'completed' && (
        <p className="text-sm text-green-600">Pesanan selesai.</p>
      )}
    </div>
  )
}
