'use client'

import { useState } from 'react'

function getStoredTheme(): { mounted: false; isDark: false } | { mounted: true; isDark: boolean } {
  if (typeof window === 'undefined') return { mounted: false, isDark: false }
  const stored = localStorage.getItem('theme')
  const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
  return { mounted: true, isDark }
}

export default function ThemeToggle() {
  const [state] = useState(getStoredTheme)
  const [isDark, setIsDark] = useState(state.isDark)
  const mounted = state.mounted

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  if (!mounted) return null

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--text-muted)]">
        {isDark ? '☾ Escuro' : '☀ Claro'}
      </span>
      <button
        onClick={toggleTheme}
        className="w-10 h-5.5 rounded-full bg-[var(--toggle-bg)] relative cursor-pointer border-none transition-all"
        aria-label="Alternar tema"
      >
        <span
          className="absolute top-0.75 left-0.75 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
          style={{
            transform: isDark ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}
