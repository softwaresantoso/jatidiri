import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { archiveService, getMyServices, submitService } from '@/services/services'
import type { Service, ServiceStatus } from '@/types/service'
import { ROUTES } from '@/constants/routes'

const STATUS_LABELS: Record<ServiceStatus, string> = {
  draft: 'Draft',
  submitted: 'Menunggu review',
  approved: 'Aktif',
  rejected: 'Ditolak',
  archived: 'Diarsipkan',
}

export default function SellerServicesPage() {
  const { firebaseUser } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    if (!firebaseUser) return
    getMyServices(firebaseUser.uid)
      .then(setServices)
      .catch((err: unknown) => {
        console.error('Gagal memuat jasa:', err)
        setError('Gagal memuat jasa. Cek Console browser (F12).')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [firebaseUser])

  const handleSubmit = async (id: string) => {
    await submitService(id)
    load()
  }

  const handleArchive = async (id: string) => {
    if (!confirm('Arsipkan jasa ini? Tidak akan tampil di marketplace lagi.')) return
    await archiveService(id)
    load()
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Kelola Jasa</h1>
        <Link to={ROUTES.sellerServiceNew} className="btn-primary w-auto px-4">
          + Tambah Jasa
        </Link>
      </div>

      {loading && <p className="mt-6 text-sm text-ink/60">Memuat...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
      {!loading && !error && services.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">Belum ada jasa. Klik "+ Tambah Jasa".</p>
      )}

      <div className="mt-6 divide-y divide-black/10 rounded-md border border-black/10">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {s.images?.[0] && (
                <img src={s.images[0]} alt={s.name} className="h-12 w-12 rounded object-cover" />
              )}
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-ink/60">
                  {s.pricingType === 'quotation'
                    ? 'Hubungi untuk penawaran'
                    : `Mulai Rp${(s.startingPrice ?? 0).toLocaleString('id-ID')}`}
                </p>
                {s.status === 'rejected' && s.rejectionReason && (
                  <p className="text-xs text-red-600">Alasan: {s.rejectionReason}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black/10 px-3 py-1 text-xs">
                {STATUS_LABELS[s.status]}
              </span>
              <Link to={ROUTES.sellerServiceEdit(s.id)} className="text-sm text-brand underline">
                Edit
              </Link>
              {(s.status === 'draft' || s.status === 'rejected') && (
                <button onClick={() => handleSubmit(s.id)} className="text-sm text-brand underline">
                  Ajukan
                </button>
              )}
              {s.status !== 'archived' && (
                <button onClick={() => handleArchive(s.id)} className="text-sm text-red-600 underline">
                  Arsipkan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
