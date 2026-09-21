import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBusinessBySlug } from '@/services/businesses'
import { getActiveCategories } from '@/services/categories'
import type { Business } from '@/types/business'
import type { Category } from '@/types/category'

export default function StorefrontPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null | undefined>(undefined)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    Promise.all([getBusinessBySlug(slug), getActiveCategories()])
      .then(([biz, cats]) => {
        setBusiness(biz)
        setCategories(cats)
        if (biz) document.title = `${biz.businessName} — JATIDIRI`
      })
      .catch((err: unknown) => {
        console.error('Gagal memuat toko:', err)
        setError('Gagal memuat data. Cek Console browser (F12) untuk detail.')
      })
  }, [slug])

  const categoryName = (id?: string) => categories.find((c) => c.id === id)?.name ?? '-'

  if (error) return <p className="mx-auto max-w-3xl px-4 py-12 text-red-600">{error}</p>
  if (business === undefined) {
    return <p className="mx-auto max-w-3xl px-4 py-12 text-ink/60">Memuat...</p>
  }
  if (business === null) {
    return <p className="mx-auto max-w-3xl px-4 py-12 text-ink/60">Toko tidak ditemukan.</p>
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center gap-4">
        {business.logoUrl ? (
          <img
            src={business.logoUrl}
            alt={business.businessName}
            className="h-20 w-20 rounded-lg object-cover"
          />
        ) : (
          <div className="h-20 w-20 rounded-lg bg-black/10" />
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{business.businessName}</h1>
          <p className="text-sm text-ink/60">
            {categoryName(business.primaryCategoryId)}
            {business.establishedYear ? ` · Sejak ${business.establishedYear}` : ''}
          </p>
        </div>
      </div>

      {business.description && (
        <p className="mt-6 text-ink/80">{business.description}</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-ink/60">Lokasi</h2>
          <p className="mt-1 text-sm">
            {[business.address?.city, business.address?.province].filter(Boolean).join(', ') || '-'}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-ink/60">Kontak</h2>
          <p className="mt-1 text-sm">{business.phone || '-'}</p>
        </div>
      </div>

      {!!business.gallery?.length && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-ink/60">Galeri</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {business.gallery.map((url) => (
              <img key={url} src={url} alt="" className="h-20 w-20 rounded object-cover" />
            ))}
          </div>
        </div>
      )}

      {(business.socialLinks?.instagram ||
        business.socialLinks?.facebook ||
        business.socialLinks?.tiktok ||
        business.socialLinks?.website) && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-ink/60">Sosial Media</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {business.socialLinks?.instagram && <span>IG: {business.socialLinks.instagram}</span>}
            {business.socialLinks?.facebook && <span>FB: {business.socialLinks.facebook}</span>}
            {business.socialLinks?.tiktok && <span>TikTok: {business.socialLinks.tiktok}</span>}
            {business.socialLinks?.website && <span>Web: {business.socialLinks.website}</span>}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-md border border-dashed border-black/20 p-4 text-center text-ink/40">
        Belum ada produk — menyusul Phase 9.
      </div>
    </section>
  )
}
