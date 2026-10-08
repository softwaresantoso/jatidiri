import type { Timestamp } from 'firebase/firestore'

export type ReviewStatus = 'published' | 'hidden'

// ID dokumen SENGAJA dibuat == orderId (lihat services/reviews.ts) —
// satu order cuma bisa punya satu review, dicegah di level Firestore
// (create gagal otomatis kalau dokumen sudah ada), tanpa perlu query
// tambahan untuk cek duplikat.
export interface Review {
  id: string
  orderId: string
  businessId: string
  customerId: string
  customerName: string
  rating: number // 1-5
  comment: string
  photoUrl?: string
  status: ReviewStatus
  createdAt: Timestamp
  updatedAt: Timestamp
}
