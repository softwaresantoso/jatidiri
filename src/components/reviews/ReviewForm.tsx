import { useState } from 'react'
import { createReview } from '@/services/reviews'
import { uploadImage } from '@/lib/cloudinary'
import { FileUploader } from '@/components/ui/FileUploader'
import StarRating from '@/components/reviews/StarRating'

interface ReviewFormProps {
  orderId: string
  businessId: string
  customerId: string
  customerName: string
  onSubmitted: () => void
}

export default function ReviewForm({
  orderId,
  businessId,
  customerId,
  customerName,
  onSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (rating < 1) {
      setError('Pilih rating bintang dulu.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createReview({
        orderId,
        businessId,
        customerId,
        customerName,
        rating,
        comment,
        photoUrl: photoUrl || undefined,
      })
      onSubmitted()
    } catch (err) {
      console.error('Gagal mengirim ulasan:', err)
      setError('Gagal mengirim ulasan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-6 rounded-md border border-black/10 p-4">
      <h2 className="font-medium">Beri Ulasan</h2>
      <p className="mt-1 text-sm text-ink/60">Bagaimana pengalaman belanja Anda di toko ini?</p>

      <div className="mt-3">
        <StarRating value={rating} onChange={setRating} />
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Ceritakan pengalaman Anda (opsional)"
        rows={3}
        className="mt-3 w-full rounded-md border border-black/10 p-2 text-sm"
      />

      <div className="mt-3">
        <FileUploader
          label="Foto (opsional)"
          value={photoUrl || undefined}
          uploadFn={uploadImage}
          accept="image/*"
          onUploaded={setPhotoUrl}
          onRemove={() => setPhotoUrl('')}
          hint="JPG/PNG"
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button onClick={handleSubmit} disabled={submitting} className="btn-primary mt-4">
        {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
      </button>
    </div>
  )
}
