// Terjemahan pesan error Firebase Auth ke Bahasa Indonesia yang ramah
// pengguna — jangan tampilkan kode error mentah ke user (lihat konvensi
// error handling di brief section 50).
export function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : ''

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Coba masuk, atau pakai email lain.'
    case 'auth/invalid-email':
      return 'Format email tidak valid.'
    case 'auth/weak-password':
      return 'Password terlalu lemah, minimal 6 karakter.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email atau password salah.'
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.'
    case 'auth/network-request-failed':
      return 'Koneksi bermasalah. Periksa internet Anda dan coba lagi.'
    default:
      return 'Terjadi kesalahan. Coba lagi sebentar lagi.'
  }
}
