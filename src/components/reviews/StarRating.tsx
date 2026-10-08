interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}

// Kalau onChange disediakan, jadi interaktif (dipakai di ReviewForm).
// Kalau tidak, cuma tampilan (dipakai buat nampilin rating yang sudah ada).
export default function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const interactive = !!onChange
  const starSize = size === 'sm' ? 'text-base' : 'text-2xl'

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={`${starSize} leading-none ${
            interactive ? 'cursor-pointer' : 'cursor-default'
          } ${n <= value ? 'text-yellow-400' : 'text-gray-300'}`}
          aria-label={`${n} bintang`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
