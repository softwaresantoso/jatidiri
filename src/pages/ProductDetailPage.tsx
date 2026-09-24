import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { getProductBySlug } from '@/services/products'
import { getBusinessById } from '@/services/businesses'
import { addItemToCart, replaceCartWithItem } from '@/services/carts'
import type { Product } from '@/types/product'
import type { Business } from '@/types/business'
import { ROUTES } from '@/constants/routes'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { firebaseUser } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const [business, setBusiness] = useState<Business | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addedMessage, setAddedMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    getProductBySlug(slug)
      .then(async (p) => {
        setProduct(p)
        if (p) {
          document.title = `${p.name} — JATIDIRI`
          setBusiness(await getBusinessById(p.businessId))
        }
      })
      .catch((err: unknown) => {
        console.error('Gagal memuat produk:', err)
        setError('Gagal memuat data. Cek Console browser (F12) untuk detail.')
      })
  }, [slug])

  const doAdd = async (replace: boolean) => {
    if (!product || !firebaseUser) return
    setAdding(true)
    setAddedMessage(null)
    try {
      const item = {
        productId: product.id,
        businessId: product.businessId,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        quantity,
      }
      if (replace) {
        await replaceCartWithItem(firebaseUser.uid, product.businessId, item)
      } else {
        await addItemToCart(firebaseUser.uid, product.businessId, item)
      }
      setAddedMessage('Ditambahkan ke keranjang.')
      setShowConflictDialog(false)
    } catch (err) {
      console.error('Gagal menambah ke keranjang:', err)
      setError('Gagal menambah ke keranjang. Cek Console browser (F12).')
    } finally {
      setAdding(false)
    }
  }

  const handleAddToCart = () => {
    if (!firebaseUser) {
      navigate(ROUTES.login, { state: { from: location } })
      return
    }
    if (!product) return
    const hasConflict =
      cart.items.length > 0 && cart.businessId !== null && cart.businessId !== product.businessId
    if (hasConflict) {
      setShowConflictDialog(true)
      return
    }
    doAdd(false)
  }

  if (error) return <p className="mx-auto max-w-3xl px-4 py-12 text-red-600">{error}</p>
  if (product === undefined) {
    return <p className="mx-auto max-w-3xl px-4 py-12 text-ink/60">Memuat...</p>
  }
  if (product === null) {
    return <p className="mx-auto max-w-3xl px-4 py-12 text-ink/60">Produk tidak ditemukan.</p>
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="aspect-square w-full rounded-md object-cover"
            />
          ) : (
            <div className="aspect-square w-full rounded-md bg-black/10" />
          )}
          {product.images && product.images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {product.images.slice(1).map((url) => (
                <img key={url} src={url} alt="" className="h-16 w-16 rounded object-cover" />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          {business && (
            <Link to={ROUTES.store(business.slug)} className="text-sm text-brand underline">
              {business.businessName}
            </Link>
          )}
          <p className="mt-2 text-xl font-semibold">
            Rp{product.price.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-ink/60">Stok: {product.stock} {product.unit}</p>
          <p className="mt-4 text-ink/80">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="input w-20"
            />
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="btn-primary w-auto flex-1 px-6"
            >
              {product.stock === 0
                ? 'Stok habis'
                : adding
                  ? 'Menambahkan...'
                  : 'Tambah ke Keranjang'}
            </button>
          </div>
          {addedMessage && <p className="mt-2 text-sm text-green-700">{addedMessage}</p>}
        </div>
      </div>

      {showConflictDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-md bg-white p-6">
            <p className="font-medium">Keranjang Anda berisi produk dari Pelaku Industri lain.</p>
            <p className="mt-2 text-sm text-ink/70">
              JATIDIRI belum mendukung checkout gabungan dari beberapa toko sekaligus. Kosongkan
              keranjang untuk lanjut menambah produk ini?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowConflictDialog(false)}
                className="flex-1 rounded-md border border-black/20 px-4 py-2"
              >
                Batal
              </button>
              <button
                onClick={() => doAdd(true)}
                disabled={adding}
                className="btn-primary flex-1"
              >
                Kosongkan &amp; Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
