'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const theme = document.documentElement.getAttribute('data-theme')
    setIsDark(theme === 'dark')
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    const isDarkNow = html.getAttribute('data-theme') === 'dark'
    html.setAttribute('data-theme', isDarkNow ? 'light' : 'dark')
    setIsDark(!isDarkNow)
    localStorage.setItem('theme', isDarkNow ? 'light' : 'dark')
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
