interface OptionItemProps {
  letter: 'A' | 'B' | 'C' | 'D'
  text: string
  selected: boolean
  correct?: boolean
  wrong?: boolean
  disabled?: boolean
  onClick: () => void
}

export default function OptionItem({ letter, text, selected, correct, wrong, disabled, onClick }: OptionItemProps) {
  let borderColor = 'var(--border-subtle)'
  let bg = 'var(--bg-card)'
  let letterBg = 'var(--bg-option)'
  let letterColor = 'var(--text-secondary)'

  if (correct) {
    borderColor = 'var(--accent-success)'
    bg = 'rgba(52,168,83,0.08)'
    letterBg = 'var(--accent-success)'
    letterColor = '#fff'
  } else if (wrong) {
    borderColor = 'var(--accent-danger)'
    bg = 'rgba(229,57,53,0.08)'
    letterBg = 'var(--accent-danger)'
    letterColor = '#fff'
  } else if (selected) {
    borderColor = 'var(--text-primary)'
    bg = 'var(--bg-option-selected)'
    letterBg = 'var(--accent)'
    letterColor = '#fff'
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full flex items-start gap-3 rounded-[var(--radius-sm)] px-4 py-3.5 border-[1.5px] text-left transition-all hover:shadow-sm"
      style={{
        borderColor,
        background: bg,
        cursor: disabled ? 'default' : 'pointer',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-colors"
        style={{ background: letterBg, color: letterColor }}
      >
        {letter}
      </span>
      <span className="text-[14px] leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>{text}</span>
    </button>
  )
}
