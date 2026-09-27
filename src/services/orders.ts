import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COMMISSION_RATE } from '@/constants/checkout'
import type { OrderItem, ShippingInfo } from '@/types/order'
import type { CartItem } from '@/types/cart'

export async function createOrder(
  customerId: string,
  businessId: string,
  cartItems: CartItem[],
  shipping: ShippingInfo,
): Promise<string> {
  const items: OrderItem[] = cartItems.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    image: i.image,
  }))

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const commissionAmount = Math.round(subtotal * COMMISSION_RATE)
  const total = subtotal + shipping.cost

  const ref = doc(collection(db, 'orders'))
  await setDoc(ref, {
    customerId,
    businessId,
    items,
    subtotal,
    shippingCost: shipping.cost,
    commissionRate: COMMISSION_RATE,
    commissionAmount,
    total,
    shipping,
    status: 'pending_payment',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return ref.id
}
