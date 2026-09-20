const STEP_LABELS = [
  'Akun',
  'Usaha',
  'Kategori',
  'Lokasi',
  'Penawaran',
  'Rekening',
  'Legalitas',
  'Persetujuan',
  'Review',
]

export function WizardProgress({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex flex-wrap gap-x-1 gap-y-2 text-xs">
      {STEP_LABELS.map((label, index) => {
        const step = index + 1
        const isActive = step === currentStep
        const isDone = step < currentStep
        return (
          <li key={label} className="flex items-center">
            <span
              className={
                'rounded-full px-2 py-1 ' +
                (isActive
                  ? 'bg-brand text-brand-fg font-medium'
                  : isDone
                    ? 'bg-black/10 text-ink/70'
                    : 'text-ink/40')
              }
            >
              {step}. {label}
            </span>
            {step < STEP_LABELS.length && (
              <span className="mx-1 text-ink/30">&rarr;</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
