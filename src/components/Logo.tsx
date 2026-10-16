   const logoUrl = 'https://res.cloudinary.com/zvi2yj8n/image/upload/f_auto,q_auto,w_192/jati
diri/logo'

interface LogoProps {
  // Ukuran ikon logo (Tailwind size classes, misal 'h-8 w-8', 'h-10 w-10')
  className?: string
  // Tampilkan teks "JATIDIRI" di samping ikon atau cuma ikonnya saja
  // (misal matikan di navbar mobile yang sempit)
  withText?: boolean
}

// Komponen logo reusable — dipakai di header Admin, Seller, dan Customer
// supaya satu sumber kebenaran untuk brand mark, bukan di-copy manual
// tiga kali. Ganti warna teks di bawah kalau brand color JATIDIRI beda.
export default function Logo({ className = 'h-9 w-9', withText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <img src={logoUrl} alt="JATIDIRI" className={`${className} object-contain`} />
      {withText && (
        <span className="text-lg font-bold leading-none text-emerald-700">
          JATIDIRI
        </span>
      )}
    </div>
  )
}
