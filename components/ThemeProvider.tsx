'use client'

import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem('theme') ?? 'light'
    document.documentElement.setAttribute('data-theme', stored)
  }, [])

  return <>{children}</>
}
