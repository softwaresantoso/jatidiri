import type { Timestamp } from 'firebase/firestore'

// Disederhanakan dari 6-state flow di brief (draft/submitted/under_review/
// approved/published/rejected/archived) jadi 5 state — 'approved' di sini
// LANGSUNG berarti tampil publik (tidak ada state 'published' terpisah).
export type ProductStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'archived'

export type ProductType = 'physical' | 'digital' | 'custom' | 'preorder'

export interface Product {
  id: string
  businessId: string
  ownerId: string // duplikasi dari business.ownerId — biar query "produk saya" tidak perlu join
  name: string
  slug: string
  description: string
  categoryId: string
  images: string[]
  price: number
  compareAtPrice?: number
  stock: number
  unit: string
  sku?: string
  productType: ProductType
  status: ProductStatus
  rejectionReason?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Bentuk data form create/edit (sebelum ada id/timestamps)
export interface ProductFormInput {
  name: string
  description: string
  categoryId: string
  images: string[]
  price: number
  compareAtPrice?: number
  stock: number
  unit: string
  sku?: string
  productType: ProductType
}
