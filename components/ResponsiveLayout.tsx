'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ThemeToggle from '@/components/ThemeToggle'
import { Bars3Icon } from '@heroicons/react/24/outline'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/catalog': 'Catálogo de Exames',
  '/simulado': 'Iniciar Simulado',
  '/progress': 'Meu Progresso',
  '/settings': 'Configurações',
}

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const title = pageTitles[pathname] || 'CertifyFlow'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - always visible on lg+, overlay on mobile */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-40
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header - full width, different content for mobile/desktop */}
        <header className="flex-shrink-0 bg-[var(--bg-card)] border-b border-[var(--border)] h-14 flex items-center px-4 lg:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 -ml-1.5 mr-2 rounded-md hover:bg-[var(--bg-option)] transition-colors"
            aria-label="Abrir menu"
          >
            <Bars3Icon className="w-5 h-5 text-[var(--text-primary)]" />
          </button>

          {/* Title */}
          <h1 className="text-base font-bold text-[var(--text-primary)] flex-1">{title}</h1>

          {/* Theme toggle */}
          <ThemeToggle />
        </header>

        {/* Page content - scrollable */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
