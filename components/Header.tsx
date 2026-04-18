'use client'

import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/catalog': 'Catálogo de Exames',
  '/simulado': 'Iniciar Simulado',
  '/progress': 'Meu Progresso',
  '/settings': 'Configurações',
}

export default function Header() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || 'CertifyFlow'

  return (
    <div className="flex-shrink-0 bg-[var(--bg-card)] border-b border-[var(--border)] px-6 py-3.5 flex items-center justify-between">
      <h1 className="text-base font-bold text-[var(--text-primary)]">{title}</h1>
      <ThemeToggle />
    </div>
  )
}
