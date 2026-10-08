import type { Timestamp } from 'firebase/firestore'

export interface PlatformSettings {
  commissionRate: number
  updatedAt?: Timestamp
}
