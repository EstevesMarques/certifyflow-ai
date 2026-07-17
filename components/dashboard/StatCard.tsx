interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="glass-card" style={{ padding: '20px 22px' }}>
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-2"
        style={{ color: 'var(--text-faint)' }}>
        {label}
      </div>
      <div
        className="leading-none tracking-tight"
        style={{
          fontSize: '30px',
          fontWeight: '700',
          color: accent ? 'var(--accent-success)' : 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] mt-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{sub}</div>
      )}
    </div>
  )
}
