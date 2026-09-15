import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
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
