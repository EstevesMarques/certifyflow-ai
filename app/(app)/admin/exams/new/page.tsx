'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ExamLevel } from '@/types'

export default function NewExamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    external_id: '',
    title: '',
    description: '',
    level: 'Associate' as ExamLevel,
    roles: '',
    products: '',
    is_beta: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        roles: form.roles.split(',').map(s => s.trim()).filter(Boolean),
        products: form.products.split(',').map(s => s.trim()).filter(Boolean),
        source: 'manual' as const,
      }),
    })
    if (res.ok) router.push('/admin/exams')
    else setLoading(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl">
      <Link href="/admin/exams" className="text-[14px] font-medium transition-colors mb-4 inline-block"
        style={{ color: 'var(--text-secondary)' }}>
        ← Voltar para Exames
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Novo Exame</h1>
      <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
        Adicione um exame manualmente ao catálogo.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-faint)' }}>Código do Exame</label>
          <input required value={form.external_id} onChange={e => setForm(f => ({ ...f, external_id: e.target.value }))}
            className="w-full glass-input text-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
            placeholder="Ex: AZ-104"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-faint)' }}>Título</label>
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full glass-input text-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
            placeholder="Ex: Microsoft Azure Administrator"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-faint)' }}>Descrição</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full glass-input text-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-faint)' }}>Nível</label>
          <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value as ExamLevel }))}
            className="w-full glass-input text-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <option value="Fundamentals">Fundamentals</option>
            <option value="Associate">Associate</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-faint)' }}>Roles (separados por vírgula)</label>
          <input value={form.roles} onChange={e => setForm(f => ({ ...f, roles: e.target.value }))}
            className="w-full glass-input text-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
            placeholder="Ex: Administrator, DevOps Engineer"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-faint)' }}>Produtos (separados por vírgula)</label>
          <input value={form.products} onChange={e => setForm(f => ({ ...f, products: e.target.value }))}
            className="w-full glass-input text-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
            placeholder="Ex: Azure, Microsoft 365"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_beta} onChange={e => setForm(f => ({ ...f, is_beta: e.target.checked }))}
            className="w-4 h-4 rounded accent-[var(--accent)]" />
          <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Exame Beta</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-pill flex-1">
            {loading ? 'Salvando...' : 'Criar Exame'}
          </button>
          <Link href="/admin/exams"
            className="flex-1 py-3 text-center text-[14px] font-semibold rounded-[var(--radius-pill)] transition-all glass-card"
            style={{ color: 'var(--text-primary)' }}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
