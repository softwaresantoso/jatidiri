import {
  collection,
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
import type { Review, ReviewStatus } from '@/types/review'

export async function getReviewByOrderId(orderId: string): Promise<Review | null> {
  const snap = await getDoc(doc(db, 'reviews', orderId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Review
}

interface CreateReviewInput {
  orderId: string
  businessId: string
  customerId: string
  customerName: string
  rating: number
  comment: string
  photoUrl?: string
}

// Doc ID == orderId. Rules mewajibkan order itu milik customerId yang sama
// dan statusnya 'completed' — lihat firestore.rules match /reviews/{orderId}.
export async function createReview(input: CreateReviewInput): Promise<void> {
  const ref = doc(db, 'reviews', input.orderId)
  await setDoc(ref, {
    orderId: input.orderId,
    businessId: input.businessId,
    customerId: input.customerId,
    customerName: input.customerName,
    rating: input.rating,
    comment: input.comment,
    ...(input.photoUrl ? { photoUrl: input.photoUrl } : {}),
    status: 'published',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// Publik: review 'published' untuk satu bisnis (dipakai di storefront).
// Dua filter == (businessId, status) — tidak butuh composite index karena
// Firestore merge-join single-field index untuk kombinasi == murni.
export async function getPublishedReviewsForBusiness(businessId: string): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('businessId', '==', businessId),
    where('status', '==', 'published'),
  )
  const snapshot = await getDocs(q)
  const reviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Review)
  return reviews.sort(
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
  )
}

export function getAverageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return sum / reviews.length
}

// --- Admin: moderasi ---

// Tanpa filter sama sekali — rule-nya cuma isAdmin() (tidak gantung ke data
// dokumen), jadi aman buat list query penuh, sama seperti pola admin-only
// list lain di app ini.
export async function getAllReviews(): Promise<Review[]> {
  const snapshot = await getDocs(collection(db, 'reviews'))
  const reviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Review)
  return reviews.sort(
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
  )
}

export async function setReviewStatus(orderId: string, status: ReviewStatus): Promise<void> {
  await updateDoc(doc(db, 'reviews', orderId), {
    status,
    updatedAt: serverTimestamp(),
  })
}
