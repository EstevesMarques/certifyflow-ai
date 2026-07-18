'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Exam, ExamLevel } from '@/types'

export default function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    level: 'Associate' as ExamLevel,
    roles: '',
    products: '',
    is_beta: false,
  })

  useEffect(() => {
    fetch('/api/catalog')
      .then(r => r.json())
      .then(data => {
        const exam = (Array.isArray(data) ? data : []).find((e: Exam) => e.id === id)
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
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/admin/exams/${id}`, {
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
    <div className="p-6 lg:p-8 max-w-xl">
      <Link href="/admin/exams" className="text-[14px] font-medium transition-colors mb-4 inline-block"
        style={{ color: 'var(--text-secondary)' }}>
        ← Voltar para Exames
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
        Editar Exame: {id}
      </h1>
      <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
        Atualize as informações deste exame no catálogo.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-faint)' }}>Título</label>
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full glass-input text-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
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
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-faint)' }}>Produtos (separados por vírgula)</label>
          <input value={form.products} onChange={e => setForm(f => ({ ...f, products: e.target.value }))}
            className="w-full glass-input text-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_beta} onChange={e => setForm(f => ({ ...f, is_beta: e.target.checked }))}
            className="w-4 h-4 rounded accent-[var(--accent)]" />
          <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Exame Beta</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-pill flex-1">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
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
