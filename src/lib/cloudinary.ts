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

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(
      errorBody?.error?.message ?? 'Gagal upload gambar ke Cloudinary',
    )
  }

  const data = await response.json()
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    width: data.width as number,
    height: data.height as number,
  }
}
