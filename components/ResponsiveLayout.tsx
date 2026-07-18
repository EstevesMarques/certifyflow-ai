'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ThemeToggle from '@/components/ThemeToggle'
import { Bars3Icon } from '@heroicons/react/24/outline'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/catalog': 'Catálogo de Exames',
  '/progress': 'Meu Progresso',
  '/settings': 'Configurações',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith('/admin/exams')) return 'Gerenciar Exames'
  if (pathname.startsWith('/exam/')) return 'Simulado'
  return 'CertifyFlow'
}

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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
        {/* Header — glass */}
        <header className="flex-shrink-0 glass-surface rounded-none border-0 h-14 flex items-center px-4 lg:px-6"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 -ml-1.5 mr-2 rounded-lg hover:bg-[var(--bg-option-hover)] transition-colors"
            aria-label="Abrir menu"
          >
            <Bars3Icon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </button>

          <h1 className="text-[15px] font-semibold tracking-tight flex-1" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h1>

          <ThemeToggle />
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
