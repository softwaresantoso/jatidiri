import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getMyOpenApplication } from '@/services/businessApplications'
import { getBusinessById } from '@/services/businesses'
import { getMyProducts } from '@/services/products'
import { getMyServices } from '@/services/services'
import type { BusinessApplication, Business } from '@/types/business'
import { ROUTES } from '@/constants/routes'

type ViewState = 'loading' | 'no-application' | 'pending' | 'revision' | 'rejected' | 'active'

export default function SellerDashboardPage() {
  const { firebaseUser } = useAuth()
  const [view, setView] = useState<ViewState>('loading')
  const [application, setApplication] = useState<BusinessApplication | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [productCount, setProductCount] = useState(0)
  const [serviceCount, setServiceCount] = useState(0)

  useEffect(() => {
    if (!firebaseUser) return
    getMyOpenApplication(firebaseUser.uid).then(async (app) => {
      setApplication(app)
      if (!app) {
        setView('no-application')
        return
      }
      if (app.status === 'draft' || app.status === 'revision_required') {
        setView('revision')
      } else if (app.status === 'submitted' || app.status === 'under_review') {
        setView('pending')
      } else if (app.status === 'rejected') {
        setView('rejected')
      } else if (app.status === 'approved' && app.businessId) {
        const [biz, products, services] = await Promise.all([
          getBusinessById(app.businessId),
          getMyProducts(firebaseUser.uid),
          getMyServices(firebaseUser.uid),
        ])
        setBusiness(biz)
        setProductCount(products.filter((p) => p.status !== 'archived').length)
        setServiceCount(services.filter((s) => s.status !== 'archived').length)
        setView('active')
      }
    })
  }, [firebaseUser])

  if (view === 'loading') {
    return <p className="mx-auto max-w-4xl px-4 py-16 text-ink/60">Memuat...</p>
  }

  if (view === 'no-application') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard Pelaku Industri</h1>
        <p className="mt-2 text-ink/70">Anda belum punya pendaftaran usaha.</p>
        <Link to={ROUTES.sellerRegister} className="btn-primary mt-4 inline-block w-auto px-6">
          Daftar Usaha
        </Link>
      </div>
    )
  }

  if (view === 'revision') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Lengkapi Pendaftaran</h1>
        {application?.revisionNote && (
          <p className="mt-2 rounded-md bg-black/5 p-3 text-sm">
            Catatan dari Admin: {application.revisionNote}
          </p>
        )}
        <Link to={ROUTES.sellerRegister} className="btn-primary mt-4 inline-block w-auto px-6">
          Lanjutkan Pendaftaran
        </Link>
      </div>
    )
  }

  if (view === 'pending') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Menunggu Verifikasi</h1>
        <p className="mt-2 text-ink/70">
          Pendaftaran usaha <strong>{application?.businessName}</strong> sedang direview Admin
          JATIDIRI. Anda akan bisa mengelola toko setelah disetujui.
        </p>
      </div>
    )
  }

  if (view === 'rejected') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Pendaftaran Ditolak</h1>
        <p className="mt-2 text-ink/70">
          {application?.rejectionReason ?? 'Tidak ada alasan tercatat.'}
        </p>
      </div>
    )
  }

  // view === 'active'
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center gap-4">
        {business?.logoUrl && (
          <img src={business.logoUrl} alt={business.businessName} className="h-16 w-16 rounded object-cover" />
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{business?.businessName}</h1>
          <p className="text-sm text-ink/60">Toko aktif</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Produk" value={String(productCount)} note="" />
        <StatCard label="Order Pending" value="0" note="Phase 10+" />
        <StatCard label="Estimasi Pendapatan" value="Rp0" note="Phase 10+" />
        <StatCard label="Rating Toko" value="-" note="Phase 16" />
      </div>
      <p className="mt-2 text-xs text-ink/50">
        Total Produk sudah angka sungguhan. Sisanya masih placeholder — menunggu fitur order
        dibangun.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          to={ROUTES.sellerStore}
          className="rounded-md border border-black/10 p-4 hover:bg-black/5"
        >
          <p className="font-medium">Profil Toko</p>
          <p className="text-sm text-ink/60">Edit logo, deskripsi, kontak, sosial media</p>
        </Link>
        <Link
          to={ROUTES.sellerProducts}
          className="rounded-md border border-black/10 p-4 hover:bg-black/5"
        >
          <p className="font-medium">Kelola Produk</p>
          <p className="text-sm text-ink/60">{productCount} produk</p>
        </Link>
        <Link
          to={ROUTES.sellerServices}
          className="rounded-md border border-black/10 p-4 hover:bg-black/5"
        >
          <p className="font-medium">Kelola Jasa</p>
          <p className="text-sm text-ink/60">{serviceCount} jasa</p>
        </Link>
        <ComingSoonCard title="Kelola Pesanan" note="Phase 10+" />
      </div>
    </div>
  )
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-md border border-black/10 p-4">
      <p className="text-xs text-ink/50">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className="text-xs text-ink/40">{note}</p>
    </div>
  )
}

function ComingSoonCard({ title, note }: { title: string; note: string }) {
  return (
    <div className="rounded-md border border-dashed border-black/20 p-4 text-ink/40">
      <p className="font-medium">{title}</p>
      <p className="text-sm">Segera hadir — {note}</p>
    </div>
  )
}
