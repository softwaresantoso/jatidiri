import { useAuth } from '@/contexts/AuthContext'

export default function AccountPage() {
  const { firebaseUser, appUser } = useAuth()

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Akun Saya</h1>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-ink/60">Nama</dt>
          <dd>{appUser?.displayName ?? '-'}</dd>
        </div>
        <div>
          <dt className="text-ink/60">Email</dt>
          <dd>{firebaseUser?.email}</dd>
        </div>
        <div>
          <dt className="text-ink/60">Peran</dt>
          <dd className="capitalize">{appUser?.role ?? '-'}</dd>
        </div>
      </dl>
      <p className="mt-6 text-sm text-ink/60">
        Edit profil, alamat, dan riwayat pesanan menyusul di fase Marketplace
        &amp; Order.
      </p>
    </section>
  )
}
