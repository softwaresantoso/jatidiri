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
import type { Product, ProductFormInput } from '@/types/product'

async function slugExists(slug: string): Promise<boolean> {
  const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1))
  const snapshot = await getDocs(q)
  return !snapshot.empty
}

async function generateUniqueProductSlug(name: string): Promise<string> {
  const base = slugify(name) || 'produk'
  let candidate = base
  let suffix = 2
  while (await slugExists(candidate)) {
    candidate = `${base}-${suffix}`
    suffix++
  }
  return candidate
}

// --- Seller ---

export async function createProduct(
  businessId: string,
  ownerId: string,
  data: ProductFormInput,
): Promise<string> {
  const slug = await generateUniqueProductSlug(data.name)
  const ref = await addDoc(collection(db, 'products'), {
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

// Edit biasa (status TIDAK berubah, termasuk kalau sudah 'approved' —
// lihat firestore.rules: edit rutin tidak perlu moderasi ulang).
export async function updateProduct(productId: string, data: Partial<ProductFormInput>) {
  await updateDoc(doc(db, 'products', productId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function submitProduct(productId: string) {
  await updateDoc(doc(db, 'products', productId), {
    status: 'submitted',
    updatedAt: serverTimestamp(),
  })
}

export async function archiveProduct(productId: string) {
  await updateDoc(doc(db, 'products', productId), {
    status: 'archived',
    updatedAt: serverTimestamp(),
  })
}

// Single equality filter — tidak butuh composite index.
export async function getMyProducts(ownerId: string): Promise<Product[]> {
  const q = query(collection(db, 'products'), where('ownerId', '==', ownerId))
  const snapshot = await getDocs(q)
  const products = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Product,
  )
  return products.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Product
}

// --- Publik (storefront) ---

// Dua equality filter (businessId + status) — INGAT pelajaran Phase 8:
// filter status HARUS ada di query untuk pengunjung anonim, bukan dicek
// belakangan. Dua filter '==' murni begini tidak butuh composite index.
export async function getApprovedProductsByBusiness(businessId: string): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('businessId', '==', businessId),
    where('status', '==', 'approved'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Product)
}

// Untuk halaman detail produk publik (/produk/:slug). status='approved'
// WAJIB di query (bukan dicek belakangan) — pelajaran dari bug storefront
// Phase 8: Firestore menolak seluruh query kalau strukturnya bisa
// mengembalikan dokumen yang gagal security rule untuk pengunjung anonim.
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(
    collection(db, 'products'),
    where('slug', '==', slug),
    where('status', '==', 'approved'),
    limit(1),
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() } as Product
}

// --- Admin ---

// Single filter (status=='submitted') — sengaja tidak pakai 'in' supaya
// tidak perlu composite index (lihat pelajaran Phase 5/6).
export async function getProductsForReview(): Promise<Product[]> {
  const q = query(collection(db, 'products'), where('status', '==', 'submitted'))
  const snapshot = await getDocs(q)
  const products = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Product,
  )
  return products.sort((a, b) => a.updatedAt.toMillis() - b.updatedAt.toMillis())
}

export async function approveProduct(productId: string) {
  await updateDoc(doc(db, 'products', productId), {
    status: 'approved',
    updatedAt: serverTimestamp(),
  })
}

export async function rejectProduct(productId: string, reason: string) {
  await updateDoc(doc(db, 'products', productId), {
    status: 'rejected',
    rejectionReason: reason,
    updatedAt: serverTimestamp(),
  })
}
