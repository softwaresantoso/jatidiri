import type { Timestamp } from 'firebase/firestore'

// Disederhanakan dari state list di brief section 33 — dropped
// ready_to_ship/delivered/rejected/refunded untuk MVP.
export type OrderStatus =
  | 'pending_payment'
  | 'payment_submitted'
  | 'payment_verified'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface ShippingInfo {
  recipientName: string
  phone: string
  address: string
  method: string
  cost: number
}

export interface Order {
  id: string
  customerId: string
  businessId: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  // Snapshot rate & amount SAAT order dibuat (brief section 31).
  commissionRate: number
  commissionAmount: number
  total: number
  shipping: ShippingInfo
  status: OrderStatus
  // Phase 12 — pembayaran manual transfer
  paymentProofUrl?: string
  paymentRejectionReason?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
