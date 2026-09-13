// STUB Phase 1 — inisialisasi Firebase (initializeApp, getAuth, getFirestore,
// getStorage) akan ditulis di Phase 2. File ini hanya memastikan alur env
// sudah benar sejak sekarang, sesuai .env.example.

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} as const
