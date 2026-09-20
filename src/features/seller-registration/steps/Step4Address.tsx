import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step4Schema, type Step4Input } from '@/schemas/businessApplication'
import type { BusinessApplication } from '@/types/business'

interface Step4Props {
  data: Partial<BusinessApplication>
  onComplete: (data: Step4Input) => void
  onBack: () => void
}

export function Step4Address({ data, onComplete, onBack }: Step4Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step4Input>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      address: {
        province: data.address?.province ?? '',
        city: data.address?.city ?? '',
        district: data.address?.district ?? '',
        village: data.address?.village ?? '',
        fullAddress: data.address?.fullAddress ?? '',
        postalCode: data.address?.postalCode ?? '',
        mapsUrl: data.address?.mapsUrl ?? '',
      },
    },
  })

  const onSubmit = handleSubmit((formData) => onComplete(formData))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Alamat &amp; Lokasi</h2>

      <Field label="Provinsi" error={errors.address?.province?.message}>
        <input type="text" className="input" {...register('address.province')} />
      </Field>
      <Field label="Kabupaten/Kota" error={errors.address?.city?.message}>
        <input type="text" className="input" {...register('address.city')} />
      </Field>
      <Field label="Kecamatan" error={errors.address?.district?.message}>
        <input type="text" className="input" {...register('address.district')} />
      </Field>
      <Field label="Desa/Kelurahan" error={errors.address?.village?.message}>
        <input type="text" className="input" {...register('address.village')} />
      </Field>
      <Field label="Alamat Lengkap" error={errors.address?.fullAddress?.message}>
        <textarea rows={2} className="input" {...register('address.fullAddress')} />
      </Field>
      <Field label="Kode Pos (Opsional)">
        <input type="text" className="input" {...register('address.postalCode')} />
      </Field>
      <Field label="Link Google Maps (Opsional)">
        <input type="text" className="input" {...register('address.mapsUrl')} />
      </Field>

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
