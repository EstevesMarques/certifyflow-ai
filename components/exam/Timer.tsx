'use client'

import { useEffect, useState } from 'react'

interface TimerProps {
  totalSeconds: number
  onExpire: () => void
}

function format(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Timer({ totalSeconds, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, onExpire])

  const urgent = remaining < 60
  return (
    <span
      className="text-xl font-bold tabular-nums transition-colors"
      style={{ color: urgent ? '#ef4444' : 'var(--accent)' }}
    >
      {format(remaining)}
    </span>
  )
}
