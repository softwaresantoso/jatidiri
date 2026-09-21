// Dipakai untuk businesses sekarang, dan nanti products/services/packages
// juga (semua butuh slug URL-safe per brief section 49).
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
