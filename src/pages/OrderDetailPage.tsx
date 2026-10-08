import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getOrderById, submitPaymentProof, confirmOrderReceived } from '@/services/orders'
import { FileUploader } from '@/components/ui/FileUploader'
import { uploadDocument } from '@/lib/cloudinary'
import { ORDER_STATUS_LABELS } from '@/constants/orderStatus'
import { PLATFORM_BANK_ACCOUNT } from '@/constants/payment'
import type { Order } from '@/types/order'
import { getReviewByOrderId } from '@/services/reviews'
import ReviewForm from '@/components/reviews/ReviewForm'
import type { Review } from '@/types/review'
import OrderStatusTimeline from '@/components/orders/OrderStatusTimeline'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { firebaseUser } = useAuth()

  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [proofUrl, setProofUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [review, setReview] = useState<Review | null>(null)
  const [confirming, setConfirming] = useState(false)

  const load = () => {
    if (!id) return
    getOrderById(id)
      .then((data) => {
        setOrder(data)
        if (data?.status === 'completed') {
          getReviewByOrderId(id).then(setReview).catch(console.error)
        }
      })
      .catch((err: unknown) => {
        console.error('Gagal memuat pesanan:', err)
        setError('Pesanan tidak ditemukan, atau Anda tidak punya akses ke pesanan ini.')
      })
  }

  useEffect(load, [id])

  const handleSubmitProof = async () => {
    if (!id || !proofUrl) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitPaymentProof(id, proofUrl)
      setProofUrl('')
      load()
    } catch (err) {
      console.error('Gagal kirim bukti pembayaran:', err)
      setSubmitError('Gagal mengirim bukti pembayaran. Cek Console browser (F12).')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmReceived = async () => {
    if (!id) return
    setConfirming(true)
    try {
      await confirmOrderReceived(id)
      load()
    } catch (err) {
      console.error('Gagal konfirmasi pesanan diterima:', err)
    } finally {
      setConfirming(false)
    }
  }

  if (error) return <p className="mx-auto max-w-2xl px-4 py-12 text-red-600">{error}</p>
  if (order === undefined) return <p className="mx-auto max-w-2xl px-4 py-12 text-ink/60">Memuat...</p>
  if (order === null) return <p className="mx-auto max-w-2xl px-4 py-12 text-ink/60">Pesanan tidak ditemukan.</p>

  const isCustomer = firebaseUser?.uid === order.customerId
  const bankNotConfigured = PLATFORM_BANK_ACCOUNT.bankName.startsWith('GANTI')

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Detail Pesanan</h1>
      <p className="mt-1 font-mono text-sm text-ink/60">{order.id}</p>
      <p className="mt-2">
        <span className="rounded-full bg-black/10 px-3 py-1 text-xs">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </p>

      <OrderStatusTimeline status={order.status} />

      <div className="mt-6 rounded-md border border-black/10 p-4 text-sm">
        {order.items.map((item) => (
          <div key={item.productId} className="flex justify-between py-1">
            <span>
              {item.name} x{item.quantity}
            </span>
            <span>Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-black/10 pt-2">
          <span>Subtotal</span>
          <span>Rp{order.subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>Ongkir ({order.shipping.method})</span>
          <span>Rp{order.shippingCost.toLocaleString('id-ID')}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-black/10 pt-2 font-semibold">
          <span>Total</span>
          <span>Rp{order.total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-black/10 p-4 text-sm">
        <p className="font-medium">Dikirim ke</p>
        <p>{order.shipping.recipientName}</p>
        <p className="text-ink/60">{order.shipping.phone}</p>
        <p className="text-ink/60">{order.shipping.address}</p>
      </div>

      {order.status === 'pending_payment' && isCustomer && (
        <div className="mt-6 rounded-md border border-black/10 p-4">
          <h2 className="font-medium">Pembayaran — Transfer Bank</h2>

          {order.paymentRejectionReason && (
            <p className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              Bukti pembayaran sebelumnya ditolak: {order.paymentRejectionReason}. Silakan upload
              ulang.
            </p>
          )}

          {bankNotConfigured && (
            <p className="mt-2 text-xs text-red-600">
              Rekening JATIDIRI belum diisi — edit src/constants/payment.ts sebelum dipakai
              sungguhan.
            </p>
          )}

          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Bank</dt>
              <dd>{PLATFORM_BANK_ACCOUNT.bankName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">No. Rekening</dt>
              <dd className="font-mono">{PLATFORM_BANK_ACCOUNT.accountNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Atas Nama</dt>
              <dd>{PLATFORM_BANK_ACCOUNT.accountHolderName}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Jumlah Transfer</dt>
              <dd>Rp{order.total.toLocaleString('id-ID')}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <FileUploader
              label="Upload Bukti Transfer"
              value={proofUrl || undefined}
              uploadFn={uploadDocument}
              accept="image/*,application/pdf"
              onUploaded={setProofUrl}
              onRemove={() => setProofUrl('')}
              hint="JPG/PNG/PDF"
            />
          </div>

          {submitError && <p className="mt-2 text-sm text-red-600">{submitError}</p>}

          <button
            onClick={handleSubmitProof}
            disabled={!proofUrl || submitting}
            className="btn-primary mt-4"
          >
            {submitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
          </button>
        </div>
      )}

      {order.status === 'payment_submitted' && (
        <div className="mt-6 rounded-md bg-black/5 p-4 text-sm">
          <p className="font-medium">Bukti pembayaran sudah dikirim</p>
          <p className="text-ink/70">Menunggu verifikasi Admin JATIDIRI.</p>
          {order.paymentProofUrl && (
            <a
              href={order.paymentProofUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand underline"
            >
              Lihat bukti yang dikirim
            </a>
          )}
        </div>
      )}

      {order.status === 'payment_verified' && (
        <p className="mt-6 rounded-md bg-green-50 p-4 text-sm text-green-800">
          Pembayaran Anda sudah diverifikasi. Pesanan akan diproses oleh penjual.
        </p>
      )}

      {order.status === 'processing' && (
        <p className="mt-6 rounded-md bg-black/5 p-4 text-sm text-ink/70">
          Pesanan Anda sedang diproses oleh penjual.
        </p>
      )}

      {order.status === 'shipped' && isCustomer && (
        <div className="mt-6 rounded-md border border-black/10 p-4">
          <p className="text-sm text-ink/70">
            Pesanan sudah dikirim penjual. Konfirmasi setelah barang Anda terima.
          </p>
          <button
            onClick={handleConfirmReceived}
            disabled={confirming}
            className="btn-primary mt-4"
          >
            {confirming ? 'Memproses...' : 'Konfirmasi Pesanan Diterima'}
          </button>
        </div>
      )}

            {order.status === 'completed' && (
        <>
          <p className="mt-6 rounded-md bg-green-50 p-4 text-sm text-green-800">
            Pesanan selesai. Terima kasih sudah berbelanja!
          </p>

          {isCustomer &&
            (review ? (
              <p className="mt-4 text-sm text-ink/60">
                Anda sudah memberi ulasan untuk pesanan ini. Terima kasih!
              </p>
            ) : (
              <ReviewForm
                orderId={order.id}
                businessId={order.businessId}
                customerId={order.customerId}
                customerName={firebaseUser?.displayName || 'Pembeli'}
                onSubmitted={load}
              />
            ))}
        </>
      )}
    </section>
  )
}
