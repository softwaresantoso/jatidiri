import { useEffect, useState } from 'react'
import { getPublishedReviewsForBusiness, getAverageRating } from '@/services/reviews'
import StarRating from '@/components/reviews/StarRating'
import type { Review } from '@/types/review'

interface BusinessReviewsListProps {
  businessId: string
}

export default function BusinessReviewsList({ businessId }: BusinessReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getPublishedReviewsForBusiness(businessId)
      .then((data) => {
        if (isMounted) setReviews(data)
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [businessId])

  if (loading) return null

  const average = getAverageRating(reviews)

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold">
        Ulasan
        {average !== null && (
          <span className="font-normal text-ink/60">
            {' '}
            · {average.toFixed(1)} ★ ({reviews.length})
          </span>
        )}
      </h2>

      {reviews.length === 0 ? (
        <p className="mt-2 text-sm text-ink/60">Belum ada ulasan.</p>
      ) : (
        <div className="mt-3 space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-md border border-black/10 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{review.customerName}</p>
                <StarRating value={review.rating} size="sm" />
              </div>
              {review.comment && <p className="mt-2 text-sm text-ink/70">{review.comment}</p>}
              {review.photoUrl && (
                <img
                  src={review.photoUrl}
                  alt="Foto ulasan"
                  className="mt-2 h-24 w-24 rounded object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
