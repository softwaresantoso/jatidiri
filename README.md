# JATIDIRI

**Jatikuwung Digital Ragam Industri** — Marketplace Produk, Jasa & Solusi
Industri Lokal.

## Status proyek

Phase 1 — Project Setup: selesai.
Phase 2 — Firebase: infra dasar selesai (`lib/firebase.ts`, tipe
`Business`/`BusinessApplication`/`Category`, `firestore.rules`). Storage
diganti Cloudinary (lihat bagian di bawah) karena tidak upgrade ke plan
Blaze.
Phase 3 — Authentication: selesai. Signup & login Pelanggan terhubung ke
Firebase Auth + dokumen `users/{uid}`, header app reaktif terhadap status
login. Registrasi Pelaku Industri (wizard 9 langkah) masih placeholder,
menyusul di Phase 5.
Phase 4 — User roles & protected routes: selesai. `/account` (butuh
login), `/pelaku/dashboard` (role seller), `/admin/dashboard` (role admin)
sudah dibatasi lewat `RequireRole`, redirect ke `/login` (dengan
kembali-ke-halaman-semula) atau `/unauthorized` sesuai kasus. Isi
dashboard-nya sendiri masih placeholder kosong — itu Phase 6/7.
Phase 5 — Seller registration: selesai. Wizard 9 langkah di
`/pelaku/daftar` (akun → identitas usaha → kategori → lokasi → penawaran
→ rekening → legalitas → persetujuan → review), tersimpan bertahap ke
`businessApplications` di tiap "Lanjut" (bukan cuma di submit akhir), dan
bisa di-resume kalau browser ditutup di tengah jalan. Lihat "Simplifikasi
Phase 5" di bawah untuk apa yang sengaja belum dibangun persis seperti
brief asli.
Phase 6 — Admin seller verification: selesai. `/admin/pelaku` (antrian
pendaftaran menunggu review) dan `/admin/pelaku/:id` (detail lengkap +
Approve/Tolak/Minta Revisi). Approve membuat dokumen `businesses/{id}`
dari data aplikasi lewat batch write atomik (businesses + update
businessApplications sekaligus, gagal bareng kalau salah satu gagal).
Tolak & Minta Revisi wajib diisi alasan/catatan.
Phase 7 — Seller dashboard: selesai (versi realistis). `/pelaku/dashboard`
sekarang mengecek status pendaftaran sungguhan (draft/revision_required →
arahkan lanjutkan wizard, submitted/under_review → "menunggu verifikasi",
rejected → tampilkan alasan, approved → tampilkan profil toko + overview).
`/pelaku/toko` untuk edit profil toko (logo, deskripsi, kontak, sosial
media) yang menulis langsung ke `businesses/{id}`. Kartu "Kelola
Produk/Jasa/Paket/Pesanan" masih ditandai "Segera hadir" — itu jujur
menunggu Phase 9 & 10+, saya tidak buat data/UI palsu untuk itu di fase
ini.

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

## Firebase setup

Project ini SENGAJA tetap di plan **Spark (gratis)** — tidak pakai Firebase
Storage maupun Cloud Functions, karena keduanya sekarang wajib plan Blaze.
Upload gambar pakai Cloudinary (lihat bagian di bawah), dan kalkulasi
commission (fase checkout nanti) akan divalidasi di client + Firestore
Security Rules alih-alih Cloud Function.

