import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import type { Business } from '@/types/business'

export function BusinessCard({
  business,
  categoryName,
}: {
  business: Business
  categoryName?: string
}) {
  return (
    <Link
      to={ROUTES.store(business.slug)}
      className="block rounded-md border border-black/10 p-4 hover:bg-black/5"
    >
      <div className="flex items-center gap-3">
        {business.logoUrl ? (
          <img
            src={business.logoUrl}
            alt={business.businessName}
            className="h-12 w-12 rounded object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded bg-black/10" />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium">{business.businessName}</p>
          <p className="truncate text-sm text-ink/60">
            {business.address?.city || business.address?.province || ''}
          </p>
        </div>
      </div>
      {categoryName && (
        <span className="mt-3 inline-block rounded-full bg-black/5 px-2 py-1 text-xs text-ink/60">
          {categoryName}
        </span>
      )}
    </Link>
  )
}
