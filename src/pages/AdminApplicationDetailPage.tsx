import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  getApplicationById,
  rejectApplication,
  requestRevision,
} from '@/services/businessApplications'
import { approveApplication } from '@/services/businesses'
import { getActiveCategories } from '@/services/categories'
import type { BusinessApplication } from '@/types/business'
import type { Category } from '@/types/category'
import { ROUTES } from '@/constants/routes'

const LEGAL_LABELS: Record<string, string> = {
  ada: 'Ya',
  tidak_ada: 'Tidak',
  sedang_proses: 'Sedang dalam proses',
  tidak_diperlukan: 'Tidak diperlukan',
}

type ActionMode = null | 'reject' | 'revise'

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { appUser } = useAuth()
  const navigate = useNavigate()

  const [application, setApplication] = useState<BusinessApplication | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [actionMode, setActionMode] = useState<ActionMode>(null)
  const [noteText, setNoteText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([getApplicationById(id), getActiveCategories()])
      .then(([app, cats]) => {
        setApplication(app)
        setCategories(cats)
      })
      .catch((err: unknown) => {
        console.error('Gagal memuat detail pendaftaran:', err)
        setError('Gagal memuat detail pendaftaran. Cek Console browser (F12).')
      })
      .finally(() => setLoading(false))
  }, [id])

  const categoryName = (catId?: string) =>
    categories.find((c) => c.id === catId)?.name ?? catId ?? '-'

  const handleApprove = async () => {
    if (!application || !appUser) return
    setProcessing(true)
    setActionError(null)
    try {
      await approveApplication(application, appUser.uid)
      navigate(ROUTES.adminApplications)
    } catch (err) {
      console.error('Gagal approve:', err)
      setActionError('Gagal approve. Cek Console browser (F12) untuk detail.')
    } finally {
      setProcessing(false)
    }
  }

  const handleConfirmAction = async () => {
    if (!application || !appUser || !noteText.trim()) return
    setProcessing(true)
    setActionError(null)
    try {
      if (actionMode === 'reject') {
        await rejectApplication(application.id, appUser.uid, noteText.trim())
      } else if (actionMode === 'revise') {
        await requestRevision(application.id, appUser.uid, noteText.trim())
      }
      navigate(ROUTES.adminApplications)
    } catch (err) {
      console.error('Gagal memproses:', err)
      setActionError('Gagal memproses. Cek Console browser (F12) untuk detail.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <p className="mx-auto max-w-3xl px-4 py-12 text-ink/60">Memuat...</p>
  if (error) return <p className="mx-auto max-w-3xl px-4 py-12 text-red-600">{error}</p>
  if (!application) {
    return <p className="mx-auto max-w-3xl px-4 py-12 text-ink/60">Pendaftaran tidak ditemukan.</p>
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        {application.businessName || '(Tanpa nama usaha)'}
      </h1>
      <p className="text-sm text-ink/60">ID: {application.id}</p>

      <div className="mt-6 space-y-4">
        <Section title="Akun">
          <Row label="Posisi" value={application.managerPosition} />
          <Row label="WhatsApp" value={application.whatsapp} />
        </Section>

        <Section title="Identitas Usaha">
          <Row label="Nama usaha" value={application.businessName} />
          <Row label="Nama pemilik" value={application.ownerName} />
          <Row label="Tahun mulai" value={application.establishedYear?.toString()} />
          <Row label="Deskripsi" value={application.description} />
          <Row label="WhatsApp bisnis" value={application.businessPhone} />
          <Row label="Email bisnis" value={application.businessEmail} />
          {application.logoUrl && (
            <div className="pt-2">
              <p className="text-ink/60">Logo</p>
              <img src={application.logoUrl} alt="Logo" className="mt-1 h-20 w-20 rounded object-cover" />
            </div>
          )}
          {!!application.gallery?.length && (
            <div className="pt-2">
              <p className="text-ink/60">Foto usaha</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {application.gallery.map((url) => (
                  <img key={url} src={url} alt="" className="h-16 w-16 rounded object-cover" />
                ))}
              </div>
            </div>
          )}
        </Section>

        <Section title="Kategori">
          <Row label="Utama" value={categoryName(application.primaryCategoryId)} />
          <Row
            label="Tambahan"
            value={application.additionalCategoryIds?.map(categoryName).join(', ')}
          />
        </Section>

        <Section title="Lokasi">
          <Row label="Alamat" value={application.address?.fullAddress} />
          <Row
            label="Wilayah"
            value={[
              application.address?.village,
              application.address?.district,
              application.address?.city,
              application.address?.province,
            ]
              .filter(Boolean)
              .join(', ')}
          />
        </Section>

        <Section title="Penawaran">
          <Row label="Jenis" value={application.offeringTypes?.join(', ')} />
          <Row label="Deskripsi" value={application.offeringDescription} />
        </Section>

        <Section title="Rekening">
          <Row label="Bank" value={application.banking?.bankName} />
          <Row label="No. rekening" value={application.banking?.accountNumber} />
          <Row label="Nama pemilik rekening" value={application.banking?.accountHolderName} />
        </Section>

        <Section title="Legalitas">
          <Row label="Status" value={LEGAL_LABELS[application.legal?.status ?? 'tidak_ada']} />
          {application.legal?.documentUrl && (
            <a
              href={application.legal.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand underline"
            >
              Lihat dokumen
            </a>
          )}
        </Section>
      </div>

      {actionError && <p className="mt-4 text-sm text-red-600">{actionError}</p>}

      {actionMode ? (
        <div className="mt-6 rounded-md border border-black/10 p-4">
          <label className="text-sm font-medium">
            {actionMode === 'reject' ? 'Alasan penolakan (wajib)' : 'Catatan revisi (wajib)'}
          </label>
          <textarea
            rows={3}
            className="input mt-1"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setActionMode(null)
                setNoteText('')
              }}
              className="flex-1 rounded-md border border-black/20 px-4 py-2"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!noteText.trim() || processing}
              onClick={handleConfirmAction}
              className="btn-primary flex-1"
            >
              {processing ? 'Memproses...' : 'Konfirmasi'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setActionMode('reject')}
            className="flex-1 rounded-md border border-red-300 px-4 py-2 text-red-600"
          >
            Tolak
          </button>
          <button
            type="button"
            onClick={() => setActionMode('revise')}
            className="flex-1 rounded-md border border-black/20 px-4 py-2"
          >
            Minta Revisi
          </button>
          <button
            type="button"
            disabled={processing}
            onClick={handleApprove}
            className="btn-primary flex-1"
          >
            {processing ? 'Memproses...' : 'Approve'}
          </button>
        </div>
      )}
    </section>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-black/10 p-4">
      <h2 className="font-medium">{title}</h2>
      <dl className="mt-2 space-y-1 text-sm">{children}</dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink/60">{label}</dt>
      <dd className="text-right">{value || '-'}</dd>
    </div>
  )
}
