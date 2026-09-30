import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ShippingMethod, ShippingMethodInput } from '@/types/shipping'

// Rule collection ini "allow read: if true" (sama seperti categories) —
// tidak bergantung pada resource.data sama sekali, jadi TIDAK kena
// masalah query-time rules seperti businesses/products (Phase 8/9).

// Dipakai di checkout — publik/customer.
export async function getActiveShippingMethods(): Promise<ShippingMethod[]> {
  const q = query(collection(db, 'shippingMethods'), where('isActive', '==', true))
  const snapshot = await getDocs(q)
  const methods = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ShippingMethod)
  return methods.sort((a, b) => a.cost - b.cost)
}

// Dipakai admin — termasuk yang nonaktif, biar bisa diaktifkan lagi.
export async function getAllShippingMethods(): Promise<ShippingMethod[]> {
  const snapshot = await getDocs(collection(db, 'shippingMethods'))
  const methods = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ShippingMethod)
  return methods.sort((a, b) => a.cost - b.cost)
}

export async function createShippingMethod(data: ShippingMethodInput) {
  await addDoc(collection(db, 'shippingMethods'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateShippingMethod(id: string, data: Partial<ShippingMethodInput>) {
  await updateDoc(doc(db, 'shippingMethods', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteShippingMethod(id: string) {
  await deleteDoc(doc(db, 'shippingMethods', id))
}
