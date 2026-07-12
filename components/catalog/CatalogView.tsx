'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import { Exam } from '@/types'

type SortKey = 'code' | 'title-asc' | 'title-desc' | 'level'

const levelColor: Record<string, { bg: string; text: string }> = {
  Fundamentals: { bg: '#dbeafe', text: '#1e40af' },
  Associate:   { bg: '#e0e7ff', text: '#3730a3' },
  Expert:      { bg: '#f3e8ff', text: '#6b21a8' },
}

const levelOrder: Record<string, number> = {
  Fundamentals: 0,
  Associate: 1,
  Expert: 2,
}

function sortExams(exams: Exam[], key: SortKey): Exam[] {
  const sorted = [...exams]
  switch (key) {
    case 'code':
      return sorted.sort((a, b) => a.id.localeCompare(b.id))
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'level':
      return sorted.sort((a, b) => (levelOrder[a.level] ?? 99) - (levelOrder[b.level] ?? 99))
    default:
      return sorted
  }
}

export default function CatalogView({ exams }: { exams: Exam[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('code')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const list = q
      ? exams.filter(
          (e) =>
            e.id.toLowerCase().includes(q) ||
            e.title.toLowerCase().includes(q) ||
            (e.description ?? '').toLowerCase().includes(q),
        )
      : exams
    return sortExams(list, sort)
  }, [exams, search, sort])

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-5">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Catálogo de Exames
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Escolha um exame para iniciar um simulado adaptativo.
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Buscar por código, título ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-[10px] border text-sm outline-none transition-colors focus:border-[#0078d4]"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <div className="relative">
          <ArrowsUpDownIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="pl-9 pr-8 py-2.5 rounded-[10px] border text-sm outline-none cursor-pointer appearance-none transition-colors focus:border-[#0078d4]"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="code">Código</option>
            <option value="title-asc">Título A–Z</option>
            <option value="title-desc">Título Z–A</option>
            <option value="level">Nível</option>
          </select>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        {filtered.length} {filtered.length === 1 ? 'exame encontrado' : 'exames encontrados'}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          className="rounded-[10px] border p-10 text-center"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Nenhum exame encontrado para &quot;{search}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((exam) => (
            <Link key={exam.id} href={`/exam/${exam.id}`}>
              <div
                className="rounded-[10px] p-4 border h-full flex flex-col gap-2.5 hover:border-[#0078d4] transition-colors cursor-pointer group"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                {/* Top row: code + level badge */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="font-bold text-sm font-mono tracking-wide group-hover:text-[#0078d4] transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {exam.id}
                  </span>
                  <span
                    className="text-[10px] shrink-0 font-semibold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: levelColor[exam.level]?.bg ?? '#e5e7eb',
                      color: levelColor[exam.level]?.text ?? '#374151',
                    }}
                  >
                    {exam.level}
                  </span>
                </div>

                {/* Title */}
                <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  {exam.title}
                </p>

                {/* Description */}
                {exam.description && (
                  <p className="text-[11px] leading-relaxed line-clamp-2 mt-auto" style={{ color: 'var(--text-muted)' }}>
                    {exam.description}
                  </p>
                )}

                {/* Footer: roles */}
                {exam.roles && exam.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                    {exam.roles.slice(0, 3).map((role) => (
                      <span
                        key={role}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--bg-option)', color: 'var(--text-muted)' }}
                      >
                        {role}
                      </span>
                    ))}
                    {exam.roles.length > 3 && (
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        +{exam.roles.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
