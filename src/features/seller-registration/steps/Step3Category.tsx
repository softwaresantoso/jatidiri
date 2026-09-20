import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step3Schema, type Step3Input } from '@/schemas/businessApplication'
import { getActiveCategories } from '@/services/categories'
import type { Category } from '@/types/category'
import type { BusinessApplication } from '@/types/business'

interface Step3Props {
  data: Partial<BusinessApplication>
  onComplete: (data: Step3Input) => void
  onBack: () => void
}

export function Step3Category({ data, onComplete, onBack }: Step3Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    getActiveCategories()
      .then(setCategories)
      .catch((error: unknown) => {
        console.error('Gagal memuat kategori:', error)
        setLoadError(true)
      })
      .finally(() => setLoadingCategories(false))
  }, [])

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Step3Input>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      primaryCategoryId: data.primaryCategoryId ?? '',
      additionalCategoryIds: data.additionalCategoryIds ?? [],
    },
  })

  const onSubmit = handleSubmit((formData) => onComplete(formData))

  if (loadingCategories) {
    return <p className="text-sm text-ink/60">Memuat kategori...</p>
  }

  if (loadError) {
    return (
      <p className="text-sm text-red-600">
        Query kategori gagal dijalankan (kemungkinan besar composite index
        belum "Enabled" di Firestore Console → Indexes — biasanya perlu
        beberapa menit setelah deploy). Detail error ada di Console browser
        (F12).
      </p>
    )
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-red-600">
        Query berhasil, tapi collection <code>categories</code> di Firestore
        masih kosong (atau semua dokumennya <code>isActive: false</code>).
        Tambahkan minimal 10 kategori dulu — lihat daftar di README.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Kategori Industri</h2>

      <div>
        <label className="text-sm font-medium">Kategori Utama</label>
        <Controller
          control={control}
          name="primaryCategoryId"
          render={({ field }) => (
            <select className="input mt-1" {...field}>
              <option value="">Pilih kategori utama</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        />
        {errors.primaryCategoryId && (
          <p className="mt-1 text-sm text-red-600">
            {errors.primaryCategoryId.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">
          Kategori Tambahan (Opsional, boleh lebih dari satu)
        </label>
        <Controller
          control={control}
          name="additionalCategoryIds"
          render={({ field }) => (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.value?.includes(c.id) ?? false}
                    onChange={(e) => {
                      const current = field.value ?? []
                      field.onChange(
                        e.target.checked
                          ? [...current, c.id]
                          : current.filter((id) => id !== c.id),
                      )
                    }}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          )}
        />
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
