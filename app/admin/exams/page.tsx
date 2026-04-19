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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Gerenciar Exames</h1>
        <Link
          href="/admin/exams/new"
          className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-[10px] font-medium hover:opacity-90 transition-opacity"
        >
          + Novo Exame
        </Link>
      </div>
      {loading ? (
        <div className="text-[var(--text-muted)]">Carregando...</div>
      ) : exams.length === 0 ? (
        <div className="text-[var(--text-muted)]">Nenhum exame encontrado.</div>
      ) : (
        <div className="space-y-2">
          {exams.map(exam => (
            <div key={exam.id} className="flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[10px]">
              <div>
                <div className="font-semibold text-sm">{exam.title}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {exam.id} · {exam.level}
                  {exam.source && <span className="ml-2 text-[10px] uppercase tracking-wider">({exam.source})</span>}
                  {exam.is_beta && <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-600 px-1.5 py-0.5 rounded">BETA</span>}
                </div>
              </div>
              <Link
                href={`/admin/exams/${exam.id}/edit`}
                className="text-xs text-[var(--accent)] hover:underline"
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
