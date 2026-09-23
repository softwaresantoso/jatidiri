import type { Timestamp } from 'firebase/firestore'

// State disederhanakan sama seperti Product (lihat types/product.ts).
export type ServiceStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'archived'
export type PricingType = 'fixed' | 'starting_from' | 'quotation'

export interface Service {
  id: string
  businessId: string
  ownerId: string
  name: string
  slug: string
  description: string
  categoryId: string
  images: string[]
  pricingType: PricingType
  startingPrice?: number // opsional kalau pricingType='quotation' (hubungi untuk penawaran)
  duration?: string
  serviceArea?: string
  bookingRequired: boolean
  status: ServiceStatus
  rejectionReason?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ServiceFormInput {
  name: string
  description: string
  categoryId: string
  images: string[]
  pricingType: PricingType
  startingPrice?: number
  duration?: string
  serviceArea?: string
  bookingRequired: boolean
}
