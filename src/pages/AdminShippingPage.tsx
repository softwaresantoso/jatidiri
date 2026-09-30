import { useEffect, useState } from 'react'
import {
  createShippingMethod,
  deleteShippingMethod,
  getAllShippingMethods,
  updateShippingMethod,
} from '@/services/shippingMethods'
import type { ShippingMethod, ShippingMethodInput } from '@/types/shipping'

const EMPTY_FORM: ShippingMethodInput = { name: '', description: '', cost: 0, isActive: true }

export default function AdminShippingPage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ShippingMethodInput>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    getAllShippingMethods()
      .then(setMethods)
      .catch((err: unknown) => {
        console.error('Gagal memuat metode pengiriman:', err)
        setError('Gagal memuat data. Cek Console browser (F12).')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const startEdit = (m: ShippingMethod) => {
    setEditingId(m.id)
    setForm({ name: m.name, description: m.description ?? '', cost: m.cost, isActive: m.isActive })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await updateShippingMethod(editingId, form)
      } else {
        await createShippingMethod(form)
      }
      cancelEdit()
      load()
    } catch (err) {
      console.error('Gagal menyimpan metode pengiriman:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (m: ShippingMethod) => {
    await updateShippingMethod(m.id, { isActive: !m.isActive })
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus metode pengiriman ini? Tidak bisa dibatalkan.')) return
    await deleteShippingMethod(id)
    load()
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Metode Pengiriman</h1>

      <div className="mt-6 rounded-md border border-black/10 p-4">
        <h2 className="font-medium">{editingId ? 'Edit Metode' : 'Tambah Metode Baru'}</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-sm font-medium">Nama</label>
            <input
              type="text"
              placeholder="Contoh: JNE Reguler"
              className="input mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Deskripsi (Opsional)</label>
            <input
              type="text"
              className="input mt-1"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Biaya (Rp)</label>
            <input
              type="number"
              className="input mt-1"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Aktif (tampil di checkout)
          </label>
          <div className="flex gap-2">
            {editingId && (
              <button onClick={cancelEdit} className="rounded-md border border-black/20 px-4 py-2 text-sm">
                Batal
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="btn-primary w-auto px-4"
            >
              {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="mt-6 text-sm text-ink/60">Memuat...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      <div className="mt-6 divide-y divide-black/10 rounded-md border border-black/10">
        {methods.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">
                {m.name}{' '}
                {!m.isActive && (
                  <span className="text-xs text-ink/40">(nonaktif)</span>
                )}
              </p>
              <p className="text-sm text-ink/60">
                Rp{m.cost.toLocaleString('id-ID')}
                {m.description ? ` · ${m.description}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <button onClick={() => handleToggleActive(m)} className="text-brand underline">
                {m.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
              <button onClick={() => startEdit(m)} className="text-brand underline">
                Edit
              </button>
              <button onClick={() => handleDelete(m.id)} className="text-red-600 underline">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
