import { useEffect, useState, type ReactNode } from 'react'
import { getActiveCategories } from '@/services/categories'
import type { Category } from '@/types/category'
import type { BusinessApplication } from '@/types/business'

interface Step9Props {
  data: Partial<BusinessApplication>
  onSubmit: () => void
  submitError?: string | null
  onBack: () => void
  onEditStep: (step: number) => void
  submitting: boolean
}

const LEGAL_LABELS: Record<string, string> = {
  ada: 'Ya',
  tidak_ada: 'Tidak',
  sedang_proses: 'Sedang dalam proses',
  tidak_diperlukan: 'Tidak diperlukan',
}

export function Step9Review({ data, onSubmit, onBack, onEditStep, submitting, submitError }: Step9Props) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    getActiveCategories().then(setCategories).catch(() => {})
  }, [])

  const categoryName = (id?: string) =>
    categories.find((c) => c.id === id)?.name ?? id ?? '-'

  const maskedAccountNumber = data.banking?.accountNumber
    ? '••••' + data.banking.accountNumber.slice(-4)
    : '-'

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Review &amp; Submit</h2>

      <ReviewSection title="Akun" onEdit={() => onEditStep(1)}>
        <Row label="Posisi" value={data.managerPosition} />
        <Row label="WhatsApp" value={data.whatsapp} />
      </ReviewSection>

      <ReviewSection title="Usaha" onEdit={() => onEditStep(2)}>
        <Row label="Nama usaha" value={data.businessName} />
        <Row label="Pemilik" value={data.ownerName} />
        <Row label="Deskripsi" value={data.description} />
      </ReviewSection>

      <ReviewSection title="Kategori" onEdit={() => onEditStep(3)}>
        <Row label="Kategori utama" value={categoryName(data.primaryCategoryId)} />
        <Row
          label="Kategori tambahan"
          value={
            data.additionalCategoryIds?.length
              ? data.additionalCategoryIds.map(categoryName).join(', ')
              : '-'
          }
        />
      </ReviewSection>

      <ReviewSection title="Lokasi" onEdit={() => onEditStep(4)}>
        <Row label="Alamat" value={data.address?.fullAddress} />
        <Row
          label="Wilayah"
          value={[data.address?.village, data.address?.district, data.address?.city, data.address?.province]
            .filter(Boolean)
            .join(', ')}
        />
      </ReviewSection>

      <ReviewSection title="Penawaran" onEdit={() => onEditStep(5)}>
        <Row label="Jenis" value={data.offeringTypes?.join(', ')} />
        <Row label="Deskripsi" value={data.offeringDescription} />
      </ReviewSection>

      <ReviewSection title="Rekening" onEdit={() => onEditStep(6)}>
        <Row label="Bank" value={data.banking?.bankName} />
        <Row label="No. rekening" value={maskedAccountNumber} />
      </ReviewSection>

      <ReviewSection title="Legalitas" onEdit={() => onEditStep(7)}>
        <Row label="Status" value={LEGAL_LABELS[data.legal?.status ?? 'tidak_ada']} />
      </ReviewSection>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-black/20 px-4 py-2">
          Kembali
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onSubmit}
          className="btn-primary flex-1"
        >
          {submitting ? 'Mengirim...' : 'Ajukan Pendaftaran'}
        </button>
      </div>
    </div>
  )
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-md border border-black/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <button type="button" onClick={onEdit} className="text-sm text-brand underline">
          Edit
        </button>
      </div>
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
