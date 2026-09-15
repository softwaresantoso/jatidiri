// Mengikuti struktur URL di brief (section 47).
// Fungsi (bukan string statis) dipakai untuk path yang butuh slug/id,
// supaya penulisan link di seluruh app konsisten dan mudah diubah di satu tempat.
export const ROUTES = {
  home: '/',
  explore: '/explore',
  category: (slug: string) => `/kategori/${slug}`,
  product: (slug: string) => `/produk/${slug}`,
  service: (slug: string) => `/jasa/${slug}`,
  package: (slug: string) => `/paket/${slug}`,
  store: (slug: string) => `/toko/${slug}`,
  login: '/login',
  register: '/register',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/pesanan',
  order: (id: string) => `/pesanan/${id}`,
  account: '/account',
  unauthorized: '/unauthorized',
  sellerDashboard: '/pelaku/dashboard',
  adminDashboard: '/admin/dashboard',
} as const
