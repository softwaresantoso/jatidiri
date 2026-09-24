import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EMPTY_CART, type Cart, type CartItem } from '@/types/cart'

// Selalu tulis ulang seluruh dokumen (bukan updateDoc partial) — cart
// kecil, dan ini menghindari kompleksitas operasi array Firestore
// (arrayUnion tidak bisa "increment quantity kalau item sudah ada").

export async function getCart(uid: string): Promise<Cart> {
  const snap = await getDoc(doc(db, 'carts', uid))
  if (!snap.exists()) return EMPTY_CART
  return snap.data() as Cart
}

// Dipakai kalau cart kosong ATAU businessId-nya sama dengan item baru —
// merge quantity kalau produk yang sama sudah ada di cart.
export async function addItemToCart(uid: string, businessId: string, item: CartItem) {
  const cart = await getCart(uid)
  const existingIndex = cart.items.findIndex((i) => i.productId === item.productId)
  const items =
    existingIndex >= 0
      ? cart.items.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + item.quantity } : i,
        )
      : [...cart.items, item]
  await setDoc(doc(db, 'carts', uid), { businessId, items, updatedAt: serverTimestamp() })
}

// Dipakai setelah user KONFIRMASI mau ganti vendor (dialog single-vendor
// constraint) — cart lama dibuang, mulai dari item ini saja.
export async function replaceCartWithItem(uid: string, businessId: string, item: CartItem) {
  await setDoc(doc(db, 'carts', uid), {
    businessId,
    items: [item],
    updatedAt: serverTimestamp(),
  })
}

export async function updateItemQuantity(uid: string, productId: string, quantity: number) {
  const cart = await getCart(uid)
  const items =
    quantity <= 0
      ? cart.items.filter((i) => i.productId !== productId)
      : cart.items.map((i) => (i.productId === productId ? { ...i, quantity } : i))
  const businessId = items.length > 0 ? cart.businessId : null
  await setDoc(doc(db, 'carts', uid), { businessId, items, updatedAt: serverTimestamp() })
}

export async function removeCartItem(uid: string, productId: string) {
  return updateItemQuantity(uid, productId, 0)
}

export async function clearCart(uid: string) {
  await setDoc(doc(db, 'carts', uid), { ...EMPTY_CART, updatedAt: serverTimestamp() })
}
