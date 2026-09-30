import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { createOrder } from '@/services/orders'
import { clearCart } from '@/services/carts'
import { getActiveShippingMethods } from '@/services/shippingMethods'
import { ROUTES } from '@/constants/routes'
import type { ShippingMethod } from '@/types/shipping'

type Step = 1 | 2 | 3 | 'success'

export default function CheckoutPage() {
  const { firebaseUser, appUser } = useAuth()
  const { cart, loading: cartLoading } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [recipientName, setRecipientName] = useState(appUser?.displayName ?? '')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [methodsLoading, setMethodsLoading] = useState(true)
  const [methodId, setMethodId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    getActiveShippingMethods()
      .then((list) => {
        setMethods(list)
        if (list.length > 0) setMethodId(list[0].id)
      })
      .catch((err: unknown) => {
        console.error('Gagal memuat metode pengiriman:', err)
      })
      .finally(() => setMethodsLoading(false))
  }, [])

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const method = methods.find((m) => m.id === methodId) ?? null
  const total = subtotal + (method?.cost ?? 0)

  if (cartLoading) return <p className="mx-auto max-w-md px-4 py-16 text-ink/60">Memuat...</p>

  if (step !== 'success' && cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-ink/60">Keranjang Anda kosong.</p>
        <button onClick={() => navigate(ROUTES.explore)} className="btn-primary mt-4 w-auto px-6">
          Jelajahi Marketplace
        </button>
      </div>
    )
  }

  const handleConfirm = async () => {
    if (!firebaseUser || !cart.businessId || !method) return
    setSubmitting(true)
    setError(null)
    try {
      const id = await createOrder(firebaseUser.uid, cart.businessId, cart.items, {
        recipientName,
        phone,
        address,
        method: method.name,
        cost: method.cost,
      })
      await clearCart(firebaseUser.uid)
      setOrderId(id)
      setStep('success')
    } catch (err) {
      console.error('Gagal membuat order:', err)
      setError('Gagal membuat pesanan. Cek Console browser (F12) untuk detail.')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Pesanan Dibuat</h1>
        <p className="mt-2 text-ink/70">Pesanan Anda berhasil dibuat dan menunggu pembayaran.</p>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/60">ID Pesanan</dt>
            <dd className="font-mono">{orderId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Total</dt>
            <dd>Rp{total.toLocaleString('id-ID')}</dd>
          </div>
        </dl>
        <button
          onClick={() => orderId && navigate(ROUTES.order(orderId))}
          className="btn-primary mt-6"
        >
          Lanjut ke Pembayaran
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
      <p className="mt-1 text-sm text-ink/60">Langkah {step} dari 3</p>

      {step === 1 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-medium">Informasi Penerima</h2>
          <div>
            <label className="text-sm font-medium">Nama Penerima</label>
            <input
              type="text"
              className="input mt-1"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nomor WhatsApp</label>
            <input
              type="tel"
              className="input mt-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Alamat Lengkap</label>
            <textarea
              rows={3}
              className="input mt-1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!recipientName.trim() || !phone.trim() || !address.trim()}
            className="btn-primary"
          >
            Lanjut
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-medium">Pilih Pengiriman</h2>

          {methodsLoading && <p className="text-sm text-ink/60">Memuat metode pengiriman...</p>}
          {!methodsLoading && methods.length === 0 && (
            <p className="text-sm text-red-600">
              Belum ada metode pengiriman aktif. Hubungi admin JATIDIRI.
            </p>
          )}

          {methods.map((m) => (
            <label
              key={m.id}
              className="flex items-center justify-between rounded-md border border-black/10 p-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="shipping"
                  checked={methodId === m.id}
                  onChange={() => setMethodId(m.id)}
                />
                {m.name}
              </span>
              <span>{m.cost === 0 ? 'Gratis' : `Rp${m.cost.toLocaleString('id-ID')}`}</span>
            </label>
          ))}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 rounded-md border border-black/20 px-4 py-2">
              Kembali
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!method}
              className="btn-primary flex-1"
            >
              Lanjut
            </button>
          </div>
        </div>
      )}

      {step === 3 && method && (
        <div className="mt-6 space-y-4">
          <h2 className="font-medium">Ringkasan Pesanan</h2>
          <div className="rounded-md border border-black/10 p-4 text-sm">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex justify-between py-1">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-black/10 pt-2">
              <span>Subtotal</span>
              <span>Rp{subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir ({method.name})</span>
              <span>Rp{method.cost.toLocaleString('id-ID')}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-black/10 pt-2 font-semibold">
              <span>Total</span>
              <span>Rp{total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="rounded-md bg-black/5 p-3 text-sm">
            <p className="font-medium">Pembayaran</p>
            <p className="text-ink/70">
              Transfer bank manual — instruksi rekening &amp; upload bukti pembayaran ditampilkan
              di halaman pesanan setelah pesanan dibuat.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 rounded-md border border-black/20 px-4 py-2">
              Kembali
            </button>
            <button onClick={handleConfirm} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
