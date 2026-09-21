import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Category } from '@/types/category'

// Semua query Firestore lewat services/, bukan langsung di component
// (konvensi proyek — lihat README).
export async function getActiveCategories(): Promise<Category[]> {
  const q = query(
    collection(db, 'categories'),
    where('isActive', '==', true),
    orderBy('name'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Category,
  )
}

// Single equality filter saja — sengaja tidak digabung dengan where lain,
// biar tidak butuh composite index (lihat catatan index di Phase 5/6).
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const q = query(collection(db, 'categories'), where('slug', '==', slug), limit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() } as Category
}
