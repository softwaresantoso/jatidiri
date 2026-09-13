# JATIDIRI

**Jatikuwung Digital Ragam Industri** — Marketplace Produk, Jasa & Solusi
Industri Lokal.

## Status proyek

Phase 1 — Project Setup selesai (struktur folder, routing dasar, Tailwind,
konfigurasi env). Firebase, autentikasi, dan fitur lain menyusul di fase
berikutnya sesuai rencana bertahap (lihat riwayat percakapan / dokumen
requirement proyek).

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS — theming lewat CSS custom properties di `src/index.css`
  (pola yang sama dipakai di proyek Laris Snack), jadi warna brand bisa
  diganti tanpa menyentuh komponen
- React Router (routing publik saja untuk saat ini)
- Firebase Auth / Firestore / Storage — Phase 2
- Netlify (deploy) dan Capacitor (pembungkus APK) — fase lanjutan

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env   # isi dengan kredensial project Firebase Anda
npm run dev
```

## Build

```bash
npm run build
```

Catatan: file ini dibuat di lingkungan tanpa akses jaringan, jadi
`npm install` dan `npm run build` belum pernah dijalankan/diverifikasi di
sini — jalankan dan cek dulu di mesin lokal Anda sebelum lanjut ke fase
berikutnya.

## Struktur folder

```text
src/
├── components/   # reusable UI components (baru berisi folder ui/ kosong)
├── layouts/      # MainLayout, dst.
├── pages/        # halaman per rute
├── routes/       # definisi React Router
├── hooks/
├── services/     # Firestore/Firebase query — diisi mulai Phase 2
├── lib/          # firebase.ts (stub, diisi Phase 2)
├── types/
├── schemas/      # Zod schema — Phase 5+
├── utils/
├── constants/    # routes.ts, dll.
├── contexts/
├── features/
└── assets/
```

## Konvensi

- Semua query Firestore lewat `services/`, jangan langsung di component.
- Jalankan `npm run`/`git` dari root proyek, bukan dari subfolder.
- Strict TypeScript — hindari `any` tanpa alasan jelas.

## Fase berikutnya

Phase 2 — Firebase (init project, Firestore, Storage, security rules
draf awal).
