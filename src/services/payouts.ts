import { collection, doc, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Payout } from '@/types/payout'

interface CreatePayoutInput {
  sellerId: string
  businessId: string
  businessName: string
  orderIds: string[]
  amount: number
  note?: string
}

// Satu batch atomik: bikin dokumen payout baru, lalu tandai semua order yang
// tercakup supaya tidak muncul lagi di daftar "belum dicairkan" di
// AdminPayoutsPage. Kalau salah satu write gagal, semuanya dibatalkan.
export async function createPayout(input: CreatePayoutInput): Promise<void> {
  const batch = writeBatch(db)
  const payoutRef = doc(collection(db, 'payouts'))

  batch.set(payoutRef, {
    sellerId: input.sellerId,
    businessId: input.businessId,
    businessName: input.businessName,
    orderIds: input.orderIds,
    amount: input.amount,
    ...(input.note ? { note: input.note } : {}),
    createdAt: serverTimestamp(),
  })

  for (const orderId of input.orderIds) {
    batch.update(doc(db, 'orders', orderId), {
      payoutId: payoutRef.id,
      payoutAt: serverTimestamp(),
    })
  }

  await batch.commit()
}

// Tanpa filter — admin-only lewat rules (match /payouts), pola sama seperti
// getAllOrders/getAllReviews di service lain.
export async function getAllPayouts(): Promise<Payout[]> {
  const snapshot = await getDocs(collection(db, 'payouts'))
  const payouts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Payout)
  return payouts.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
}
