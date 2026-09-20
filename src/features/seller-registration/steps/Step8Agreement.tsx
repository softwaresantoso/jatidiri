import { useState } from 'react'

interface Step8Props {
  onComplete: () => void
  onBack: () => void
}

const AGREEMENTS = [
  'Saya menyatakan bahwa data yang saya berikan benar dan dapat dipertanggungjawabkan.',
  'Saya bersedia mengikuti ketentuan JATIDIRI sebagai Pelaku Industri.',
  'Saya memahami bahwa produk dan usaha dapat melalui proses verifikasi dan moderasi.',
  'Saya memahami bahwa JATIDIRI mengenakan komisi dari transaksi sesuai ketentuan yang berlaku.',
  'Saya menyetujui penggunaan data usaha untuk kebutuhan operasional marketplace.',
]

export function Step8Agreement({ onComplete, onBack }: Step8Props) {
  const [checked, setChecked] = useState<boolean[]>(AGREEMENTS.map(() => false))
  const allChecked = checked.every(Boolean)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Persetujuan</h2>

      <div className="space-y-3">
        {AGREEMENTS.map((text, i) => (
          <label key={i} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={checked[i]}
              onChange={(e) => {
                const next = [...checked]
                next[i] = e.target.checked
                setChecked(next)
              }}
            />
            <span>{text}</span>
          </label>
        ))}
      </div>

      {!allChecked && (
        <p className="text-sm text-ink/50">
          Semua persetujuan di atas wajib dicentang untuk lanjut.
        </p>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded-md border border-black/20 px-4 py-2">
          Kembali
        </button>
        <button
          type="button"
          disabled={!allChecked}
          onClick={onComplete}
          className="btn-primary flex-1"
        >
          Lanjut
        </button>
      </div>
    </div>
  )
}
