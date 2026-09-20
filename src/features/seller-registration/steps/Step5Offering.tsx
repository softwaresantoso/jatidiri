import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step5Schema, type Step5Input } from '@/schemas/businessApplication'
import type { BusinessApplication, OfferingType } from '@/types/business'

interface Step5Props {
  data: Partial<BusinessApplication>
  onComplete: (data: Step5Input) => void
  onBack: () => void
}

const OFFERING_OPTIONS: { value: OfferingType; label: string }[] = [
  { value: 'produk', label: 'Produk' },
  { value: 'jasa', label: 'Jasa' },
  { value: 'mesin', label: 'Mesin' },
  { value: 'peralatan', label: 'Peralatan' },
  { value: 'paket_bisnis', label: 'Paket Bisnis' },
  { value: 'produk_custom', label: 'Produk Custom' },
  { value: 'preorder', label: 'Pre-order' },
  { value: 'lainnya', label: 'Lainnya' },
]

export function Step5Offering({ data, onComplete, onBack }: Step5Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Step5Input>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      offeringTypes: data.offeringTypes ?? [],
      offeringDescription: data.offeringDescription ?? '',
    },
  })

  const onSubmit = handleSubmit((formData) => onComplete(formData))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Produk / Layanan</h2>
      <p className="text-sm text-ink/70">Apa yang ingin Anda tawarkan di JATIDIRI?</p>

      <Controller
        control={control}
        name="offeringTypes"
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-2">
            {OFFERING_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value?.includes(opt.value) ?? false}
                  onChange={(e) => {
                    const current = field.value ?? []
                    field.onChange(
                      e.target.checked
                        ? [...current, opt.value]
                        : current.filter((v) => v !== opt.value),
                    )
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        )}
      />
      {errors.offeringTypes && (
        <p className="text-sm text-red-600">{errors.offeringTypes.message}</p>
      )}

      <div>
        <label className="text-sm font-medium">Deskripsi Penawaran Utama</label>
        <textarea
          rows={3}
          placeholder="Contoh: Memproduksi kerajinan bambu dan menerima pesanan custom."
          className="input mt-1"
          {...register('offeringDescription')}
        />
        {errors.offeringDescription && (
          <p className="mt-1 text-sm text-red-600">
            {errors.offeringDescription.message}
          </p>
        )}
      </div>

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
