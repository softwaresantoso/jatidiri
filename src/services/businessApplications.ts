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
import type { BusinessApplication } from '@/types/business'

// Cari aplikasi (apapun statusnya) milik user ini — dipakai untuk resume
// wizard (section 8: "save progress") DAN untuk menampilkan status kalau
// sudah submitted/approved/rejected. Sengaja TANPA filter status (cuma
// ownerId + limit(1)): selain lebih simpel, ini juga menghindari perlu
// composite index sama sekali untuk query ini.
export async function getMyOpenApplication(
  uid: string,
): Promise<BusinessApplication | null> {
  const q = query(
    collection(db, 'businessApplications'),
    where('ownerId', '==', uid),
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

// --- Admin ---

// SENGAJA tanpa orderBy: where(...'in'...) + orderBy field lain butuh
// composite index (sudah 2x kena masalah ini di Phase 5) — untuk skala
// antrian review yang masih kecil, urutkan di JS saja sesudah fetch.
export async function getApplicationsForReview(): Promise<BusinessApplication[]> {
  const q = query(
    collection(db, 'businessApplications'),
    where('status', 'in', ['submitted', 'under_review']),
  )
  const snapshot = await getDocs(q)
  const applications = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as BusinessApplication,
  )
  return applications.sort((a, b) => {
    const aTime = a.submittedAt?.toMillis() ?? 0
    const bTime = b.submittedAt?.toMillis() ?? 0
    return bTime - aTime // terbaru dulu
  })
}

export async function getApplicationById(
  id: string,
): Promise<BusinessApplication | null> {
  const snap = await getDoc(doc(db, 'businessApplications', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as BusinessApplication
}

export async function rejectApplication(
  applicationId: string,
  adminUid: string,
  reason: string,
) {
  await updateDoc(doc(db, 'businessApplications', applicationId), {
    status: 'rejected',
    rejectionReason: reason,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
    updatedAt: serverTimestamp(),
  })
}

export async function requestRevision(
  applicationId: string,
  adminUid: string,
  note: string,
) {
  await updateDoc(doc(db, 'businessApplications', applicationId), {
    status: 'revision_required',
    revisionNote: note,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminUid,
    updatedAt: serverTimestamp(),
  })
}
