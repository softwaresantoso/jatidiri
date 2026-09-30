// PLACEHOLDER — sama seperti shipping/commission, ini belum admin-
// configurable. Model MVP: customer transfer ke rekening JATIDIRI
// (bukan langsung ke rekening seller), karena commission perlu dipotong
// dulu sebelum sisanya diteruskan ke seller secara manual di luar
// aplikasi. GANTI nilai di bawah dengan rekening asli sebelum dipakai
// sungguhan — kalau tidak, uang customer akan salah alamat.
export const PLATFORM_BANK_ACCOUNT = {
  bankName: 'Bank Central Asia',
  accountNumber: '3270662985',
  accountHolderName: 'Singgih Rahmad Santoso',
}
