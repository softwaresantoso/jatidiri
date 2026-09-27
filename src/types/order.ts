import type { Timestamp } from 'firebase/firestore'

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
  commissionRate: number
  commissionAmount: number
  total: number
  shipping: ShippingInfo
  status: OrderStatus
  createdAt: Timestamp
  updatedAt: Timestamp
}
