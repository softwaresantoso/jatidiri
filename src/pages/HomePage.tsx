import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApprovedBusinesses } from '@/services/businesses'
import { BusinessCard } from '@/components/BusinessCard'
import { ROUTES } from '@/constants/routes'
import type { Business } from '@/types/business'

export default function HomePage() {
  const [featured, setFeatured] = useState<Business[]>([])

  useEffect(() => {
    getApprovedBusinesses()
      .then((biz) => setFeatured(biz.slice(0, 6)))
      .catch(() => setFeatured([]))
  }, [])

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight">
          Ragam industri lokal, pasar nasional.
        </h1>
        <p className="mt-4 max-w-md text-ink/70">
          Marketplace produk, jasa, dan solusi dari pelaku industri dan UMKM
          di seluruh Indonesia.
        </p>
        <Link to={ROUTES.explore} className="btn-primary mt-6 inline-block w-auto px-6">
          Jelajahi Marketplace
        </Link>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pelaku Industri Pilihan</h2>
            <Link to={ROUTES.explore} className="text-sm text-brand underline">
              Lihat semua
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((biz) => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
