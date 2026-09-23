import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { productSchema, type ProductInput } from '@/schemas/product'
import { createProduct, getProductById, updateProduct } from '@/services/products'
import { getMyBusiness } from '@/services/businesses'
import { getActiveCategories } from '@/services/categories'
import { FileUploader } from '@/components/ui/FileUploader'
import { uploadImage } from '@/lib/cloudinary'
import type { Category } from '@/types/category'
import { ROUTES } from '@/constants/routes'

export default function SellerProductFormPage() {
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
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { images: [], productType: 'physical', unit: 'pcs' },
  })

  useEffect(() => {
    if (!firebaseUser) return
    Promise.all([
      getMyBusiness(firebaseUser.uid),
      getActiveCategories(),
      isEdit ? getProductById(id) : Promise.resolve(null),
    ])
      .then(([biz, cats, product]) => {
        setBusinessId(biz?.id ?? null)
        setCategories(cats)
        if (product) {
          reset({
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            images: product.images ?? [],
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            stock: product.stock,
            unit: product.unit,
            sku: product.sku ?? '',
            productType: product.productType,
          })
        }
      })
      .catch((err: unknown) => {
        console.error('Gagal memuat form produk:', err)
        setSubmitError('Gagal memuat data. Cek Console browser (F12).')
      })
      .finally(() => setLoading(false))
  }, [firebaseUser, id, isEdit, reset])

  const images = watch('images') ?? []

  const onSubmit = handleSubmit(async (data) => {
    if (!firebaseUser) return
    setSubmitError(null)
    try {
      if (isEdit && id) {
        await updateProduct(id, data)
      } else {
        if (!businessId) {
          setSubmitError('Anda belum punya toko aktif — daftar & tunggu approval dulu.')
          return
        }
        await createProduct(businessId, firebaseUser.uid, data)
      }
      navigate(ROUTES.sellerProducts)
    } catch (err) {
      console.error('Gagal simpan produk:', err)
      setSubmitError('Gagal menyimpan. Cek Console browser (F12) untuk detail.')
    }
  })

  if (loading) return <p className="mx-auto max-w-md px-4 py-16 text-ink/60">Memuat...</p>

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isEdit ? 'Edit Produk' : 'Tambah Produk'}
      </h1>
      {!isEdit && (
        <p className="mt-1 text-sm text-ink/60">
          Produk baru tersimpan sebagai draft — klik "Ajukan" di halaman daftar produk kalau
          sudah siap dikirim untuk direview Admin.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Nama Produk</label>
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
          <label className="text-sm font-medium">Tipe Produk</label>
          <select className="input mt-1" {...register('productType')}>
            <option value="physical">Fisik</option>
            <option value="digital">Digital</option>
            <option value="custom">Custom</option>
            <option value="preorder">Pre-order</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Harga (Rp)</label>
            <input
              type="number"
              className="input mt-1"
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Harga Coret (Opsional)</label>
            <input
              type="number"
              className="input mt-1"
              {...register('compareAtPrice', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Stok</label>
            <input
              type="number"
              className="input mt-1"
              {...register('stock', { valueAsNumber: true })}
            />
            {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Satuan</label>
            <input type="text" className="input mt-1" placeholder="pcs, kg, dll" {...register('unit')} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">SKU (Opsional)</label>
          <input type="text" className="input mt-1" {...register('sku')} />
        </div>

        <div>
          <label className="text-sm font-medium">Foto Produk</label>
          <div className="mt-2 space-y-2">
            {images.map((url, i) => (
              <FileUploader
                key={url + i}
                label={`Foto ${i + 1}`}
                value={url}
                uploadFn={uploadImage}
                onUploaded={() => {}}
                onRemove={() => setValue('images', images.filter((_, idx) => idx !== i), { shouldValidate: true })}
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
