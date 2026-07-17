'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import { Exam } from '@/types'

type SortKey = 'code' | 'title-asc' | 'title-desc' | 'level'

const levelColor: Record<string, { bg: string; text: string }> = {
  Fundamentals: { bg: 'rgba(52,168,83,0.12)', text: 'var(--accent-success)' },
  Associate:   { bg: 'rgba(17,19,21,0.06)', text: 'var(--text-primary)' },
  Expert:      { bg: 'rgba(229,57,53,0.10)', text: 'var(--accent-danger)' },
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
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Catálogo de Exames
        </h1>
        <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          Escolha um exame para iniciar um simulado adaptativo.
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
            style={{ color: 'var(--text-faint)' }}
          />
          <input
            type="text"
            placeholder="Buscar por código, título ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 glass-input text-sm"
            style={{ borderRadius: 'var(--radius-sm)' }}
          />
        </div>
        <div className="relative">
          <ArrowsUpDownIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none"
            style={{ color: 'var(--text-faint)' }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="pl-9 pr-8 py-3 rounded-[var(--radius-sm)] border text-sm outline-none cursor-pointer appearance-none transition-all"
            style={{
              background: 'var(--bg-card)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
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
      <p className="text-[11px] font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
        {filtered.length} {filtered.length === 1 ? 'exame encontrado' : 'exames encontrados'}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Nenhum exame encontrado para &quot;{search}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((exam) => (
            <Link key={exam.id} href={`/exam/${exam.id}`} className="group">
              <div className="glass-card p-5 h-full flex flex-col gap-3 transition-all hover:shadow-lg hover:scale-[1.02]">
                {/* Top row: code + level badge */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="font-bold text-sm tracking-wide group-hover:text-[var(--text-primary)] transition-colors"
                    style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
                  >
                    {exam.id}
                  </span>
                  <span
                    className="text-[10px] shrink-0 font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: levelColor[exam.level]?.bg ?? 'var(--bg-option)',
                      color: levelColor[exam.level]?.text ?? 'var(--text-secondary)',
                    }}
                  >
                    {exam.level}
                  </span>
                </div>

                {/* Title */}
                <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  {exam.title}
                </p>

                {/* Description */}
                {exam.description && (
                  <p className="text-[12px] leading-relaxed line-clamp-2 mt-auto" style={{ color: 'var(--text-muted)' }}>
                    {exam.description}
                  </p>
                )}

                {/* Footer: roles */}
                {exam.roles && exam.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    {exam.roles.slice(0, 3).map((role) => (
                      <span
                        key={role}
                        className="text-[10px] px-2 py-1 rounded-full font-medium"
                        style={{ background: 'var(--bg-option)', color: 'var(--text-muted)' }}
                      >
                        {role}
                      </span>
                    ))}
                    {exam.roles.length > 3 && (
                      <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
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
