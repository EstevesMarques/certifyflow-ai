import { ExamSession } from '@/types'

export default function HistoryTable({ sessions }: { sessions: (ExamSession & { exam_id: string })[] }) {
  if (sessions.length === 0) {
    return (
      <p className="text-[13px] py-6 text-center font-medium" style={{ color: 'var(--text-faint)' }}>
        Nenhum simulado realizado ainda.
      </p>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr>
          {['Exame', 'Data', 'Score', 'Questões', 'Status'].map((h) => (
            <th key={h} className="text-left pb-3 font-semibold uppercase tracking-wider"
              style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sessions.map((s) => (
          <tr key={s.id} className="border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <td className="py-3 font-medium" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{s.exam_id}</td>
            <td className="py-3" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {new Date(s.completed_at ?? s.started_at).toLocaleDateString('pt-BR')}
            </td>
            <td className="py-3 font-bold" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{s.score}%</td>
            <td className="py-3" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.total_q}</td>
            <td className="py-3">
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  background: s.score >= 70 ? 'rgba(52,168,83,0.12)' : 'rgba(229,57,53,0.10)',
                  color: s.score >= 70 ? 'var(--accent-success)' : 'var(--accent-danger)',
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
