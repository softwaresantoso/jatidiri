import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  createDraftApplication,
  getMyOpenApplication,
  submitApplication,
  updateApplicationDraft,
} from '@/services/businessApplications'
import type { BusinessApplication } from '@/types/business'
import { ROUTES } from '@/constants/routes'
import { WizardProgress } from './WizardProgress'
import { Step1Account } from './steps/Step1Account'
import { Step2BusinessIdentity } from './steps/Step2BusinessIdentity'
import { Step3Category } from './steps/Step3Category'
import { Step4Address } from './steps/Step4Address'
import { Step5Offering } from './steps/Step5Offering'
import { Step6Banking } from './steps/Step6Banking'
import { Step7Legal } from './steps/Step7Legal'
import { Step8Agreement } from './steps/Step8Agreement'
import { Step9Review } from './steps/Step9Review'

type View =
  | 'loading'
  | 'wizard'
  | 'pending-review'
  | 'revision-required-intro'
  | 'rejected'
  | 'approved'
  | 'blocked-existing-account'
  | 'success'

export function SellerRegistrationWizard() {
  const { firebaseUser, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [view, setView] = useState<View>('loading')
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [data, setData] = useState<Partial<BusinessApplication>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Penjaga supaya pengecekan "resume aplikasi lama" cuma jalan SEKALI per
  // kunjungan halaman. Tanpa ini, efek ini re-fire tiap kali `firebaseUser`
  // berubah referensinya — termasuk PERSIS saat Step 1 baru selesai bikin
  // akun baru — dan baku-tabrak dengan state yang sedang dikelola wizard
  // sendiri (applicationId, currentStep, view), kadang menimpanya tanpa
  // peringatan. Ini akar penyebab dua bug yang dilaporkan sebelumnya.
  const hasCheckedResumeRef = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (hasCheckedResumeRef.current) return
    hasCheckedResumeRef.current = true

    if (!firebaseUser) {
      setView('wizard')
      setCurrentStep(1)
      return
    }

    getMyOpenApplication(firebaseUser.uid)
      .then((application) => {
        if (!application) {
          // Sudah login tapi belum pernah mulai pendaftaran usaha sama
          // sekali — lihat catatan di Step1Account soal batasan ini.
          setView('blocked-existing-account')
          return
        }

        setApplicationId(application.id)
        setData(application)

        if (application.status === 'draft' || application.status === 'revision_required') {
          setView('wizard')
          setCurrentStep(2) // akun (step 1) sudah pasti ada kalau application ada
        } else if (application.status === 'submitted' || application.status === 'under_review') {
          setView('pending-review')
        } else if (application.status === 'rejected') {
          setView('rejected')
        } else if (application.status === 'approved') {
          setView('approved')
        }
      })
      .catch((error: unknown) => {
        // Tanpa .catch() ini, error (mis. Firestore composite index belum
        // ada) bikin `view` nyangkut selamanya di 'loading' tanpa pesan apa
        // pun — persis kelas bug yang bikin "kelihatannya diam saja".
        console.error('Gagal memuat status pendaftaran:', error)
        setLoadError(
          'Gagal memuat status pendaftaran Anda. Coba refresh halaman ini.',
        )
      })
  }, [authLoading, firebaseUser])

  const persist = async (patch: Partial<BusinessApplication>) => {
    setData((prev) => ({ ...prev, ...patch }))
    if (applicationId) {
      await updateApplicationDraft(applicationId, patch)
    }
  }

  const goNext = () => setCurrentStep((s) => s + 1)
  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1))

  if (view === 'loading') {
    if (loadError) {
      return <p className="mx-auto max-w-md px-4 py-16 text-center text-red-600">{loadError}</p>
    }
    return <p className="mx-auto max-w-md px-4 py-16 text-center text-ink/60">Memuat...</p>
  }

  if (view === 'blocked-existing-account') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Daftar sebagai Pelaku Industri</h1>
        <p className="mt-2 text-ink/70">
          Anda sudah login sebagai <strong>{firebaseUser?.email}</strong>. Untuk saat ini,
          pendaftaran Pelaku Industri hanya mendukung akun baru — logout dulu kalau ingin
          daftar dengan email berbeda.
        </p>
      </div>
    )
  }

  if (view === 'pending-review') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Pendaftaran Sedang Diproses</h1>
        <p className="mt-2 text-ink/70">
          Data usaha <strong>{data.businessName}</strong> sedang menunggu verifikasi Admin
          JATIDIRI. Anda akan bisa mengelola toko setelah disetujui.
        </p>
      </div>
    )
  }

  if (view === 'rejected') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Pendaftaran Ditolak</h1>
        <p className="mt-2 text-ink/70">{data.rejectionReason ?? 'Tidak ada alasan tercatat.'}</p>
      </div>
    )
  }

  if (view === 'approved') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Usaha Anda Sudah Aktif</h1>
        <p className="mt-2 text-ink/70">Pendaftaran usaha Anda sudah disetujui.</p>
        <button
          onClick={() => navigate(ROUTES.sellerDashboard)}
          className="btn-primary mt-4 w-auto px-6"
        >
          Ke Dashboard
        </button>
      </div>
    )
  }

  if (view === 'success') {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Pendaftaran Berhasil Dikirim</h1>
        <p className="mt-2 text-ink/70">
          Data usaha Anda telah berhasil dikirim dan sedang menunggu verifikasi Admin
          JATIDIRI.
        </p>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/60">ID Pendaftaran</dt>
            <dd className="font-mono">{applicationId}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Status</dt>
            <dd>Menunggu verifikasi Admin</dd>
          </div>
        </dl>
        <ol className="mt-6 space-y-2 text-sm text-ink/70">
          <li>&#10003; Pendaftaran dikirim</li>
          <li>&#9679; Verifikasi Admin</li>
          <li>&#9675; Akun disetujui</li>
          <li>&#9675; Storefront aktif</li>
        </ol>
      </div>
    )
  }

  // view === 'wizard'
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Daftar sebagai Pelaku Industri</h1>
      <div className="mt-4">
        <WizardProgress currentStep={currentStep} />
      </div>

      <div className="mt-8">
        {currentStep === 1 && (
          <Step1Account
            onComplete={async ({ managerPosition, whatsapp, uid }) => {
              const id = await createDraftApplication(uid)
              setApplicationId(id)
              await updateApplicationDraft(id, { managerPosition, whatsapp })
              setData((prev) => ({ ...prev, managerPosition, whatsapp }))
              goNext()
            }}
          />
        )}
        {currentStep === 2 && (
          <Step2BusinessIdentity
            data={data}
            onBack={goBack}
            onComplete={async (stepData) => {
              await persist(stepData)
              goNext()
            }}
          />
        )}
        {currentStep === 3 && (
          <Step3Category
            data={data}
            onBack={goBack}
            onComplete={async (stepData) => {
              await persist(stepData)
              goNext()
            }}
          />
        )}
        {currentStep === 4 && (
          <Step4Address
            data={data}
            onBack={goBack}
            onComplete={async (stepData) => {
              await persist(stepData)
              goNext()
            }}
          />
        )}
        {currentStep === 5 && (
          <Step5Offering
            data={data}
            onBack={goBack}
            onComplete={async (stepData) => {
              await persist(stepData)
              goNext()
            }}
          />
        )}
        {currentStep === 6 && (
          <Step6Banking
            data={data}
            onBack={goBack}
            onComplete={async (stepData) => {
              await persist(stepData)
              goNext()
            }}
          />
        )}
        {currentStep === 7 && (
          <Step7Legal
            data={data}
            onBack={goBack}
            onComplete={async (stepData) => {
              await persist(stepData)
              goNext()
            }}
          />
        )}
        {currentStep === 8 && (
          <Step8Agreement
            onBack={goBack}
            onComplete={async () => {
              await persist({ agreementAccepted: true, agreedAt: new Date().toISOString() })
              goNext()
            }}
          />
        )}
        {currentStep === 9 && (
          <Step9Review
            data={data}
            submitting={submitting}
            submitError={submitError}
            onBack={goBack}
            onEditStep={setCurrentStep}
            onSubmit={async () => {
              if (!applicationId) {
                setSubmitError(
                  'ID pendaftaran belum ada — coba kembali ke Step 1 dan mulai ulang.',
                )
                return
              }
              setSubmitError(null)
              setSubmitting(true)
              try {
                await submitApplication(applicationId)
                setView('success')
              } catch (error) {
                console.error('Gagal submit pendaftaran:', error)
                setSubmitError(
                  'Gagal mengirim pendaftaran. Periksa koneksi internet Anda dan coba lagi. ' +
                    'Kalau terus gagal, buka Console browser (F12) dan kirim pesan errornya.',
                )
              } finally {
                setSubmitting(false)
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
