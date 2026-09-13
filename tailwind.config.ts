import type { Config } from 'tailwindcss'

// Palet & token warna di sini adalah placeholder Phase 1.
// Warna final menyusul saat brand identity JATIDIRI difinalisasi (lihat catatan di src/index.css).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--color-brand)',
          fg: 'var(--color-brand-fg)',
        },
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
      },
    },
  },
  plugins: [],
} satisfies Config
