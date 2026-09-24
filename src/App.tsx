import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import AppRoutes from '@/routes/AppRoutes'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
