import type { Timestamp } from 'firebase/firestore'

// Satu dokumen = satu pencatatan transfer manual admin -> seller, mencakup
// satu atau beberapa order sekaligus. amount = total order dikurangi
// commissionAmount, dijumlah dari seluruh order yang tercakup.
export interface Payout {
  id: string
  sellerId: string
  businessId: string
  businessName: string
  orderIds: string[]
  amount: number
  note?: string
  createdAt: Timestamp
}
