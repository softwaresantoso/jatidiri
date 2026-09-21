import type { Timestamp } from 'firebase/firestore'

// Tipe untuk businesses & businessApplications.
// PENTING: field waktu (submittedAt, reviewedAt, createdAt, updatedAt) ditulis
// via serverTimestamp() -> saat dibaca balik itu objek Firestore `Timestamp`,
// BUKAN string. `agreedAt` beda sendiri (ditulis via new Date().toISOString()
// di client, jadi memang string).
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

export type OfferingType =
  | 'produk'
  | 'jasa'
  | 'mesin'
  | 'peralatan'
  | 'paket_bisnis'
  | 'produk_custom'
  | 'preorder'
  | 'lainnya'

export type LegalDocumentStatus =
  | 'ada'
  | 'tidak_ada'
  | 'sedang_proses'
  | 'tidak_diperlukan'

export interface BusinessLegal {
  status: LegalDocumentStatus
  documentTypes?: string[] // NIB, NPWP, dst — dari checklist, bukan hardcode ketat
  documentNumber?: string
  documentUrl?: string
}

export interface BusinessVerification {
  status: BusinessStatus
  submittedAt?: Timestamp
  reviewedAt?: Timestamp
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
  socialLinks?: { instagram?: string; facebook?: string; tiktok?: string; website?: string }
  primaryCategoryId: string
  additionalCategoryIds: string[]
  address: BusinessAddress
  offeringTypes: OfferingType[]
  offeringDescription: string
  banking: BusinessBanking
  legal: BusinessLegal
  verification: BusinessVerification
  status: BusinessStatus
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Bentuk data selama wizard registrasi (Phase 5) — sengaja sebagian besar
// field opsional (data terisi bertahap per step, bukan sekaligus).
export interface BusinessApplication {
  id: string
  ownerId: string

  // Step 1 — Akun Pengelola (posisi orang yang daftar, bukan role sistem)
  managerPosition?: 'pemilik' | 'pengelola' | 'admin_usaha'
  whatsapp?: string

  // Step 2 — Identitas Usaha
  businessName?: string
  ownerName?: string
  establishedYear?: number
  description?: string
  businessPhone?: string
  businessEmail?: string
  logoUrl?: string
  gallery?: string[]
  socialLinks?: { instagram?: string; facebook?: string; tiktok?: string; website?: string }

  // Step 3 — Kategori
  primaryCategoryId?: string
  additionalCategoryIds?: string[]

  // Step 4 — Lokasi
  address?: Partial<BusinessAddress>

  // Step 5 — Produk/Layanan
  offeringTypes?: OfferingType[]
  offeringDescription?: string

  // Step 6 — Rekening
  banking?: Partial<BusinessBanking>

  // Step 7 — Legalitas
  legal?: BusinessLegal

  // Step 8 — Persetujuan
  agreementAccepted?: boolean
  agreedAt?: string

  status: BusinessStatus
  submittedAt?: Timestamp
  reviewedAt?: Timestamp
  reviewedBy?: string
  rejectionReason?: string
  revisionNote?: string
  businessId?: string // terisi setelah admin approve — id dokumen businesses/{id}
  createdAt: Timestamp
  updatedAt: Timestamp
}
