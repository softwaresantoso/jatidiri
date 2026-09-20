// Upload gambar langsung dari browser ke Cloudinary lewat "unsigned upload
// preset" — TIDAK butuh backend/secret key sama sekali (jadi cocok dipakai
// tanpa Firebase Cloud Functions yang butuh Blaze).
//
// Setup preset di Cloudinary Console:
//   Settings -> Upload -> Upload presets -> Add upload preset
//   - Signing Mode: Unsigned
//   - Folder: jatidiri (atau sesuai kebutuhan, mis. jatidiri/businesses)
//   - Allowed formats: jpg, png, webp
//   - Max file size: sesuaikan (mis. 2 MB) untuk menghemat kuota 25 credit/bulan

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const DOCUMENT_PRESET = import.meta.env.VITE_CLOUDINARY_DOCUMENT_PRESET

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

export async function uploadImage(file: File): Promise<UploadResult> {
  return uploadToCloudinary(file, UPLOAD_PRESET, 'image')
}

// Dokumen legalitas (KTP/NIB/dst) bisa jpg/png/PDF. Preset TERPISAH dari
// logo/galeri (folder & format allow-list beda) — lihat README bagian
// Cloudinary setup.
//
// CATATAN PRIVASI: upload preset "unsigned" selalu menghasilkan URL publik
// (Cloudinary tidak punya opsi "private" tanpa signed request, yang butuh
// backend/secret key — tidak tersedia karena kita tidak pakai Blaze/Cloud
// Functions). Mitigasi yang dipakai: (1) public_id dibuat random/tidak
// ditebak oleh Cloudinary secara default, (2) URL-nya hanya pernah muncul
// di dokumen Firestore yang dibatasi firestore.rules (cuma pemilik &
// admin yang bisa baca). Ini bukan private-by-design sungguhan — kalau
// URL bocor lewat cara lain, filenya tetap bisa diakses siapa saja.
export async function uploadDocument(file: File): Promise<UploadResult> {
  return uploadToCloudinary(file, DOCUMENT_PRESET, 'auto')
}

async function uploadToCloudinary(
  file: File,
  uploadPreset: string,
  resourceType: 'image' | 'auto',
): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: formData },
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(
      errorBody?.error?.message ?? 'Gagal upload file ke Cloudinary',
    )
  }

  const data = await response.json()
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    width: (data.width as number) ?? 0,
    height: (data.height as number) ?? 0,
  }
}
