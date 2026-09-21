import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { slugify } from '@/utils/slugify'
import type { Business, BusinessApplication } from '@/types/business'

async function slugExists(slug: string): Promise<boolean> {
  const q = query(collection(db, 'businesses'), where('slug', '==', slug), limit(1))
  const snapshot = await getDocs(q)
  return !snapshot.empty
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || 'usaha'
  let candidate = base
  let suffix = 2
  while (await slugExists(candidate)) {
    candidate = `${base}-${suffix}`
    suffix++
  }
  return candidate
}

// Approve = buat dokumen businesses/{id} dari data businessApplications,
// DAN tandai application sebagai approved — sekaligus dalam satu batch
// write supaya atomik (tidak ada kondisi "business dibuat tapi
// application-nya lupa di-update" kalau salah satu gagal).
export async function approveApplication(
  application: BusinessApplication,
  adminUid: string,
): Promise<string> {
  const slug = await generateUniqueSlug(application.businessName ?? 'usaha')
  const businessRef = doc(collection(db, 'businesses'))
  const now = serverTimestamp()

  const batch = writeBatch(db)

  batch.set(businessRef, {
    ownerId: application.ownerId,
    businessName: application.businessName ?? '',
    slug,
    ownerName: application.ownerName ?? '',
    description: application.description ?? '',
    establishedYear: application.establishedYear ?? null,
    phone: application.businessPhone ?? '',
    email: application.businessEmail ?? null,
    logoUrl: application.logoUrl ?? null,
    gallery: application.gallery ?? [],
    socialLinks: application.socialLinks ?? {},
    primaryCategoryId: application.primaryCategoryId ?? null,
    additionalCategoryIds: application.additionalCategoryIds ?? [],
    address: application.address ?? {},
    offeringTypes: application.offeringTypes ?? [],
    offeringDescription: application.offeringDescription ?? '',
    banking: application.banking ?? {},
    legal: application.legal ?? { status: 'tidak_ada' },
    verification: {
      status: 'approved',
      submittedAt: application.submittedAt ?? null,
      reviewedAt: now,
      reviewedBy: adminUid,
    },
    applicationId: application.id,
    status: 'approved',
    createdAt: now,
    updatedAt: now,
  })

  batch.update(doc(db, 'businessApplications', application.id), {
    status: 'approved',
    businessId: businessRef.id,
    reviewedAt: now,
    reviewedBy: adminUid,
    updatedAt: now,
  })

  await batch.commit()
  return businessRef.id
}

// --- Seller: profil toko sendiri ---

// Single equality filter saja (ownerId) — tidak butuh composite index.
export async function getMyBusiness(uid: string): Promise<Business | null> {
  const q = query(collection(db, 'businesses'), where('ownerId', '==', uid), limit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() } as Business
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const snap = await getDoc(doc(db, 'businesses', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Business
}

// Field yang boleh diedit seller sendiri lewat halaman Profil Toko.
// TIDAK termasuk status/verification/banking/ownerId — itu memang
// sengaja diblokir di firestore.rules juga (pertahanan berlapis, bukan
// cuma mengandalkan UI ini).
export interface StoreProfilePatch {
  businessName?: string
  description?: string
  phone?: string
  email?: string
  logoUrl?: string
  gallery?: string[]
  socialLinks?: { instagram?: string; facebook?: string; tiktok?: string; website?: string }
}

export async function updateStoreProfile(businessId: string, patch: StoreProfilePatch) {
  await updateDoc(doc(db, 'businesses', businessId), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

// --- Publik (marketplace) ---

// SENGAJA cuma satu filter (status=='approved'), tanpa orderBy atau where
// kedua — supaya TIDAK butuh composite index sama sekali. Filter kategori
// & pencarian nama dilakukan di JS setelah fetch, bukan di query.
// Cukup untuk skala MVP; kalau nanti approved business sudah ratusan,
// ini titik yang perlu diganti strategi (lihat brief section 27 soal
// migrasi ke Algolia/Typesense).
export async function getApprovedBusinesses(): Promise<Business[]> {
  const q = query(collection(db, 'businesses'), where('status', '==', 'approved'))
  const snapshot = await getDocs(q)
  const businesses = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Business,
  )
  return businesses.sort((a, b) => a.businessName.localeCompare(b.businessName))
}

// Single equality filter (slug) — status='approved' dicek di kode, bukan
// di query, supaya tetap satu filter saja.
export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const q = query(collection(db, 'businesses'), where('slug', '==', slug), limit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const docSnap = snapshot.docs[0]
  const business = { id: docSnap.id, ...docSnap.data() } as Business
  return business.status === 'approved' ? business : null
}
