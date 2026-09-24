import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { removeCartItem, updateItemQuantity } from '@/services/carts'

export default function CartPage() {
  const { firebaseUser } = useAuth()
  const { cart, loading } = useCart()
  const [busyProductId, setBusyProductId] = useState<string | null>(null)

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (!firebaseUser) return
    setBusyProductId(productId)
    try {
      await updateItemQuantity(firebaseUser.uid, productId, quantity)
    } finally {
      setBusyProductId(null)
    }
  }

  const handleRemove = async (productId: string) => {
    if (!firebaseUser) return
    setBusyProductId(productId)
    try {
      await removeCartItem(firebaseUser.uid, productId)
    } finally {
      setBusyProductId(null)
    }
  }

  if (loading) return <p className="mx-auto max-w-2xl px-4 py-12 text-ink/60">Memuat...</p>

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Keranjang</h1>

      {cart.items.length === 0 ? (
        <p className="mt-6 text-sm text-ink/60">Keranjang Anda masih kosong.</p>
      ) : (
        <>
          <div className="mt-6 divide-y divide-black/10 rounded-md border border-black/10">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
                {item.image && (
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-ink/60">Rp{item.price.toLocaleString('id-ID')}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  disabled={busyProductId === item.productId}
                  onChange={(e) =>
                    handleQuantityChange(item.productId, Math.max(1, Number(e.target.value)))
                  }
                  className="input w-16"
                />
                <button
                  onClick={() => handleRemove(item.productId)}
                  disabled={busyProductId === item.productId}
                  className="text-sm text-red-600 underline"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="font-medium">Subtotal</span>
            <span className="text-lg font-semibold">Rp{subtotal.toLocaleString('id-ID')}</span>
          </div>

          <button disabled className="btn-primary mt-4 opacity-50">
            Checkout — segera hadir
          </button>
          <p className="mt-2 text-xs text-ink/50">
            Alur checkout & pembayaran manual transfer menyusul di Phase 11-12.
          </p>
        </>
      )}
    </section>
  )
}
