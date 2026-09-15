import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { registerSchema, type RegisterInput } from '@/schemas/auth'
import { signUpCustomer } from '@/services/auth'
import { getAuthErrorMessage } from '@/utils/authErrors'
import { ROUTES } from '@/constants/routes'

type AccountType = 'customer' | 'seller'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState<AccountType>('customer')

  if (accountType === 'seller') {
    return (
      <section className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">
          Daftar sebagai Pelaku Industri
        </h1>
        <p className="mt-2 text-ink/70">
          Wizard pendaftaran usaha (akun, identitas usaha, kategori, lokasi,
          rekening, legalitas) dibangun di Phase 5. Untuk sekarang, daftar
          dulu sebagai Pelanggan kalau Anda ingin coba fitur yang sudah ada.
        </p>
        <button
          type="button"
          onClick={() => setAccountType('customer')}
          className="mt-4 text-sm text-brand underline"
        >
          &larr; Kembali ke pilihan akun
        </button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Daftar</h1>

      <div className="mt-4 flex gap-2 text-sm">
        <button
          type="button"
          className="flex-1 rounded-md bg-brand px-3 py-2 font-medium text-brand-fg"
        >
          Pelanggan
        </button>
        <button
          type="button"
          onClick={() => setAccountType('seller')}
          className="flex-1 rounded-md border border-black/20 px-3 py-2"
        >
          Pelaku Industri
        </button>
      </div>

      <CustomerRegisterForm onSuccess={() => navigate(ROUTES.home)} />

      <p className="mt-4 text-sm text-ink/70">
        Sudah punya akun?{' '}
        <Link to={ROUTES.login} className="text-brand underline">
          Masuk
        </Link>
      </p>
    </section>
  )
}

function CustomerRegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setFormError(null)
    try {
      await signUpCustomer(data.email, data.password, data.displayName)
      onSuccess()
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      <div>
        <label htmlFor="displayName" className="text-sm font-medium">
          Nama Lengkap
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          className="mt-1 w-full rounded-md border border-black/20 px-3 py-2"
          {...register('displayName')}
        />
        {errors.displayName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-black/20 px-3 py-2"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-black/20 px-3 py-2"
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Konfirmasi Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-black/20 px-3 py-2"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-brand px-4 py-2 font-medium text-brand-fg disabled:opacity-60"
      >
        {isSubmitting ? 'Memproses...' : 'Daftar'}
      </button>
    </form>
  )
}
