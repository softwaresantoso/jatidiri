import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { serviceSchema, type ServiceInput } from '@/schemas/service'
import { createService, getServiceById, updateService } from '@/services/services'
import { getMyBusiness } from '@/services/businesses'
import { getActiveCategories } from '@/services/categories'
import { FileUploader } from '@/components/ui/FileUploader'
import { uploadImage } from '@/lib/cloudinary'
import type { Category } from '@/types/category'
import { ROUTES } from '@/constants/routes'

export default function SellerServiceFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { firebaseUser } = useAuth()
  const navigate = useNavigate()

  const [businessId, setBusinessId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { images: [], pricingType: 'fixed', bookingRequired: false },
  })

  useEffect(() => {
    if (!firebaseUser) return
    Promise.all([
      getMyBusiness(firebaseUser.uid),
      getActiveCategories(),
      isEdit ? getServiceById(id) : Promise.resolve(null),
    ])
      .then(([biz, cats, service]) => {
        setBusinessId(biz?.id ?? null)
        setCategories(cats)
        if (service) {
          reset({
            name: service.name,
            description: service.description,
            categoryId: service.categoryId,
            images: service.images ?? [],
            pricingType: service.pricingType,
            startingPrice: service.startingPrice,
            duration: service.duration ?? '',
            serviceArea: service.serviceArea ?? '',
            bookingRequired: service.bookingRequired,
          })
        }
      })
      .catch((err: unknown) => {
        console.error('Gagal memuat form jasa:', err)
        setSubmitError('Gagal memuat data. Cek Console browser (F12).')
      })
      .finally(() => setLoading(false))
  }, [firebaseUser, id, isEdit, reset])

  const images = watch('images') ?? []
  const pricingType = watch('pricingType')

  const onSubmit = handleSubmit(async (data) => {
    if (!firebaseUser) return
    setSubmitError(null)
    try {
      if (isEdit && id) {
        await updateService(id, data)
      } else {
        if (!businessId) {
          setSubmitError('Anda belum punya toko aktif — daftar & tunggu approval dulu.')
          return
        }
        await createService(businessId, firebaseUser.uid, data)
      }
      navigate(ROUTES.sellerServices)
    } catch (err) {
      console.error('Gagal simpan jasa:', err)
      setSubmitError('Gagal menyimpan. Cek Console browser (F12) untuk detail.')
    }
  })

  if (loading) return <p className="mx-auto max-w-md px-4 py-16 text-ink/60">Memuat...</p>

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isEdit ? 'Edit Jasa' : 'Tambah Jasa'}
      </h1>
      {!isEdit && (
        <p className="mt-1 text-sm text-ink/60">
          Jasa baru tersimpan sebagai draft — klik "Ajukan" di halaman daftar jasa kalau sudah
          siap dikirim untuk direview Admin.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Nama Jasa</label>
          <input type="text" className="input mt-1" {...register('name')} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium">Deskripsi</label>
          <textarea rows={3} className="input mt-1" {...register('description')} />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Kategori</label>
          <select className="input mt-1" {...register('categoryId')}>
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Tipe Harga</label>
          <select className="input mt-1" {...register('pricingType')}>
            <option value="fixed">Harga tetap</option>
            <option value="starting_from">Mulai dari</option>
            <option value="quotation">Hubungi untuk penawaran</option>
          </select>
        </div>

        {pricingType !== 'quotation' && (
          <div>
            <label className="text-sm font-medium">
              {pricingType === 'fixed' ? 'Harga (Rp)' : 'Harga Mulai Dari (Rp)'}
            </label>
            <input
              type="number"
              className="input mt-1"
              {...register('startingPrice', { valueAsNumber: true })}
            />
            {errors.startingPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.startingPrice.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Durasi (Opsional)</label>
          <input
            type="text"
            placeholder="Contoh: 2 jam, 1 hari"
            className="input mt-1"
            {...register('duration')}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Area Layanan (Opsional)</label>
          <input
            type="text"
            placeholder="Contoh: Jakarta Selatan, Se-Jabodetabek"
            className="input mt-1"
            {...register('serviceArea')}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('bookingRequired')} />
          Perlu booking/janji terlebih dahulu
        </label>

        <div>
          <label className="text-sm font-medium">Foto Jasa</label>
          <div className="mt-2 space-y-2">
            {images.map((url, i) => (
              <FileUploader
                key={url + i}
                label={`Foto ${i + 1}`}
                value={url}
                uploadFn={uploadImage}
                onUploaded={() => {}}
                onRemove={() =>
                  setValue('images', images.filter((_, idx) => idx !== i), { shouldValidate: true })
                }
              />
            ))}
            <FileUploader
              label="Tambah foto"
              uploadFn={uploadImage}
              onUploaded={(url) => setValue('images', [...images, url], { shouldValidate: true })}
            />
          </div>
          {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>}
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </section>
  )
}
