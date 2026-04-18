interface BarData { label: string; value: number }

export default function PerformanceChart({ data, title }: { data: BarData[]; title: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="text-[11px] font-bold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-secondary)' }}>
        {title}
      </div>
      <div className="flex items-end gap-2 h-24">
        {data.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-t-sm transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: 'var(--accent)',
                opacity: 0.85,
                minHeight: '4px',
              }}
            />
            <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
