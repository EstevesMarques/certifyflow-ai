'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = (localStorage.getItem('theme') ?? 'light') as 'light' | 'dark'
    setTheme(stored)
  }, [])

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
    >
      <span>{theme === 'light' ? '☀' : '☾'}</span>
      <span className="hidden sm:inline">{theme === 'light' ? 'Claro' : 'Escuro'}</span>
      <div
        className="relative w-10 h-5 rounded-full transition-colors"
        style={{ background: theme === 'dark' ? 'var(--accent)' : 'var(--progress-bg)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
          style={{ left: theme === 'dark' ? '22px' : '2px' }}
        />
      </div>
    </button>
  )
}
