import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { BusinessApplication } from '@/types/business'

// Cari draft/revision_required milik user ini — dipakai untuk resume
// wizard kalau user refresh/kembali di tengah jalan (section 8: "save
// progress").
export async function getMyOpenApplication(
  uid: string,
): Promise<BusinessApplication | null> {
  const q = query(
    collection(db, 'businessApplications'),
    where('ownerId', '==', uid),
    where('status', 'in', ['draft', 'submitted', 'under_review', 'revision_required']),
    limit(1),
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const docSnap = snapshot.docs[0]
  return { id: docSnap.id, ...docSnap.data() } as BusinessApplication
}

export async function createDraftApplication(uid: string): Promise<string> {
  const ref = await addDoc(collection(db, 'businessApplications'), {
    ownerId: uid,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

// Dipanggil tiap "Lanjut" di tiap step — partial update, bukan overwrite
// seluruh dokumen, supaya data step lain yang sudah tersimpan tidak hilang.
export async function updateApplicationDraft(
  applicationId: string,
  patch: Partial<BusinessApplication>,
) {
  await updateDoc(doc(db, 'businessApplications', applicationId), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

export async function submitApplication(applicationId: string) {
  await updateDoc(doc(db, 'businessApplications', applicationId), {
    status: 'submitted',
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
