import { useEffect, useMemo, useState } from 'react'
import { getApprovedBusinesses } from '@/services/businesses'
import { getActiveCategories } from '@/services/categories'
import { BusinessCard } from '@/components/BusinessCard'
import type { Business } from '@/types/business'
import type { Category } from '@/types/category'

export default function ExplorePage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  useEffect(() => {
    document.title = 'Jelajahi — JATIDIRI'
    Promise.all([getApprovedBusinesses(), getActiveCategories()])
      .then(([biz, cats]) => {
        setBusinesses(biz)
        setCategories(cats)
      })
      .catch((err: unknown) => {
        console.error('Gagal memuat marketplace:', err)
        setError('Gagal memuat data. Cek Console browser (F12) untuk detail.')
      })
      .finally(() => setLoading(false))
  }, [])

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
    categories.forEach((c) => map.set(c.id, c.name))
    return map
  }, [categories])

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch = searchText.trim()
        ? b.businessName.toLowerCase().includes(searchText.trim().toLowerCase())
        : true
      const matchesCategory = categoryFilter
        ? b.primaryCategoryId === categoryFilter ||
          (b.additionalCategoryIds ?? []).includes(categoryFilter)
        : true
      return matchesSearch && matchesCategory
    })
  }, [businesses, searchText, categoryFilter])

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Jelajahi Marketplace</h1>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Cari nama usaha..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="input sm:max-w-xs"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input sm:max-w-xs"
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="mt-8 text-sm text-ink/60">Memuat...</p>}
      {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="mt-8 text-sm text-ink/60">
          {businesses.length === 0
            ? 'Belum ada usaha yang aktif di marketplace.'
            : 'Tidak ada usaha yang cocok dengan pencarian/filter ini.'}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((biz) => (
          <BusinessCard
            key={biz.id}
            business={biz}
            categoryName={categoryNameById.get(biz.primaryCategoryId)}
          />
        ))}
      </div>
    </section>
  )
}
