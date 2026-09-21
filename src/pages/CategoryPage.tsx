import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getApprovedBusinesses } from '@/services/businesses'
import { getCategoryBySlug } from '@/services/categories'
import { BusinessCard } from '@/components/BusinessCard'
import type { Business } from '@/types/business'
import type { Category } from '@/types/category'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    getCategoryBySlug(slug)
      .then(async (cat) => {
        setCategory(cat)
        if (!cat) return
        document.title = `${cat.name} — JATIDIRI`
        const all = await getApprovedBusinesses()
        setBusinesses(
          all.filter(
            (b) =>
              b.primaryCategoryId === cat.id ||
              (b.additionalCategoryIds ?? []).includes(cat.id),
          ),
        )
      })
      .catch((err: unknown) => {
        console.error('Gagal memuat kategori:', err)
        setError('Gagal memuat data. Cek Console browser (F12) untuk detail.')
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-12 text-ink/60">Memuat...</p>
  if (error) return <p className="mx-auto max-w-6xl px-4 py-12 text-red-600">{error}</p>
  if (!category) {
    return <p className="mx-auto max-w-6xl px-4 py-12 text-ink/60">Kategori tidak ditemukan.</p>
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{category.name}</h1>
      <p className="mt-1 text-sm text-ink/60">{businesses.length} usaha</p>

      {businesses.length === 0 ? (
        <p className="mt-8 text-sm text-ink/60">
          Belum ada usaha di kategori ini.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} categoryName={category.name} />
          ))}
        </div>
      )}
    </section>
  )
}
