import { ExamSession } from '@/types'

export default function HistoryTable({ sessions }: { sessions: (ExamSession & { exam_id: string })[] }) {
  if (sessions.length === 0) {
    return (
      <p className="text-xs py-4 text-center" style={{ color: 'var(--text-faint)' }}>
        Nenhum simulado realizado ainda.
      </p>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr>
          {['Exame', 'Data', 'Score', 'Questões', 'Status'].map((h) => (
            <th key={h} className="text-left pb-2.5 font-bold uppercase tracking-wider"
              style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sessions.map((s) => (
          <tr key={s.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
            <td className="py-2" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.exam_id}</td>
            <td className="py-2" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {new Date(s.completed_at ?? s.started_at).toLocaleDateString('pt-BR')}
            </td>
            <td className="py-2 font-bold" style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{s.score}%</td>
            <td className="py-2" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.total_q}</td>
            <td className="py-2">
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: s.score >= 70 ? '#d1fae5' : '#fee2e2',
                  color: s.score >= 70 ? '#065f46' : '#991b1b',
                }}
              >
                {s.score >= 70 ? 'Aprovado' : 'Reprovado'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
