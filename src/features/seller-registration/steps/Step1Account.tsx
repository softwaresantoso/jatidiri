import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  step1WithAccountSchema,
  type Step1Input,
  type Step1WithAccountInput,
} from '@/schemas/businessApplication'
import { signUpSeller } from '@/services/auth'
import { getAuthErrorMessage } from '@/utils/authErrors'
import { useAuth } from '@/contexts/AuthContext'

interface Step1Props {
  onComplete: (data: Step1Input & { email: string; uid: string }) => void
}

// Step 1 cuma mendukung akun BARU untuk sekarang (lihat catatan di
// README) — kalau user sudah login, kita tampilkan penjelasan singkat
// alih-alih memaksakan alur upgrade akun yang belum kita bangun.
export function Step1Account({ onComplete }: Step1Props) {
  const { firebaseUser, loading: authLoading } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Step1WithAccountInput>({
    resolver: zodResolver(step1WithAccountSchema),
  })

  if (authLoading) return null

  if (firebaseUser) {
    return (
      <div>
        <h2 className="text-lg font-semibold">Akun Pengelola</h2>
        <p className="mt-2 text-sm text-ink/70">
          Anda sudah login sebagai <strong>{firebaseUser.email}</strong>.
          Untuk saat ini, pendaftaran Pelaku Industri hanya mendukung akun
          baru (belum bisa upgrade akun Pelanggan yang sudah ada ke Pelaku
          Industri) — logout dulu kalau ingin daftar pakai email berbeda.
        </p>
      </div>
    )
  }

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null)
    try {
      const user = await signUpSeller(data.email, data.password, data.fullName)
      onComplete({
        managerPosition: data.managerPosition,
        whatsapp: data.whatsapp,
        email: data.email,
        uid: user.uid,
      })
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Akun Pengelola</h2>
      <p className="text-sm text-ink/70">
        Data ini akan digunakan untuk membuat profil usaha Anda di JATIDIRI.
      </p>

      <Field label="Nama Lengkap" error={errors.fullName?.message}>
        <input type="text" className="input" {...register('fullName')} />
      </Field>

      <Field label="Email" error={errors.email?.message}>
        <input type="email" className="input" {...register('email')} />
      </Field>

      <Field label="Nomor WhatsApp" error={errors.whatsapp?.message}>
        <input type="tel" className="input" {...register('whatsapp')} />
      </Field>

      <Field label="Password" error={errors.password?.message}>
        <input type="password" className="input" {...register('password')} />
      </Field>

      <Field label="Konfirmasi Password" error={errors.confirmPassword?.message}>
        <input
          type="password"
          className="input"
          {...register('confirmPassword')}
        />
      </Field>

      <Field label="Posisi/Peran" error={errors.managerPosition?.message}>
        <select className="input" {...register('managerPosition')}>
          <option value="">Pilih posisi</option>
          <option value="pemilik">Pemilik</option>
          <option value="pengelola">Pengelola</option>
          <option value="admin_usaha">Admin Usaha</option>
        </select>
      </Field>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Memproses...' : 'Lanjut'}
      </button>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
