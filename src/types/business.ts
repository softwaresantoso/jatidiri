// Tipe untuk businesses & businessApplications.
// State machine status DISATUKAN (resolusi kontradiksi Section 20 vs 37
// di brief asli): draft -> submitted -> under_review -> approved |
// revision_required | rejected, lalu approved -> suspended terpisah.
export type BusinessStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'revision_required'
  | 'rejected'
  | 'suspended'

export interface BusinessAddress {
  province: string
  city: string
  district: string
  village: string
  fullAddress: string
  postalCode?: string
  mapsUrl?: string
  latitude?: number
  longitude?: number
}

export interface BusinessBanking {
  bankName: string
  accountNumber: string
  accountHolderName: string
  holderDiffersFromOwner: boolean
}

export interface BusinessVerification {
  status: BusinessStatus
  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  revisionNote?: string
}

export interface Business {
  id: string
  ownerId: string
  businessName: string
  slug: string
  ownerName: string
  description: string
  establishedYear: number
  phone: string
  email?: string
  logoUrl?: string
  gallery: string[]
  primaryCategoryId: string
  additionalCategoryIds: string[]
  address: BusinessAddress
  banking: BusinessBanking
  verification: BusinessVerification
  status: BusinessStatus
  createdAt: string
  updatedAt: string
}

// Bentuk data selama wizard registrasi (Phase 5) — belum tentu lengkap,
// makanya sebagian besar field opsional dibanding Business.
export interface BusinessApplication {
  id: string
  ownerId: string
  businessName?: string
  ownerName?: string
  description?: string
  establishedYear?: number
  phone?: string
  email?: string
  logoUrl?: string
  gallery?: string[]
  primaryCategoryId?: string
  additionalCategoryIds?: string[]
  address?: Partial<BusinessAddress>
  banking?: Partial<BusinessBanking>
  status: BusinessStatus
  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  revisionNote?: string
  createdAt: string
  updatedAt: string
}
