'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { icon: '⊞', label: 'Dashboard', href: '/dashboard' },
    { icon: '📋', label: 'Catálogo', href: '/catalog' },
    { icon: '▶', label: 'Simulado', href: '/simulado' },
    { icon: '📈', label: 'Progresso', href: '/progress' },
    { icon: '⚙', label: 'Configurações', href: '/settings' },
  ]

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border)] p-0 flex flex-col transition-all">
      <div className="border-b border-[var(--border)] px-5 py-5 mb-3">
        <div className="text-sm font-[800] text-[var(--accent)] tracking-tight">CertifyFlow</div>
        <div className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">AI · Microsoft Certs</div>
      </div>

      <nav className="flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-5 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-option)]'
              }`}
            >
              <span className="text-base w-4.5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[var(--border)] p-4 mt-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            EM
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[var(--text-secondary)]">Esteves Marques</div>
            <div className="text-[10px] text-[var(--text-faint)] truncate">esteves@livingnet.com.br</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
