import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { slugify } from '@/utils/slugify'
import type { Service, ServiceFormInput } from '@/types/service'

// Sama persis polanya dengan services/products.ts — lihat komentar di
// sana untuk alasan tiap keputusan (query single-filter, dst.).

async function slugExists(slug: string): Promise<boolean> {
  const q = query(collection(db, 'services'), where('slug', '==', slug), limit(1))
  const snapshot = await getDocs(q)
  return !snapshot.empty
}

async function generateUniqueServiceSlug(name: string): Promise<string> {
  const base = slugify(name) || 'jasa'
  let candidate = base
  let suffix = 2
  while (await slugExists(candidate)) {
    candidate = `${base}-${suffix}`
    suffix++
  }
  return candidate
}

// --- Seller ---

export async function createService(
  businessId: string,
  ownerId: string,
  data: ServiceFormInput,
): Promise<string> {
  const slug = await generateUniqueServiceSlug(data.name)
  const ref = await addDoc(collection(db, 'services'), {
    ...data,
    businessId,
    ownerId,
    slug,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateService(serviceId: string, data: Partial<ServiceFormInput>) {
  await updateDoc(doc(db, 'services', serviceId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function submitService(serviceId: string) {
  await updateDoc(doc(db, 'services', serviceId), {
    status: 'submitted',
    updatedAt: serverTimestamp(),
  })
}

export async function archiveService(serviceId: string) {
  await updateDoc(doc(db, 'services', serviceId), {
    status: 'archived',
    updatedAt: serverTimestamp(),
  })
}

export async function getMyServices(ownerId: string): Promise<Service[]> {
  const q = query(collection(db, 'services'), where('ownerId', '==', ownerId))
  const snapshot = await getDocs(q)
  const services = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Service,
  )
  return services.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
}

export async function getServiceById(id: string): Promise<Service | null> {
  const snap = await getDoc(doc(db, 'services', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Service
}

// --- Publik (storefront) ---

export async function getApprovedServicesByBusiness(businessId: string): Promise<Service[]> {
  const q = query(
    collection(db, 'services'),
    where('businessId', '==', businessId),
    where('status', '==', 'approved'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Service)
}

// --- Admin ---

export async function getServicesForReview(): Promise<Service[]> {
  const q = query(collection(db, 'services'), where('status', '==', 'submitted'))
  const snapshot = await getDocs(q)
  const services = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Service,
  )
  return services.sort((a, b) => a.updatedAt.toMillis() - b.updatedAt.toMillis())
}

export async function approveService(serviceId: string) {
  await updateDoc(doc(db, 'services', serviceId), {
    status: 'approved',
    updatedAt: serverTimestamp(),
  })
}

export async function rejectService(serviceId: string, reason: string) {
  await updateDoc(doc(db, 'services', serviceId), {
    status: 'rejected',
    rejectionReason: reason,
    updatedAt: serverTimestamp(),
  })
}
