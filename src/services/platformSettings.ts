import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PlatformSettings } from '@/types/platformSettings'

const SETTINGS_COLLECTION = 'platformSettings'
const SETTINGS_DOC_ID = 'default'

// Dipakai kalau dokumen settings belum pernah dibuat sama sekali
// (misalnya sebelum admin pertama kali membuka halaman Komisi).
export const DEFAULT_COMMISSION_RATE = 0.05

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    return { commissionRate: DEFAULT_COMMISSION_RATE }
  }

  const data = snap.data()
  const commissionRate =
    typeof data.commissionRate === 'number'
      ? data.commissionRate
      : DEFAULT_COMMISSION_RATE

  return {
    commissionRate,
    updatedAt: data.updatedAt,
  }
}

export async function updateCommissionRate(rate: number): Promise<void> {
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
    throw new Error('Komisi harus berupa angka desimal antara 0 dan 1.')
  }

  const ref = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID)
  await setDoc(
    ref,
    {
      commissionRate: rate,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
