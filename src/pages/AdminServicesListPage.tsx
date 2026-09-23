import { useEffect, useState } from 'react'
import { approveService, getServicesForReview, rejectService } from '@/services/services'
import type { Service } from '@/types/service'

export default function AdminServicesListPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const load = () => {
    getServicesForReview()
      .then(setServices)
      .catch((err: unknown) => {
        console.error('Gagal memuat jasa untuk review:', err)
        setError('Gagal memuat data. Cek Console browser (F12).')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleApprove = async (id: string) => {
    setProcessing(true)
    try {
      await approveService(id)
      load()
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectingId || !reason.trim()) return
    setProcessing(true)
    try {
      await rejectService(rejectingId, reason.trim())
      setRejectingId(null)
      setReason('')
      load()
    } finally {
      setProcessing(false)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Moderasi Jasa</h1>
      <p className="mt-1 text-sm text-ink/60">Menunggu review ({services.length})</p>

      {loading && <p className="mt-6 text-sm text-ink/60">Memuat...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {!loading && !error && services.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Tidak ada jasa yang menunggu review.</p>
      )}

      <div className="mt-6 space-y-3">
        {services.map((s) => (
          <div key={s.id} className="rounded-md border border-black/10 p-4">
            <div className="flex items-center gap-3">
              {s.images?.[0] && (
                <img src={s.images[0]} alt={s.name} className="h-16 w-16 rounded object-cover" />
              )}
              <div className="flex-1">
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-ink/60">
                  {s.pricingType === 'quotation'
                    ? 'Hubungi untuk penawaran'
                    : `Mulai Rp${(s.startingPrice ?? 0).toLocaleString('id-ID')}`}
                </p>
                <p className="mt-1 text-sm text-ink/70">{s.description}</p>
              </div>
            </div>

            {rejectingId === s.id ? (
              <div className="mt-3">
                <textarea
                  rows={2}
                  placeholder="Alasan penolakan (wajib)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setRejectingId(null)
                      setReason('')
                    }}
                    className="rounded-md border border-black/20 px-3 py-1 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!reason.trim() || processing}
                    className="rounded-md bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-60"
                  >
                    Konfirmasi Tolak
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setRejectingId(s.id)}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600"
                >
                  Tolak
                </button>
                <button
                  onClick={() => handleApprove(s.id)}
                  disabled={processing}
                  className="rounded-md bg-brand px-3 py-1 text-sm text-brand-fg disabled:opacity-60"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
