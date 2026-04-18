import { TopicStat } from '@/types'

function barColor(pct: number) {
  if (pct < 60) return '#ef4444'
  if (pct < 80) return '#f59e0b'
  return '#10b981'
}

export default function TopicBreakdown({ stats, title }: { stats: TopicStat[]; title: string }) {
  return (
    <div className="rounded-[10px] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', padding: '18px', boxShadow: 'var(--shadow)' }}>
      <div className="text-[12px] font-bold uppercase tracking-wider mb-3.5"
        style={{ color: 'var(--text-secondary)' }}>
        {title}
      </div>
      <div className="space-y-2.5">
        {stats.map((s) => (
          <div key={s.topic_tag} className="flex items-center gap-2.5">
            <span className="text-[13px] w-32 flex-shrink-0 truncate" style={{ color: 'var(--text-secondary)' }}>
              {s.topic_tag}
            </span>
            <div className="flex-1" style={{ height: '8px', background: 'var(--progress-bg)', borderRadius: '99px' }}>
              <div
                className="transition-all"
                style={{ width: `${s.pct}%`, height: '8px', background: barColor(s.pct), borderRadius: '99px' }}
              />
            </div>
            <span className="text-[12px] w-8 text-right" style={{ color: 'var(--text-muted)' }}>
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