1. Buat project di [Firebase Console](https://console.firebase.google.com),
   daftarkan Web App, salin config-nya ke `.env` (lihat `.env.example`).
2. Aktifkan Authentication (Email/Password) dan Firestore Database
   (production mode) lewat Console. **Jangan** aktifkan Storage — tidak
   dipakai dan akan memaksa upgrade ke Blaze.
3. Ganti `GANTI_DENGAN_PROJECT_ID_FIREBASE_ANDA` di `.firebaserc` dengan
   project ID Anda.
4. Deploy rules:
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules
   ```
5. Tambahkan minimal 10 dokumen di collection `categories` lewat Firestore
   Console (field: `name`, `slug`, `parentId: null`, `isActive: true`).

**Catatan:** `firestore.rules` di repo ini baru mencakup collection yang
sudah ada (`users`, `businesses`, `businessApplications`, `categories`) —
belum pernah dites lewat Firebase Emulator (sandbox pembuatan tidak punya
akses jaringan). Uji dengan `npx firebase-tools emulators:start` sebelum
deploy ke production kalau memungkinkan.

`storage.rules` tetap ada di repo untuk referensi masa depan (kalau nanti
project upgrade ke Blaze), tapi TIDAK di-deploy dan tidak dipakai sekarang.

## Cloudinary setup (upload gambar)

1. Daftar gratis di [cloudinary.com](https://cloudinary.com) — tidak perlu
   kartu kredit.
2. Console → Settings → Upload → Upload presets → Add upload preset:
   - Signing Mode: **Unsigned**
   - Folder: `jatidiri`
   - Allowed formats: `jpg, png, webp`
   - Max file size: sesuaikan (mis. 2 MB) supaya kuota 25 credit/bulan awet
3. Salin "Cloud name" (di Dashboard utama) dan nama upload preset ke `.env`:
   `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`.
4. Buat SATU preset lagi khusus dokumen legalitas (dipakai di Phase 5):
   Signing Mode = Unsigned, Folder = `jatidiri/documents`, Allowed formats
   = `jpg, png, pdf`. Salin nama presetnya ke `.env`:
   `VITE_CLOUDINARY_DOCUMENT_PRESET`.

**Soal privasi dokumen legalitas:** URL Cloudinary yang dihasilkan tetap
bersifat publik (bisa diakses siapa saja yang tahu URL-nya) karena preset
unsigned tidak punya mode "private" tanpa backend untuk sign request.
Mitigasinya: (1) Cloudinary otomatis bikin ID file acak/tidak mudah
ditebak, (2) URL-nya cuma pernah muncul di dokumen `businessApplications`
yang dibatasi `firestore.rules` (cuma pemilik & admin yang bisa baca).
Ini bukan private-by-design sungguhan — kalau URL-nya bocor lewat cara
lain (screenshot, share link, dst.), file tetap bisa diakses. Upgrade
path kalau ini jadi masalah nyata: Blaze + Cloud Function untuk signed
URL, atau Cloudflare Worker sebagai proxy.

**Risiko yang perlu disadari:** karena presetnya unsigned, siapa pun yang
tahu cloud name + preset name (keduanya kelihatan di network request
browser) bisa hit endpoint upload Cloudinary langsung, bukan cuma lewat
app kita. Preset yang dibatasi format & ukuran mengurangi risiko
penyalahgunaan, tapi tidak menghilangkannya sepenuhnya. Kalau ke depannya
ada indikasi kuota terkuras aneh, ganti nama preset atau pertimbangkan
pindah ke alur signed upload.

## Jadi admin pertama (bootstrap manual)

Tidak ada jalur signup untuk role admin (dan memang seharusnya begitu —
kalau ada, siapa saja bisa daftar jadi admin). Untuk akun admin pertama:

1. Daftar seperti biasa lewat `/register` sebagai Pelanggan.
2. Firebase Console → Firestore Database → collection `users` → buka
   dokumen dengan uid akun Anda tadi.
3. Ubah field `role` dari `customer` menjadi `admin` langsung di Console.

Ini aman dilakukan karena akses Firestore Console memakai izin Google
Cloud (IAM) Anda sendiri, bukan lewat `firestore.rules` — jadi tidak
membuka celah untuk user lain.

## Simplifikasi Phase 5 (dibanding brief asli)

Ini keputusan sadar untuk menjaga scope tetap terkelola — bukan bug:

- **Checkbox "alamat usaha sama dengan alamat pemilik" (brief Section 4)
  di-skip.** Brief tidak pernah mendefinisikan field "alamat pemilik" di
  tempat lain, jadi checkbox ini tidak ada yang bisa disalin.
- **Belum ada upgrade akun Pelanggan → Pelaku Industri.** Wizard cuma
  mendukung akun baru. Kalau user yang sudah login coba akses
  `/pelaku/daftar`, mereka diminta logout dulu. Alasannya: firestore.rules
  sengaja tidak membolehkan user self-upgrade role (mencegah privilege
  escalation) — upgrade akun butuh alur approval terpisah yang belum
  dibangun.
- **Dokumen legalitas cuma 1 file per pengajuan**, bukan multi-dokumen
  per jenis legalitas seperti tersirat di brief. Cukup untuk MVP; bisa
  diperluas jadi array kalau dibutuhkan.
- Role user langsung jadi `seller` sejak akun dibuat di Step 1 (bukan
  baru berubah dari `customer` setelah admin approve) — konsisten dengan
  `firestore.rules` yang sudah ada (create boleh role='seller', tapi
  TIDAK boleh role='admin'). Yang membedakan seller "aktif" vs "masih
  pending" adalah status `businessApplications`/`businesses`, bukan
  field role itu sendiri.

## Fase berikutnya

Phase 8 — Marketplace (halaman publik `/explore`, `/kategori/:slug`,
`/toko/:slug` yang sungguhan menampilkan data dari Firestore — sekarang
`/explore` masih placeholder statis). Search & filter dasar juga di fase
ini.
