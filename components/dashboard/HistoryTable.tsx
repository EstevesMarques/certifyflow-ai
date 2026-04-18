import { ExamSession } from '@/types'
import { Badge } from '@/components/ui/badge'

export default function HistoryTable({ sessions }: { sessions: (ExamSession & { exam_id: string })[] }) {
  if (sessions.length === 0) {
    return (
      <p className="text-xs py-4 text-center" style={{ color: 'var(--text-faint)' }}>
        Nenhum simulado realizado ainda.
      </p>
    )
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          {['Exame', 'Data', 'Score', 'Questões', 'Status'].map((h) => (
            <th key={h} className="text-left pb-2 font-semibold uppercase tracking-wider text-[10px]"
              style={{ color: 'var(--text-faint)' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sessions.map((s) => (
          <tr key={s.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
            <td className="py-2" style={{ color: 'var(--text-secondary)' }}>{s.exam_id}</td>
            <td className="py-2" style={{ color: 'var(--text-secondary)' }}>
              {new Date(s.completed_at ?? s.started_at).toLocaleDateString('pt-BR')}
            </td>
            <td className="py-2 font-bold" style={{ color: 'var(--text-primary)' }}>{s.score}%</td>
            <td className="py-2" style={{ color: 'var(--text-secondary)' }}>{s.total_q}</td>
            <td className="py-2">
              {s.score >= 70 ? (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Aprovado
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                  Reprovado
                </Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
