import type { OrderStatus } from '@/types/order'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Menunggu pembayaran',
  payment_submitted: 'Menunggu verifikasi pembayaran',
  payment_verified: 'Pembayaran terverifikasi',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}
