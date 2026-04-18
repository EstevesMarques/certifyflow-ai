import { TopicStat } from '@/types'

function barColor(pct: number) {
  if (pct < 60) return '#ef4444'
  if (pct < 80) return '#f59e0b'
  return '#10b981'
}

export default function TopicBreakdown({ stats, title }: { stats: TopicStat[]; title: string }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="text-[11px] font-bold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-secondary)' }}>
        {title}
      </div>
      <div className="space-y-2.5">
        {stats.map((s) => (
          <div key={s.topic_tag} className="flex items-center gap-2.5">
            <span className="text-xs w-36 flex-shrink-0 truncate" style={{ color: 'var(--text-secondary)' }}>
              {s.topic_tag}
            </span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--progress-bg)' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${s.pct}%`, background: barColor(s.pct) }}
              />
            </div>
            <span className="text-[11px] w-8 text-right" style={{ color: 'var(--text-muted)' }}>
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
