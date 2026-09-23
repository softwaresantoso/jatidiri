import { z } from 'zod'

export const serviceSchema = z
  .object({
    name: z.string().min(2, 'Nama jasa wajib diisi'),
    description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
    categoryId: z.string().min(1, 'Pilih kategori'),
    images: z.array(z.string()).min(1, 'Upload minimal 1 foto'),
    pricingType: z.enum(['fixed', 'starting_from', 'quotation']),
    startingPrice: z.number().min(0).optional(),
    duration: z.string().optional(),
    serviceArea: z.string().optional(),
    bookingRequired: z.boolean(),
  })
  .refine((data) => data.pricingType === 'quotation' || data.startingPrice !== undefined, {
    message: 'Harga wajib diisi kecuali tipe harga "Hubungi untuk penawaran"',
    path: ['startingPrice'],
  })
export type ServiceInput = z.infer<typeof serviceSchema>
