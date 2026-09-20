import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step7Schema, type Step7Input } from '@/schemas/businessApplication'
import { FileUploader } from '@/components/ui/FileUploader'
import { uploadDocument } from '@/lib/cloudinary'
import type { BusinessApplication } from '@/types/business'

interface Step7Props {
  data: Partial<BusinessApplication>
  onComplete: (data: Step7Input) => void
  onBack: () => void
}

const DOCUMENT_TYPES = ['NIB', 'NPWP', 'Izin usaha lainnya', 'Sertifikasi tertentu', 'Lainnya']

export function Step7Legal({ data, onComplete, onBack }: Step7Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Step7Input>({
    resolver: zodResolver(step7Schema),
    defaultValues: {
      legal: {
        status: data.legal?.status ?? 'tidak_ada',
        documentTypes: data.legal?.documentTypes ?? [],
        documentNumber: data.legal?.documentNumber ?? '',
        documentUrl: data.legal?.documentUrl ?? '',
      },
    },
  })

  const status = watch('legal.status')
  const documentUrl = watch('legal.documentUrl')

  const onSubmit = handleSubmit((formData) => onComplete(formData))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Legalitas Usaha</h2>
      <p className="text-sm text-ink/70">
        Dokumen legalitas hanya diperlukan untuk jenis usaha tertentu.
      </p>

      <div>
        <label className="text-sm font-medium">
          Apakah usaha Anda memiliki legalitas/perizinan usaha?
        </label>
        <select className="input mt-1" {...register('legal.status')}>
          <option value="ada">Ya</option>
          <option value="tidak_ada">Tidak</option>
          <option value="sedang_proses">Sedang dalam proses</option>
          <option value="tidak_diperlukan">Tidak diperlukan untuk jenis usaha saya</option>
        </select>
      </div>

      {status === 'ada' && (
        <>
          <div>
            <label className="text-sm font-medium">Jenis Legalitas</label>
            <Controller
              control={control}
              name="legal.documentTypes"
              render={({ field }) => (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {DOCUMENT_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.value?.includes(type) ?? false}
                        onChange={(e) => {
                          const current = field.value ?? []
                          field.onChange(
                            e.target.checked
                              ? [...current, type]
                              : current.filter((t) => t !== type),
                          )
                        }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Nomor Dokumen</label>
            <input type="text" className="input mt-1" {...register('legal.documentNumber')} />
          </div>

          <FileUploader
            label="Upload Dokumen"
            value={documentUrl}
            uploadFn={uploadDocument}
            accept="image/*,application/pdf"
            onUploaded={(url) => setValue('legal.documentUrl', url, { shouldValidate: true })}
            onRemove={() => setValue('legal.documentUrl', '', { shouldValidate: true })}
            hint="JPG/PNG/PDF"
          />
          {errors.legal?.documentUrl && (
            <p className="text-sm text-red-600">{errors.legal.documentUrl.message}</p>
          )}
        </>
      )}

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
