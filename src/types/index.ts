// Tipe inti. Akan tumbuh signifikan di Phase 4 (roles/protected routes) dan
// Phase 9 (product/service/package) — file ini sengaja masih minimal.
import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'customer' | 'seller' | 'admin'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Timestamp
}
