import Link from 'next/link'
import { fetchExams } from '@/lib/catalog'
import { Badge } from '@/components/ui/badge'

const levelColor: Record<string, string> = {
  Fundamentals: 'bg-blue-100 text-blue-700',
  Associate: 'bg-indigo-100 text-indigo-700',
  Expert: 'bg-purple-100 text-purple-700',
}

export default async function CatalogPage() {
  const exams = await fetchExams()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Catálogo de Exames</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        Escolha um exame para iniciar um simulado adaptativo.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {exams.map((exam) => (
          <Link key={exam.id} href={`/exam/${exam.id}`}>
            <div
              className="rounded-xl p-4 border h-full flex flex-col gap-2 hover:border-[#0078d4] transition-colors cursor-pointer"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {exam.id}
                </span>
                <Badge className={`text-[10px] shrink-0 ${levelColor[exam.level] ?? ''}`}>
                  {exam.level}
                </Badge>
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {exam.title}
              </p>
              {exam.description && (
                <p className="text-[11px] line-clamp-2 mt-auto" style={{ color: 'var(--text-muted)' }}>
                  {exam.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
