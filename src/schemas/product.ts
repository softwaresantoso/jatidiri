import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Nama produk wajib diisi'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  categoryId: z.string().min(1, 'Pilih kategori'),
  images: z.array(z.string()).min(1, 'Upload minimal 1 foto produk'),
  price: z.number({ invalid_type_error: 'Harga wajib diisi' }).min(0, 'Harga tidak valid'),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number({ invalid_type_error: 'Stok wajib diisi' }).min(0, 'Stok tidak valid'),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  sku: z.string().optional(),
  productType: z.enum(['physical', 'digital', 'custom', 'preorder']),
})
export type ProductInput = z.infer<typeof productSchema>
