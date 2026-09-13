// Tipe inti. Akan tumbuh signifikan di Phase 3 (auth/roles) dan Phase 9
// (product/service/package) — file ini sengaja masih minimal di Phase 1.

export type UserRole = 'customer' | 'seller' | 'admin'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
}
