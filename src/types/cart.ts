import type { Timestamp } from 'firebase/firestore'

export interface CartItem {
  productId: string
  businessId: string
  name: string
  price: number
  image?: string
  quantity: number
}

// Satu dokumen per customer (carts/{uid}), sesuai brief section 35.
// businessId di level cart = vendor yang lagi "dikunci" oleh isi
// keranjang saat ini — null kalau kosong. Ini yang bikin single-vendor
// constraint (section 28/77) gampang dicek.
export interface Cart {
  businessId: string | null
  items: CartItem[]
  updatedAt?: Timestamp
}

export const EMPTY_CART: Cart = { businessId: null, items: [] }
