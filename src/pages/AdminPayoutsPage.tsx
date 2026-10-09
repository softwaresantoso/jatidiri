import { useEffect, useState } from 'react'
import { getAllOrders } from '@/services/orders'
import { getBusinessById } from '@/services/businesses'
import { createPayout, getAllPayouts } from '@/services/payouts'
import type { Order } from '@/types/order'
import type { Payout } from '@/types/payout'
import type { BusinessBanking } from '@/types/business'

interface SellerBalance {
  sellerId: string
  businessId: string
  businessName: string
  // Data rekening dari businesses/{id}.banking (diisi seller lewat wizard
  // pendaftaran Phase 5). Optional karena businesses lama / data tidak
  // lengkap bisa saja belum punya ini.
  banking?: BusinessBanking
  orderIds: string[]
  amount: number
}

export default function AdminPayoutsPage() {
  const [loading, setLoading] = useState(true)
  const [balances, setBalances] = useState<SellerBalance[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [orders, payoutHistory] = await Promise.all([getAllOrders(), getAllPayouts()])

      const unpaid = orders.filter(
        (o): o is Order & { sellerId: string } =>
          o.status === 'completed' && !o.payoutId && !!o.sellerId,
      )

      const grouped = new Map<string, Order[]>()
      for (const order of unpaid) {
        const key = order.sellerId
        const list = grouped.get(key) ?? []
        list.push(order)
        grouped.set(key, list)
      }

      // Cache per businessId supaya tidak fetch berkali-kali kalau satu
      // seller punya banyak order. Simpan businessName + banking sekaligus
      // (banking diisi seller lewat wizard pendaftaran, bisa saja kosong
      // untuk business lama / belum lengkap).
      const businessCache = new Map<string, { businessName: string; banking?: BusinessBanking }>()
      const result: SellerBalance[] = []

      for (const [sellerId, sellerOrders] of grouped) {
        const businessId = sellerOrders[0].businessId
        let businessInfo = businessCache.get(businessId)
        if (!businessInfo) {
          const biz = await getBusinessById(businessId)
          businessInfo = {
            businessName: biz?.businessName ?? 'Toko tidak ditemukan',
            banking: biz?.banking,
          }
          businessCache.set(businessId, businessInfo)
        }
        const amount = sellerOrders.reduce(
          (sum, o) => sum + (o.total - o.commissionAmount),
          0,
        )
        result.push({
          sellerId,
          businessId,
          businessName: businessInfo.businessName,
          banking: businessInfo.banking,
          orderIds: sellerOrders.map((o) => o.id),
          amount,
        })
      }

      result.sort((a, b) => b.amount - a.amount)
      setBalances(result)
      setPayouts(payoutHistory)
    } catch (err) {
      console.error(err)
      setError('Gagal memuat data pencairan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handlePayout(balance: SellerBalance) {
    setProcessingId(balance.sellerId)
    setError(null)
    try {
      await createPayout({
        sellerId: balance.sellerId,
        businessId: balance.businessId,
        businessName: balance.businessName,
        orderIds: balance.orderIds,
        amount: balance.amount,
        note: notes[balance.sellerId],
      })
      await load()
    } catch (err) {
      console.error(err)
      setError('Gagal mencatat pencairan. Coba lagi.')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-gray-500">Memuat data pencairan...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Pencairan ke Seller</h1>
      <p className="mb-6 text-sm text-gray-600">
        Daftar di bawah menghitung total yang harus ditransfer ke tiap seller (total
        order dikurangi komisi platform) dari pesanan yang sudah <strong>selesai</strong>{' '}
        dan belum pernah dicairkan. Setelah kamu benar-benar transfer manual ke rekening
        seller, klik &quot;Tandai Sudah Dicairkan&quot; untuk mencatatnya di sini.
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <h2 className="mb-3 text-lg font-semibold text-gray-900">Belum Dicairkan</h2>
      {balances.length === 0 ? (
        <p className="mb-8 text-sm text-gray-500">
          Tidak ada saldo yang menunggu dicairkan saat ini.
        </p>
      ) : (
        <div className="mb-8 space-y-3">
          {balances.map((balance) => (
            <div
              key={balance.sellerId}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="font-medium text-gray-900">{balance.businessName}</p>
              <p className="text-sm text-gray-500">
                {balance.orderIds.length} pesanan · Rp{balance.amount.toLocaleString('id-ID')}
              </p>

              {balance.banking?.bankName &&
              balance.banking?.accountNumber &&
              balance.banking?.accountHolderName ? (
                <div className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">{balance.banking.bankName}</span> ·{' '}
                    {balance.banking.accountNumber}
                  </p>
                  <p className="text-gray-500">
                    a.n. {balance.banking.accountHolderName}
                    {balance.banking.holderDiffersFromOwner && (
                      <span className="ml-1 text-amber-600">
                        (beda dengan nama pemilik usaha)
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Data rekening belum lengkap — cek profil usaha seller sebelum transfer.
                </p>
              )}

              <input
                type="text"
                placeholder="Catatan (opsional, misal: no. referensi transfer)"
                value={notes[balance.sellerId] ?? ''}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [balance.sellerId]: e.target.value }))
                }
                className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />

              <button
                onClick={() => handlePayout(balance)}
                disabled={processingId === balance.sellerId}
                className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {processingId === balance.sellerId ? 'Menyimpan...' : 'Tandai Sudah Dicairkan'}
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-gray-900">Riwayat Pencairan</h2>
      {payouts.length === 0 ? (
        <p className="text-sm text-gray-500">Belum ada riwayat pencairan.</p>
      ) : (
        <div className="space-y-2">
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{payout.businessName}</span>
                <span className="text-gray-700">
                  Rp{payout.amount.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {payout.orderIds.length} pesanan{payout.note ? ` · ${payout.note}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
