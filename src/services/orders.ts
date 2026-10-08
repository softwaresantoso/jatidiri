import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getPlatformSettings } from '@/services/platformSettings'
import type { Order, OrderItem, ShippingInfo } from '@/types/order'
import type { CartItem } from '@/types/cart'

export async function createOrder(
  customerId: string,
  businessId: string,
  cartItems: CartItem[],
  shipping: ShippingInfo,
): Promise<string> {
  const items: OrderItem[] = cartItems.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    image: i.image,
  }))

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Phase 14 — komisi dibaca live dari platformSettings, bukan konstanta
  // hardcoded lagi. Di-snapshot ke order saat dibuat (brief section 31),
  // jadi perubahan komisi admin selanjutnya tidak mengubah order yang sudah ada.
  const { commissionRate } = await getPlatformSettings()
  const commissionAmount = Math.round(subtotal * commissionRate)
  const total = subtotal + shipping.cost

  // Phase 15 — snapshot sellerId (pemilik bisnis) supaya seller bisa query
  // daftar order miliknya tanpa rule list-query yang bergantung pada get().
  // Baca dokumen businesses/{businessId} — ini aman karena bisnis yang
  // produknya bisa dibeli pasti status 'approved' (public-read di rules).
  const businessSnap = await getDoc(doc(db, 'businesses', businessId))
  const sellerId = businessSnap.exists() ? (businessSnap.data().ownerId as string) : undefined

  const ref = doc(collection(db, 'orders'))
  await setDoc(ref, {
    customerId,
    businessId,
    ...(sellerId ? { sellerId } : {}),
    items,
    subtotal,
    shippingCost: shipping.cost,
    commissionRate,
    commissionAmount,
    total,
    shipping,
    status: 'pending_payment',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}

export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Order
}

// where('customerId','==',uid) — filter-nya PERSIS sama dengan syarat di
// firestore.rules (resource.data.customerId == request.auth.uid), jadi
// query ini lolos. Sortir di JS (bukan orderBy) supaya tidak butuh
// composite index.
export async function getMyOrders(customerId: string): Promise<Order[]> {
  const q = query(collection(db, 'orders'), where('customerId', '==', customerId))
  const snapshot = await getDocs(q)
  const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)
  return orders.sort(
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
  )
}

// --- Customer: kirim bukti pembayaran ---

// Rules cuma mengizinkan customer memindahkan pending_payment ->
// payment_submitted, dan HANYA menyentuh field di bawah ini.
export async function submitPaymentProof(orderId: string, proofUrl: string) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'payment_submitted',
    paymentProofUrl: proofUrl,
    paymentRejectionReason: deleteField(),
    updatedAt: serverTimestamp(),
  })
}

// --- Customer: konfirmasi pesanan diterima (Phase 15) ---

// Rules cuma mengizinkan customer memindahkan shipped -> completed,
// tidak bisa sentuh field lain.
export async function confirmOrderReceived(orderId: string) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'completed',
    updatedAt: serverTimestamp(),
  })
}

// --- Admin: verifikasi pembayaran ---

// Single filter status=='payment_submitted' — admin lolos lewat isAdmin()
// di rules (resource-independent), sama seperti antrian produk/aplikasi.
export async function getOrdersForPaymentReview(): Promise<Order[]> {
  const q = query(collection(db, 'orders'), where('status', '==', 'payment_submitted'))
  const snapshot = await getDocs(q)
  const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)
  return orders.sort(
    (a, b) => (a.updatedAt?.toMillis() ?? 0) - (b.updatedAt?.toMillis() ?? 0),
  )
}

export async function verifyPayment(orderId: string) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'payment_verified',
    updatedAt: serverTimestamp(),
  })
}

// Ditolak = balik ke pending_payment + alasan, supaya customer bisa
// upload ulang bukti yang benar.
export async function rejectPayment(orderId: string, reason: string) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'pending_payment',
    paymentRejectionReason: reason,
    updatedAt: serverTimestamp(),
  })
}

// --- Seller: dashboard order (Phase 15) ---

// where('sellerId','==',businessOwnerUid) — filter statis, match langsung
// dengan rule resource.data.sellerId == request.auth.uid. Tidak pakai
// get() di sini supaya query list ini tidak rapuh (lihat catatan teknis
// soal list-query vs get() di README).
export async function getOrdersForSeller(sellerId: string): Promise<Order[]> {
  const q = query(collection(db, 'orders'), where('sellerId', '==', sellerId))
  const snapshot = await getDocs(q)
  const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)
  return orders.sort(
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
  )
}

// payment_verified -> processing
export async function markOrderProcessing(orderId: string) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'processing',
    updatedAt: serverTimestamp(),
  })
}

// processing -> shipped
export async function markOrderShipped(orderId: string) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'shipped',
    updatedAt: serverTimestamp(),
  })
}
