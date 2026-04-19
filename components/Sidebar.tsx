'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  PlayCircleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  PlayCircleIcon as PlayCircleIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid'

export default function Sidebar() {
  const pathname = usePathname()
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/catalog/sync', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSyncResult(`${data.total} recebidos — ${data.inserted} inseridos, ${data.updated} atualizados`)
      } else {
        setSyncResult(`Erro: ${data.error}`)
      }
    } catch {
      setSyncResult('Erro de conexão')
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncResult(null), 5000)
    }
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', Icon: HomeIcon, ActiveIcon: HomeIconSolid },
    { label: 'Catálogo', href: '/catalog', Icon: ClipboardDocumentListIcon, ActiveIcon: ClipboardDocumentListIconSolid },
    { label: 'Simulado', href: '/simulado', Icon: PlayCircleIcon, ActiveIcon: PlayCircleIconSolid },
    { label: 'Progresso', href: '/progress', Icon: ChartBarIcon, ActiveIcon: ChartBarIconSolid },
    { label: 'Configurações', href: '/settings', Icon: Cog6ToothIcon, ActiveIcon: Cog6ToothIconSolid },
  ]

  return (
    <aside className="w-[220px] h-full flex-shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border)] p-0 flex flex-col transition-all">
      <div className="border-b border-[var(--border)] px-6 h-14 flex items-center">
        <div>
          <div className="text-sm font-[800] text-[var(--accent)] tracking-tight">CertifyFlow</div>
          <div className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">AI · Microsoft Certs</div>
        </div>
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
              {isActive
                ? <item.ActiveIcon className="w-4 h-4" />
                : <item.Icon className="w-4 h-4" />
              }
              {item.label}
            </Link>
          )
        })}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center gap-2.5 px-5 py-2 text-xs font-medium transition-colors disabled:opacity-50 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-option)]"
        >
          <span className="w-4 text-center">{syncing ? '⏳' : '🔄'}</span>
          {syncing ? 'Sincronizando...' : 'Atualizar catálogo'}
        </button>
        {syncResult && (
          <div className="px-5 py-1.5 text-[10px] text-[var(--text-faint)]">{syncResult}</div>
        )}
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
