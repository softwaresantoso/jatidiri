import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { archiveProduct, getMyProducts, submitProduct } from '@/services/products'
import type { Product, ProductStatus } from '@/types/product'
import { ROUTES } from '@/constants/routes'

const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: 'Draft',
  submitted: 'Menunggu review',
  approved: 'Aktif',
  rejected: 'Ditolak',
  archived: 'Diarsipkan',
}

export default function SellerProductsPage() {
  const { firebaseUser } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    if (!firebaseUser) return
    getMyProducts(firebaseUser.uid)
      .then(setProducts)
      .catch((err: unknown) => {
        console.error('Gagal memuat produk:', err)
        setError('Gagal memuat produk. Cek Console browser (F12).')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [firebaseUser])

  const handleSubmit = async (id: string) => {
    await submitProduct(id)
    load()
  }

  const handleArchive = async (id: string) => {
    if (!confirm('Arsipkan produk ini? Produk tidak akan tampil di marketplace lagi.')) return
    await archiveProduct(id)
    load()
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Kelola Produk</h1>
        <Link to={ROUTES.sellerProductNew} className="btn-primary w-auto px-4">
          + Tambah Produk
        </Link>
      </div>

      {loading && <p className="mt-6 text-sm text-ink/60">Memuat...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Belum ada produk. Klik "+ Tambah Produk".</p>
      )}

      <div className="mt-6 divide-y divide-black/10 rounded-md border border-black/10">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {p.images?.[0] && (
                <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded object-cover" />
              )}
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-ink/60">
                  Rp{p.price.toLocaleString('id-ID')} · Stok {p.stock}
                </p>
                {p.status === 'rejected' && p.rejectionReason && (
                  <p className="text-xs text-red-600">Alasan: {p.rejectionReason}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black/10 px-3 py-1 text-xs">
                {STATUS_LABELS[p.status]}
              </span>
              <Link to={ROUTES.sellerProductEdit(p.id)} className="text-sm text-brand underline">
                Edit
              </Link>
              {(p.status === 'draft' || p.status === 'rejected') && (
                <button
                  onClick={() => handleSubmit(p.id)}
                  className="text-sm text-brand underline"
                >
                  Ajukan
                </button>
              )}
              {p.status !== 'archived' && (
                <button
                  onClick={() => handleArchive(p.id)}
                  className="text-sm text-red-600 underline"
                >
                  Arsipkan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
