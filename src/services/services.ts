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
import { slugify } from '@/utils/slugify'
import type { Service, ServiceFormInput } from '@/types/service'

// Sama persis polanya dengan services/products.ts — lihat komentar di
// sana untuk alasan tiap keputusan (query single-filter, dst.).

// Sama seperti products.ts — TIDAK ada query pengecekan slug, langsung
// turunkan dari ID dokumen yang dijamin unik. Lihat komentar
// buildProductSlug di services/products.ts untuk alasan lengkapnya.
function buildServiceSlug(name: string, docId: string): string {
  return `${slugify(name) || 'jasa'}-${docId.slice(0, 6)}`
}

// --- Seller ---

export async function createService(
  businessId: string,
  ownerId: string,
  data: ServiceFormInput,
): Promise<string> {
  const ref = doc(collection(db, 'services'))
  const slug = buildServiceSlug(data.name, ref.id)
  await setDoc(ref, {
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
