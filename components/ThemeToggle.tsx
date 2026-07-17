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
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-7 w-[52px] items-center rounded-full transition-all cursor-pointer border-0"
        style={{
          background: isDark ? '#3D4048' : '#D1D5DB',
        }}
        aria-label="Alternar tema"
      >
        {/* Sun / Moon icon inside the knob */}
        <span
          className="absolute left-[3px] top-[3px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white shadow-sm transition-transform"
          style={{
            transform: isDark ? 'translateX(24px)' : 'translateX(0)',
          }}
        >
          {isDark ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3D4048" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </span>
      </button>
      <span className="text-[11px] font-medium text-[var(--text-faint)] uppercase tracking-wider select-none">
        {isDark ? 'Escuro' : 'Claro'}
      </span>
    </div>
  )
}
