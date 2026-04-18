interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className="rounded-[10px] border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', padding: '16px 18px', boxShadow: 'var(--shadow)' }}
    >
      <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div
        className="leading-none"
        style={{ fontSize: '26px', fontWeight: '800', color: accent ? 'var(--accent)' : 'var(--text-primary)' }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>{sub}</div>
      )}
    </div>
  )
}
