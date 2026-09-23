import { useEffect, useState } from 'react'
import { approveProduct, getProductsForReview, rejectProduct } from '@/services/products'
import type { Product } from '@/types/product'

export default function AdminProductsListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const load = () => {
    getProductsForReview()
      .then(setProducts)
      .catch((err: unknown) => {
        console.error('Gagal memuat produk untuk review:', err)
        setError('Gagal memuat data. Cek Console browser (F12).')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleApprove = async (id: string) => {
    setProcessing(true)
    try {
      await approveProduct(id)
      load()
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectingId || !reason.trim()) return
    setProcessing(true)
    try {
      await rejectProduct(rejectingId, reason.trim())
      setRejectingId(null)
      setReason('')
      load()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Moderasi Produk</h1>
      <p className="mt-1 text-sm text-ink/60">Menunggu review ({products.length})</p>

      {loading && <p className="mt-6 text-sm text-ink/60">Memuat...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Tidak ada produk yang menunggu review.</p>
      )}

      <div className="mt-6 space-y-3">
        {products.map((p) => (
          <div key={p.id} className="rounded-md border border-black/10 p-4">
            <div className="flex items-center gap-3">
              {p.images?.[0] && (
                <img src={p.images[0]} alt={p.name} className="h-16 w-16 rounded object-cover" />
              )}
              <div className="flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-ink/60">
                  Rp{p.price.toLocaleString('id-ID')} · Stok {p.stock} · {p.unit}
                </p>
                <p className="mt-1 text-sm text-ink/70">{p.description}</p>
              </div>
            </div>

            {rejectingId === p.id ? (
              <div className="mt-3">
                <textarea
                  rows={2}
                  placeholder="Alasan penolakan (wajib)"
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
                  onClick={() => setRejectingId(p.id)}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600"
                >
                  Tolak
                </button>
                <button
                  onClick={() => handleApprove(p.id)}
                  disabled={processing}
                  className="rounded-md bg-brand px-3 py-1 text-sm text-brand-fg disabled:opacity-60"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
