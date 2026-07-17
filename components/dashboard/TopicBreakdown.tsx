import { TopicStat } from '@/types'

function barColor(pct: number) {
  if (pct < 60) return 'var(--accent-danger)'
  if (pct < 80) return '#f59e0b'
  return 'var(--accent-success)'
}

export default function TopicBreakdown({ stats, title }: { stats: TopicStat[]; title: string }) {
  return (
    <div className="glass-card" style={{ padding: '22px' }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--text-faint)' }}>
        {title}
      </div>
      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.topic_tag} className="flex items-center gap-3">
            <span className="text-[13px] w-36 flex-shrink-0 truncate font-medium" style={{ color: 'var(--text-secondary)' }}>
              {s.topic_tag}
            </span>
            <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--progress-bg)' }}>
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${s.pct}%`, background: barColor(s.pct) }}
              />
            </div>
            <span className="text-[12px] w-9 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
