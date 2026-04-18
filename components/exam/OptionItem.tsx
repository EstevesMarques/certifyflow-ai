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
  let borderColor = 'var(--border-option)'
  let bg = 'transparent'
  let letterBg = 'var(--bg-option)'
  let letterColor = 'var(--text-secondary)'

  if (correct) { borderColor = '#10b981'; bg = 'rgba(16,185,129,0.08)'; letterBg = '#10b981'; letterColor = '#fff' }
  else if (wrong) { borderColor = '#ef4444'; bg = 'rgba(239,68,68,0.08)'; letterBg = '#ef4444'; letterColor = '#fff' }
  else if (selected) { borderColor = 'var(--accent)'; bg = 'var(--bg-option-selected)'; letterBg = 'var(--accent)'; letterColor = '#fff' }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full flex items-start gap-3 rounded-lg px-3.5 py-3 border-[1.5px] text-left transition-all"
      style={{ borderColor, background: bg, cursor: disabled ? 'default' : 'pointer' }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-colors"
        style={{ background: letterBg, color: letterColor }}
      >
        {letter}
      </span>
      <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</span>
    </button>
  )
}
