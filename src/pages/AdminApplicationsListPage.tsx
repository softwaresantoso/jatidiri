import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApplicationsForReview } from '@/services/businessApplications'
import type { BusinessApplication } from '@/types/business'
import { ROUTES } from '@/constants/routes'

export default function AdminApplicationsListPage() {
  const [applications, setApplications] = useState<BusinessApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getApplicationsForReview()
      .then(setApplications)
      .catch((err: unknown) => {
        console.error('Gagal memuat daftar pendaftaran:', err)
        setError('Gagal memuat daftar pendaftaran. Cek Console browser (F12) untuk detail.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Pendaftaran Pelaku Industri
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Menunggu verifikasi ({applications.length})
      </p>

      {loading && <p className="mt-6 text-sm text-ink/60">Memuat...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <p className="mt-6 text-sm text-ink/60">
          Tidak ada pendaftaran yang menunggu verifikasi saat ini.
        </p>
      )}

      <div className="mt-6 divide-y divide-black/10 rounded-md border border-black/10">
        {applications.map((app) => (
          <Link
            key={app.id}
            to={ROUTES.adminApplicationDetail(app.id)}
            className="flex items-center justify-between px-4 py-3 hover:bg-black/5"
          >
            <div>
              <p className="font-medium">{app.businessName || '(Tanpa nama usaha)'}</p>
              <p className="text-sm text-ink/60">{app.ownerName}</p>
            </div>
            <span className="rounded-full bg-black/10 px-3 py-1 text-xs">
              {app.status === 'submitted' ? 'Baru' : 'Sedang direview'}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
