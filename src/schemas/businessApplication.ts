import { z } from 'zod'

// Satu schema per step — dipakai untuk validasi tiap "Lanjut", dan
// digabung (merge) untuk validasi final sebelum submit di Step 9.

export const step1Schema = z.object({
  managerPosition: z.enum(['pemilik', 'pengelola', 'admin_usaha'], {
    errorMap: () => ({ message: 'Pilih posisi/peran Anda' }),
  }),
  whatsapp: z.string().min(9, 'Nomor WhatsApp tidak valid'),
})
export type Step1Input = z.infer<typeof step1Schema>

// Dipakai kalau user BELUM punya akun — gabungan field akun (nama, email,
// password) + field step1Schema di atas (posisi, whatsapp).
export const step1WithAccountSchema = z
  .object({
    fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .merge(step1Schema)
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })
export type Step1WithAccountInput = z.infer<typeof step1WithAccountSchema>

export const step2Schema = z.object({
  businessName: z.string().min(2, 'Nama usaha wajib diisi'),
  ownerName: z.string().min(2, 'Nama pemilik wajib diisi'),
  establishedYear: z
    .number({ invalid_type_error: 'Tahun wajib diisi' })
    .min(1900)
    .max(new Date().getFullYear()),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  businessPhone: z.string().min(9, 'Nomor WhatsApp bisnis tidak valid'),
  businessEmail: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  logoUrl: z.string().min(1, 'Logo usaha wajib diupload'),
  gallery: z.array(z.string()).optional(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      tiktok: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
})
export type Step2Input = z.infer<typeof step2Schema>

export const step3Schema = z.object({
  primaryCategoryId: z.string().min(1, 'Pilih kategori utama'),
  additionalCategoryIds: z.array(z.string()).optional(),
})
export type Step3Input = z.infer<typeof step3Schema>

export const step4Schema = z.object({
  address: z.object({
    province: z.string().min(1, 'Provinsi wajib diisi'),
    city: z.string().min(1, 'Kabupaten/Kota wajib diisi'),
    district: z.string().min(1, 'Kecamatan wajib diisi'),
    village: z.string().min(1, 'Desa/Kelurahan wajib diisi'),
    fullAddress: z.string().min(5, 'Alamat lengkap wajib diisi'),
    postalCode: z.string().optional(),
    mapsUrl: z.string().optional(),
  }),
})
export type Step4Input = z.infer<typeof step4Schema>

export const step5Schema = z.object({
  offeringTypes: z.array(z.string()).min(1, 'Pilih minimal satu jenis penawaran'),
  offeringDescription: z.string().min(10, 'Deskripsi minimal 10 karakter'),
})
export type Step5Input = z.infer<typeof step5Schema>

export const step6Schema = z.object({
  banking: z.object({
    bankName: z.string().min(1, 'Pilih bank'),
    accountNumber: z.string().min(4, 'Nomor rekening tidak valid'),
    accountHolderName: z.string().min(2, 'Nama pemilik rekening wajib diisi'),
    holderDiffersFromOwner: z.boolean(),
  }),
})
export type Step6Input = z.infer<typeof step6Schema>

export const step7Schema = z
  .object({
    legal: z.object({
      status: z.enum(['ada', 'tidak_ada', 'sedang_proses', 'tidak_diperlukan']),
      documentTypes: z.array(z.string()).optional(),
      documentNumber: z.string().optional(),
      documentUrl: z.string().optional(),
    }),
  })
  .refine(
    (data) => data.legal.status !== 'ada' || !!data.legal.documentUrl,
    { message: 'Upload dokumen legalitas', path: ['legal', 'documentUrl'] },
  )
export type Step7Input = z.infer<typeof step7Schema>

export const step8Schema = z.object({
  agreementAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Semua persetujuan wajib dicentang' }),
  }),
})
export type Step8Input = z.infer<typeof step8Schema>
