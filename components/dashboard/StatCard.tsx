interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div
        className="text-2xl font-extrabold leading-none"
        style={{ color: accent ? 'var(--accent)' : 'var(--text-primary)' }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>{sub}</div>
      )}
    </div>
  )
}
