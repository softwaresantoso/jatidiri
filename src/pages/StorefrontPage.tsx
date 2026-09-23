import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBusinessBySlug } from '@/services/businesses'
import { getActiveCategories } from '@/services/categories'
import { getApprovedProductsByBusiness } from '@/services/products'
import { getApprovedServicesByBusiness } from '@/services/services'
import type { Business } from '@/types/business'
import type { Category } from '@/types/category'
import type { Product } from '@/types/product'
import type { Service } from '@/types/service'

export default function StorefrontPage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null | undefined>(undefined)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    getBusinessBySlug(slug)
      .then(async (biz) => {
        setBusiness(biz)
        if (!biz) return
        document.title = `${biz.businessName} — JATIDIRI`
        const [cats, prods, svcs] = await Promise.all([
          getActiveCategories(),
          getApprovedProductsByBusiness(biz.id),
          getApprovedServicesByBusiness(biz.id),
        ])
        setCategories(cats)
        setProducts(prods)
        setServices(svcs)
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

      <div className="mt-8">
        <h2 className="text-sm font-medium text-ink/60">Produk</h2>
        {products.length === 0 ? (
          <div className="mt-2 rounded-md border border-dashed border-black/20 p-4 text-center text-ink/40">
            Belum ada produk aktif dari toko ini.
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-md border border-black/10 p-3">
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-24 w-full rounded object-cover"
                  />
                )}
                <p className="mt-2 truncate text-sm font-medium">{p.name}</p>
                <p className="text-sm text-ink/60">Rp{p.price.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-sm font-medium text-ink/60">Jasa</h2>
        {services.length === 0 ? (
          <div className="mt-2 rounded-md border border-dashed border-black/20 p-4 text-center text-ink/40">
            Belum ada jasa aktif dari toko ini.
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {services.map((s) => (
              <div key={s.id} className="rounded-md border border-black/10 p-3">
                {s.images?.[0] && (
                  <img
                    src={s.images[0]}
                    alt={s.name}
                    className="h-24 w-full rounded object-cover"
                  />
                )}
                <p className="mt-2 truncate text-sm font-medium">{s.name}</p>
                <p className="text-sm text-ink/60">
                  {s.pricingType === 'quotation'
                    ? 'Hubungi untuk penawaran'
                    : `Mulai Rp${(s.startingPrice ?? 0).toLocaleString('id-ID')}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
