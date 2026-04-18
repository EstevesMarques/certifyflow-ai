interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="px-5 py-2.5">
      <div className="flex justify-between text-[11px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
        <span>Questão {current} de {total}</span>
        <span>{pct}% concluído</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: 'var(--progress-bg)' }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}
