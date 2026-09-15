import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { AppUser } from '@/types'

interface AuthContextValue {
  firebaseUser: User | null
  appUser: AppUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  appUser: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      if (!user) {
        setAppUser(null)
        setLoading(false)
      }
      // Kalau user ada, appUser diisi lewat listener Firestore di bawah.
    })
    return unsubscribeAuth
  }, [])

  useEffect(() => {
    if (!firebaseUser) return

    // onSnapshot (bukan getDoc sekali) supaya kalau role user diubah admin
    // (mis. saat approve seller nanti), UI ikut update tanpa perlu re-login.
    const unsubscribeDoc = onSnapshot(
      doc(db, 'users', firebaseUser.uid),
      (snapshot) => {
        setAppUser(snapshot.exists() ? (snapshot.data() as AppUser) : null)
        setLoading(false)
      },
      () => {
        setAppUser(null)
        setLoading(false)
      },
    )
    return unsubscribeDoc
  }, [firebaseUser])

  return (
    <AuthContext.Provider value={{ firebaseUser, appUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
