import type { OrderStatus } from '@/types/order'

// Urutan normal (tidak termasuk 'cancelled' — itu ditangani terpisah
// sebagai state "keluar jalur" di bawah).
const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'pending_payment', label: 'Menunggu Pembayaran' },
  { status: 'payment_submitted', label: 'Bukti Dikirim' },
  { status: 'payment_verified', label: 'Pembayaran Diverifikasi' },
  { status: 'processing', label: 'Diproses' },
  { status: 'shipped', label: 'Dikirim' },
  { status: 'completed', label: 'Selesai' },
]

interface OrderStatusTimelineProps {
  status: OrderStatus
}

export default function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        Pesanan dibatalkan
      </div>
    )
  }

  const currentIndex = STEPS.findIndex((s) => s.status === status)

  return (
    <ol className="mb-6 flex flex-wrap gap-y-4">
      {STEPS.map((step, index) => {
        const isDone = index <= currentIndex
        const isCurrent = index === currentIndex
        return (
          <li key={step.status} className="flex min-w-[120px] flex-1 items-center">
            <div className="flex flex-col items-center text-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isDone
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-1 text-xs ${
                  isDone ? 'font-medium text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
                  index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
