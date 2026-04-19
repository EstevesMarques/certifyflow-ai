'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditExamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    level: 'Associate' as const,
    roles: '',
    products: '',
    is_beta: false,
  })

  useEffect(() => {
    fetch('/api/catalog')
      .then(r => r.json())
      .then(data => {
        const exam = (Array.isArray(data) ? data : []).find((e: any) => e.id === params.id)
        if (exam) {
          setForm({
            title: exam.title ?? '',
            description: exam.description ?? '',
            level: exam.level ?? 'Associate',
            roles: (exam.roles ?? []).join(', '),
            products: (exam.products ?? []).join(', '),
            is_beta: exam.is_beta ?? false,
          })
        }
      })
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/admin/exams/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        roles: form.roles.split(',').map(s => s.trim()).filter(Boolean),
        products: form.products.split(',').map(s => s.trim()).filter(Boolean),
      }),
    })
    if (res.ok) router.push('/admin/exams')
    else setLoading(false)
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-bold mb-6">Editar Exame: {params.id}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">title</label>
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-option)] border border-[var(--border)] rounded-[10px] text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">description</label>
          <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-option)] border border-[var(--border)] rounded-[10px] text-sm" rows={3} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">level</label>
          <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value as any }))}
            className="w-full px-3 py-2 bg-[var(--bg-option)] border border-[var(--border)] rounded-[10px] text-sm">
            <option>Fundamentals</option>
            <option>Associate</option>
            <option>Expert</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">roles (separados por vírgula)</label>
          <input value={form.roles} onChange={e => setForm(f => ({ ...f, roles: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-option)] border border-[var(--border)] rounded-[10px] text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">products (separados por vírgula)</label>
          <input value={form.products} onChange={e => setForm(f => ({ ...f, products: e.target.value }))}
            className="w-full px-3 py-2 bg-[var(--bg-option)] border border-[var(--border)] rounded-[10px] text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_beta" checked={form.is_beta}
            onChange={e => setForm(f => ({ ...f, is_beta: e.target.checked }))}
            className="w-4 h-4 accent-[var(--accent)]" />
          <label htmlFor="is_beta" className="text-sm">is_beta</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-[10px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-4 py-2 border border-[var(--border)] text-sm rounded-[10px] hover:bg-[var(--bg-option)] transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
