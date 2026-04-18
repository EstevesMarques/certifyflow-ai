interface BarData { label: string; value: number }

export default function PerformanceChart({ data, title }: { data: BarData[]; title: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="rounded-[10px] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', padding: '18px', boxShadow: 'var(--shadow)' }}>
      <div className="text-[12px] font-bold uppercase tracking-wider mb-3.5"
        style={{ color: 'var(--text-secondary)' }}>
        {title}
      </div>
      <div className="flex items-end gap-2" style={{ height: '90px' }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-t transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: 'var(--accent)',
                opacity: 0.85,
                minHeight: '2px',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '1' }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '0.85' }}
            />
            <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
