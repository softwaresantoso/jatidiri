import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { EMPTY_CART, type Cart } from '@/types/cart'

interface CartContextValue {
  cart: Cart
  itemCount: number
  loading: boolean
}

const CartContext = createContext<CartContextValue>({
  cart: EMPTY_CART,
  itemCount: 0,
  loading: true,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuth()
  const [cart, setCart] = useState<Cart>(EMPTY_CART)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseUser) {
      setCart(EMPTY_CART)
      setLoading(false)
      return
    }
    // onSnapshot (real-time) — badge di header ikut update begitu item
    // ditambah dari halaman produk, tanpa perlu refresh.
    const unsubscribe = onSnapshot(
      doc(db, 'carts', firebaseUser.uid),
      (snap) => {
        setCart(snap.exists() ? (snap.data() as Cart) : EMPTY_CART)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return unsubscribe
  }, [firebaseUser])

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, itemCount, loading }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
