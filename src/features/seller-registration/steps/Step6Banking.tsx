import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step6Schema, type Step6Input } from '@/schemas/businessApplication'
import type { BusinessApplication } from '@/types/business'

interface Step6Props {
  data: Partial<BusinessApplication>
  onComplete: (data: Step6Input) => void
  onBack: () => void
}

const COMMON_BANKS = [
  'BCA',
  'BRI',
  'BNI',
  'Mandiri',
  'BSI',
  'CIMB Niaga',
  'Bank Jateng',
  'Bank Jatim',
  'Lainnya',
]

export function Step6Banking({ data, onComplete, onBack }: Step6Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step6Input>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      banking: {
        bankName: data.banking?.bankName ?? '',
        accountNumber: data.banking?.accountNumber ?? '',
        accountHolderName: data.banking?.accountHolderName ?? '',
        holderDiffersFromOwner: data.banking?.holderDiffersFromOwner ?? false,
      },
    },
  })

  const onSubmit = handleSubmit((formData) => onComplete(formData))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Informasi Rekening</h2>
      <p className="text-sm text-ink/70">Digunakan untuk kebutuhan settlement.</p>

      <div>
        <label className="text-sm font-medium">Nama Bank</label>
        <select className="input mt-1" {...register('banking.bankName')}>
          <option value="">Pilih bank</option>
          {COMMON_BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
        {errors.banking?.bankName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.banking.bankName.message}
          </p>
        )}
      </div>

      <Field label="Nomor Rekening" error={errors.banking?.accountNumber?.message}>
        <input type="text" className="input" {...register('banking.accountNumber')} />
      </Field>

      <Field
        label="Nama Pemilik Rekening"
        error={errors.banking?.accountHolderName?.message}
      >
        <input type="text" className="input" {...register('banking.accountHolderName')} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('banking.holderDiffersFromOwner')} />
        Nama rekening berbeda dengan nama pemilik usaha
      </label>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-black/20 px-4 py-2">
          Kembali
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
          Lanjut
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
