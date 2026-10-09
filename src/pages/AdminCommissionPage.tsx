import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  getPlatformSettings,
  updateCommissionRate,
  DEFAULT_COMMISSION_RATE,
} from '@/services/platformSettings'
import { getAllOrders } from '@/services/orders'
import type { OrderStatus } from '@/types/order'

// Komisi dianggap "terkumpul" cuma untuk order yang pembayarannya sudah
// terverifikasi admin — pending_payment/payment_submitted belum tentu jadi
// uang sungguhan, dan cancelled jelas bukan.
const CONFIRMED_STATUSES: OrderStatus[] = [
  'payment_verified',
  'processing',
  'shipped',
  'completed',
]

export default function AdminCommissionPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [percentInput, setPercentInput] = useState('')
  const [currentRate, setCurrentRate] = useState<number>(DEFAULT_COMMISSION_RATE)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [reportLoading, setReportLoading] = useState(true)
  const [confirmedOrderCount, setConfirmedOrderCount] = useState(0)
  const [totalGmv, setTotalGmv] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadSettings() {
      try {
        const settings = await getPlatformSettings()
        if (!isMounted) return
        setCurrentRate(settings.commissionRate)
        setPercentInput((settings.commissionRate * 100).toString())
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError('Gagal memuat setting komisi. Coba muat ulang halaman.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    async function loadReport() {
      try {
        const orders = await getAllOrders()
        if (!isMounted) return
        const confirmed = orders.filter((o) => CONFIRMED_STATUSES.includes(o.status))
        setConfirmedOrderCount(confirmed.length)
        setTotalGmv(confirmed.reduce((sum, o) => sum + o.subtotal, 0))
        setTotalCommission(confirmed.reduce((sum, o) => sum + o.commissionAmount, 0))
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setReportLoading(false)
      }
    }

    loadSettings()
    loadReport()
    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const percent = Number(percentInput)
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      setError('Masukkan angka persen antara 0 sampai 100.')
      return
    }

    const rate = percent / 100
    setSaving(true)
    try {
      await updateCommissionRate(rate)
      setCurrentRate(rate)
      setSuccessMessage('Komisi platform berhasil diperbarui.')
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : 'Gagal menyimpan komisi. Coba lagi.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-gray-500">Memuat setting komisi...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Komisi Platform</h1>
      <p className="mb-6 text-sm text-gray-600">
        Komisi saat ini:{' '}
        <span className="font-semibold">{(currentRate * 100).toFixed(2)}%</span>.
        Perubahan hanya berlaku untuk order baru yang dibuat setelah disimpan —
        order yang sudah ada tidak terpengaruh.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <label
          htmlFor="commissionPercent"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Komisi baru (%)
        </label>
        <input
          id="commissionPercent"
          type="number"
          min={0}
          max={100}
          step="0.1"
          value={percentInput}
          onChange={(e) => setPercentInput(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {successMessage && (
          <p className="mb-4 text-sm text-green-600">{successMessage}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Komisi'}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Akumulasi Komisi
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          Dihitung dari order yang pembayarannya sudah terverifikasi (status
          diproses, dikirim, atau selesai) — order yang masih menunggu
          pembayaran atau dibatalkan tidak dihitung.
        </p>

        {reportLoading ? (
          <p className="text-sm text-gray-500">Memuat rekap...</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Jumlah Order</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {confirmedOrderCount}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Total Penjualan (GMV)</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                Rp{totalGmv.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <p className="text-xs text-blue-700">Total Komisi Terkumpul</p>
              <p className="mt-1 text-xl font-semibold text-blue-900">
                Rp{totalCommission.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
