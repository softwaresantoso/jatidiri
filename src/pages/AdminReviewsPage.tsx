import { useEffect, useState } from 'react'
import { getAllReviews, setReviewStatus } from '@/services/reviews'
import StarRating from '@/components/reviews/StarRating'
import type { Review } from '@/types/review'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    getAllReviews()
      .then(setReviews)
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(review: Review) {
    setBusyId(review.id)
    const nextStatus = review.status === 'published' ? 'hidden' : 'published'
    try {
      await setReviewStatus(review.orderId, nextStatus)
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status: nextStatus } : r)),
      )
    } catch (err) {
      console.error(err)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-gray-500">Memuat ulasan...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Moderasi Ulasan</h1>

      {reviews.length === 0 ? (
        <p className="text-gray-500">Belum ada ulasan.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{review.customerName}</p>
                  <StarRating value={review.rating} size="sm" />
                  {review.comment && (
                    <p className="mt-1 text-sm text-gray-700">{review.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Order #{review.orderId.slice(0, 8)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      review.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {review.status === 'published' ? 'Tampil' : 'Disembunyikan'}
                  </span>
                  <button
                    onClick={() => handleToggle(review)}
                    disabled={busyId === review.id}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {review.status === 'published' ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
