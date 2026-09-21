import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { slugify } from '@/utils/slugify'
import type { BusinessApplication } from '@/types/business'

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
