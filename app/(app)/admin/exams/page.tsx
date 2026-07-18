'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Exam } from '@/types'

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/catalog')
      .then(r => r.json())
      .then(data => { setExams(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 lg:p-8">
      {/* Title + Description */}
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Gerenciar Exames
        </h1>
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          Visualize, edite e adicione exames ao catálogo. Os exames sincronizados do Microsoft Learn aparecem aqui junto com os criados manualmente.
        </p>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          {loading ? 'Carregando...' : `${exams.length} exames`}
        </p>
        <Link
          href="/admin/exams/new"
          className="btn-pill text-sm no-underline inline-flex items-center gap-1.5"
        >
          + Novo Exame
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <div className="glass-card p-12 text-center">
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>Carregando exames...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Nenhum exame encontrado.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {exams.map(exam => (
            <div
              key={exam.id}
              className="flex items-center justify-between p-4 glass-card"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[14px] tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {exam.title}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {exam.id} · {exam.level}
                  </span>
                  {exam.source && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--bg-option)', color: 'var(--text-faint)' }}>
                      {exam.source}
                    </span>
                  )}
                  {exam.is_beta && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }}>
                      BETA
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/admin/exams/${exam.id}/edit`}
                className="text-[13px] font-medium px-4 py-2 rounded-[var(--radius-pill)] transition-all hover:bg-[var(--bg-option-hover)]"
                style={{ color: 'var(--text-primary)' }}
              >
                Editar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
