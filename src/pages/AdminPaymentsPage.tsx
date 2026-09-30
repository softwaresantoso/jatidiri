import { useEffect, useState } from 'react'
import { getOrdersForPaymentReview, rejectPayment, verifyPayment } from '@/services/orders'
import type { Order } from '@/types/order'

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const load = () => {
    getOrdersForPaymentReview()
      .then(setOrders)
      .catch((err: unknown) => {
        console.error('Gagal memuat pembayaran untuk review:', err)
        setError('Gagal memuat data. Cek Console browser (F12).')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleVerify = async (id: string) => {
    setProcessing(true)
    try {
      await verifyPayment(id)
      load()
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectingId || !reason.trim()) return
    setProcessing(true)
    try {
      await rejectPayment(rejectingId, reason.trim())
      setRejectingId(null)
      setReason('')
      load()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Verifikasi Pembayaran</h1>
      <p className="mt-1 text-sm text-ink/60">Menunggu verifikasi ({orders.length})</p>
      <p className="mt-2 rounded-md bg-black/5 p-3 text-xs text-ink/70">
        Sebelum approve: cocokkan nominal di bukti transfer dengan total pesanan, dan cek juga
        harga tiap item sesuai harga produk sebenarnya — harga di pesanan dikirim dari browser
        customer, belum divalidasi otomatis di server.
      </p>

      {loading && <p className="mt-6 text-sm text-ink/60">Memuat...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Tidak ada pembayaran yang menunggu verifikasi.</p>
      )}

      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-md border border-black/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm">{o.id}</p>
                <p className="text-sm text-ink/60">
                  {o.shipping.recipientName} · {o.shipping.phone}
                </p>
                <p className="mt-1 font-semibold">Rp{o.total.toLocaleString('id-ID')}</p>
                <ul className="mt-1 text-xs text-ink/60">
                  {o.items.map((item) => (
                    <li key={item.productId}>
                      {item.name} x{item.quantity} @ Rp{item.price.toLocaleString('id-ID')}
                    </li>
                  ))}
                </ul>
              </div>
              {o.paymentProofUrl && (
                <div className="text-right">
                  {/\.(jpg|jpeg|png|webp)/i.test(o.paymentProofUrl) && (
                    <img
                      src={o.paymentProofUrl}
                      alt="Bukti transfer"
                      className="mb-1 h-24 w-24 rounded object-cover"
                    />
                  )}
                  <a
                    href={o.paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-brand underline"
                  >
                    Buka bukti transfer
                  </a>
                </div>
              )}
            </div>

            {rejectingId === o.id ? (
              <div className="mt-3">
                <textarea
                  rows={2}
                  placeholder="Alasan penolakan (wajib) — akan ditampilkan ke customer"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setRejectingId(null)
                      setReason('')
                    }}
                    className="rounded-md border border-black/20 px-3 py-1 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!reason.trim() || processing}
                    className="rounded-md bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-60"
                  >
                    Konfirmasi Tolak
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setRejectingId(o.id)}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600"
                >
                  Tolak
                </button>
                <button
                  onClick={() => handleVerify(o.id)}
                  disabled={processing}
                  className="rounded-md bg-brand px-3 py-1 text-sm text-brand-fg disabled:opacity-60"
                >
                  Verifikasi
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
