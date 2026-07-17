'use client'

interface BarData { label: string; value: number }

export default function PerformanceChart({ data, title }: { data: BarData[]; title: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="glass-card" style={{ padding: '22px' }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--text-faint)' }}>
        {title}
      </div>
      <div className="flex items-end gap-2.5" style={{ height: '100px' }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: 'var(--accent)',
                opacity: 0.8,
                minHeight: '2px',
                borderRadius: '6px 6px 0 0',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.8' }}
            />
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
