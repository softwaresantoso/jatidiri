import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { UserRole } from '@/types'

// Registrasi Pelanggan (role='customer'). Registrasi Pelaku Industri
// PUNYA alur sendiri (wizard 9 langkah, Phase 5) yang membuat akun sebagai
// bagian dari Step 1 wizard — bukan lewat fungsi ini.
export async function signUpCustomer(
  email: string,
  password: string,
  displayName: string,
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  await createUserDocument(credential.user.uid, email, displayName, 'customer')
  return credential.user
}

async function createUserDocument(
  uid: string,
  email: string,
  displayName: string,
  role: UserRole,
) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    displayName,
    role,
    createdAt: serverTimestamp(),
  })
}

export async function logIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function logOut() {
  await firebaseSignOut(auth)
}
