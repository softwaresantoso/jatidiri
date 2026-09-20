import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step2Schema, type Step2Input } from '@/schemas/businessApplication'
import { FileUploader } from '@/components/ui/FileUploader'
import { uploadImage } from '@/lib/cloudinary'
import type { BusinessApplication } from '@/types/business'

interface Step2Props {
  data: Partial<BusinessApplication>
  onComplete: (data: Step2Input) => void
  onBack: () => void
}

export function Step2BusinessIdentity({ data, onComplete, onBack }: Step2Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Step2Input>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      businessName: data.businessName ?? '',
      ownerName: data.ownerName ?? '',
      establishedYear: data.establishedYear,
      description: data.description ?? '',
      businessPhone: data.businessPhone ?? '',
      businessEmail: data.businessEmail ?? '',
      logoUrl: data.logoUrl ?? '',
      gallery: data.gallery ?? [],
      socialLinks: data.socialLinks ?? {},
    },
  })

  const logoUrl = watch('logoUrl')
  const gallery = watch('gallery') ?? []

  const onSubmit = handleSubmit((formData) => onComplete(formData))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Identitas Usaha</h2>

      <Field label="Nama Usaha / Brand" error={errors.businessName?.message}>
        <input type="text" className="input" {...register('businessName')} />
      </Field>

      <Field label="Nama Pemilik" error={errors.ownerName?.message}>
        <input type="text" className="input" {...register('ownerName')} />
      </Field>

      <Field label="Tahun Mulai Usaha" error={errors.establishedYear?.message}>
        <input
          type="number"
          className="input"
          {...register('establishedYear', { valueAsNumber: true })}
        />
      </Field>

      <Field label="Deskripsi Usaha" error={errors.description?.message}>
        <textarea rows={3} className="input" {...register('description')} />
      </Field>

      <Field label="Nomor WhatsApp Bisnis" error={errors.businessPhone?.message}>
        <input type="tel" className="input" {...register('businessPhone')} />
      </Field>

      <Field label="Email Bisnis (Opsional)" error={errors.businessEmail?.message}>
        <input type="email" className="input" {...register('businessEmail')} />
      </Field>

      <FileUploader
        label="Logo Usaha"
        value={logoUrl}
        uploadFn={uploadImage}
        onUploaded={(url) => setValue('logoUrl', url, { shouldValidate: true })}
        onRemove={() => setValue('logoUrl', '', { shouldValidate: true })}
        hint="JPG/PNG/WebP, maks 2MB"
      />
      {errors.logoUrl && (
        <p className="text-sm text-red-600">{errors.logoUrl.message}</p>
      )}

      <div>
        <label className="text-sm font-medium">Foto Usaha / Workshop (Opsional)</label>
        <div className="mt-2 space-y-2">
          {gallery.map((url, i) => (
            <FileUploader
              key={url + i}
              label={`Foto ${i + 1}`}
              value={url}
              uploadFn={uploadImage}
              onUploaded={() => {}}
              onRemove={() =>
                setValue(
                  'gallery',
                  gallery.filter((_, idx) => idx !== i),
                )
              }
            />
          ))}
          <FileUploader
            label="Tambah foto"
            uploadFn={uploadImage}
            onUploaded={(url) => setValue('gallery', [...gallery, url])}
            hint="Bisa ditambah beberapa foto"
          />
        </div>
      </div>

      <Field label="Instagram (Opsional)">
        <input type="text" className="input" {...register('socialLinks.instagram')} />
      </Field>
      <Field label="Facebook (Opsional)">
        <input type="text" className="input" {...register('socialLinks.facebook')} />
      </Field>
      <Field label="TikTok (Opsional)">
        <input type="text" className="input" {...register('socialLinks.tiktok')} />
      </Field>
      <Field label="Website (Opsional)">
        <input type="text" className="input" {...register('socialLinks.website')} />
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
