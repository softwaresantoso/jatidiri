import { useState, type ChangeEvent } from 'react'

interface FileUploaderProps {
  label: string
  value?: string
  onUploaded: (url: string) => void
  onRemove?: () => void
  uploadFn: (file: File) => Promise<{ url: string }>
  accept?: string
  hint?: string
}

// Reusable: preview, remove, replace, progress — dipakai untuk logo,
// galeri, dan dokumen legalitas (beda cuma uploadFn & accept).
export function FileUploader({
  label,
  value,
  onUploaded,
  onRemove,
  uploadFn,
  accept = 'image/*',
  hint,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const result = await uploadFn(file)
      onUploaded(result.url)
    } catch {
      setError('Gagal upload file. Coba lagi.')
    } finally {
      setUploading(false)
      e.target.value = '' // biar bisa upload file yang sama lagi kalau perlu
    }
  }

  return (
    <div>
      <label className="text-sm font-medium">{label}</label>

      {value ? (
        <div className="mt-2 flex items-center gap-3">
          {value.match(/\.(jpg|jpeg|png|webp)/i) ? (
            <img src={value} alt={label} className="h-16 w-16 rounded object-cover" />
          ) : (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-brand underline"
            >
              Lihat file terupload
            </a>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-600 underline"
          >
            Hapus
          </button>
        </div>
      ) : (
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={uploading}
          className="mt-1 block w-full text-sm"
        />
      )}

      {uploading && <p className="mt-1 text-sm text-ink/60">Mengupload...</p>}
      {hint && !uploading && !value && (
        <p className="mt-1 text-xs text-ink/50">{hint}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
