import type { Timestamp } from 'firebase/firestore'

export interface ShippingMethod {
  id: string
  name: string
  description?: string
  cost: number
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ShippingMethodInput {
  name: string
  description?: string
  cost: number
  isActive: boolean
}
