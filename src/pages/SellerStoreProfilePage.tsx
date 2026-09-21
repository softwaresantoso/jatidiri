import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { getMyBusiness, updateStoreProfile, type StoreProfilePatch } from '@/services/businesses'
import { FileUploader } from '@/components/ui/FileUploader'
import { uploadImage } from '@/lib/cloudinary'
import type { Business } from '@/types/business'

export default function SellerStoreProfilePage() {
  const { firebaseUser } = useAuth()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<StoreProfilePatch>()

  useEffect(() => {
    if (!firebaseUser) return
    getMyBusiness(firebaseUser.uid).then((biz) => {
      setBusiness(biz)
      if (biz) {
        reset({
          businessName: biz.businessName,
          description: biz.description,
          phone: biz.phone,
          email: biz.email ?? '',
          logoUrl: biz.logoUrl ?? '',
          gallery: biz.gallery ?? [],
          socialLinks: biz.socialLinks ?? {},
        })
      }
      setLoading(false)
    })
  }, [firebaseUser, reset])

  const logoUrl = watch('logoUrl')

  const onSubmit = handleSubmit(async (data) => {
    if (!business) return
    setSaveError(null)
    setSaved(false)
    try {
      await updateStoreProfile(business.id, data)
      setSaved(true)
    } catch (err) {
      console.error('Gagal simpan profil toko:', err)
      setSaveError('Gagal menyimpan. Cek Console browser (F12) untuk detail.')
    }
  })

  if (loading) return <p className="mx-auto max-w-md px-4 py-16 text-ink/60">Memuat...</p>
  if (!business) {
    return (
      <p className="mx-auto max-w-md px-4 py-16 text-ink/60">
        Belum ada toko aktif — daftar dan tunggu approval dulu.
      </p>
    )
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Profil Toko</h1>
      <p className="mt-1 text-sm text-ink/60">
        Field yang tidak ada di sini (kategori, alamat, rekening, legalitas) belum bisa diedit
        sendiri — hubungi Admin kalau perlu diubah.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Nama Usaha</label>
          <input type="text" className="input mt-1" {...register('businessName')} />
        </div>

        <div>
          <label className="text-sm font-medium">Deskripsi</label>
          <textarea rows={3} className="input mt-1" {...register('description')} />
        </div>

        <div>
          <label className="text-sm font-medium">Nomor WhatsApp Bisnis</label>
          <input type="tel" className="input mt-1" {...register('phone')} />
        </div>

        <div>
          <label className="text-sm font-medium">Email Bisnis</label>
          <input type="email" className="input mt-1" {...register('email')} />
        </div>

        <FileUploader
          label="Logo Usaha"
          value={logoUrl}
          uploadFn={uploadImage}
          onUploaded={(url) => setValue('logoUrl', url)}
          onRemove={() => setValue('logoUrl', '')}
        />

        <div>
          <label className="text-sm font-medium">Instagram</label>
          <input type="text" className="input mt-1" {...register('socialLinks.instagram')} />
        </div>
        <div>
          <label className="text-sm font-medium">Facebook</label>
          <input type="text" className="input mt-1" {...register('socialLinks.facebook')} />
        </div>
        <div>
          <label className="text-sm font-medium">TikTok</label>
          <input type="text" className="input mt-1" {...register('socialLinks.tiktok')} />
        </div>
        <div>
          <label className="text-sm font-medium">Website</label>
          <input type="text" className="input mt-1" {...register('socialLinks.website')} />
        </div>

        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        {saved && <p className="text-sm text-green-700">Tersimpan.</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </section>
  )
}
