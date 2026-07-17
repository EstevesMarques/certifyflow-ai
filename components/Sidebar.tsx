'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid'

export default function Sidebar() {
  const pathname = usePathname()
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0],
        })
      }
    })
  }, [])

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
    { label: 'Progresso', href: '/progress', Icon: ChartBarIcon, ActiveIcon: ChartBarIconSolid },
    { label: 'Exames', href: '/admin/exams', Icon: ClipboardDocumentListIcon, ActiveIcon: ClipboardDocumentListIconSolid },
    { label: 'Configurações', href: '/settings', Icon: Cog6ToothIcon, ActiveIcon: Cog6ToothIconSolid },
  ]

  return (
    <aside className="w-[220px] h-full flex-shrink-0 glass-sidebar border-r border-[var(--border)] p-0 flex flex-col transition-all">
      {/* Brand */}
      <div className="border-b border-[var(--border-subtle)] px-6 h-14 flex items-center">
        <div>
          <div className="text-sm font-[800] text-[var(--text-primary)] tracking-tight">CertifyFlow</div>
          <div className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider font-medium">AI · Microsoft Certs</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col">
        <div className="flex-1 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 mx-3 px-4 py-2.5 text-[13px] font-medium transition-all rounded-[14px] ${
                  isActive
                    ? 'text-[var(--text-primary)] bg-[var(--bg-option-selected)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-option-hover)]'
                }`}
              >
                {isActive
                  ? <item.ActiveIcon className="w-[18px] h-[18px]" />
                  : <item.Icon className="w-[18px] h-[18px]" />
                }
                {item.label}
              </Link>
            )
          })}
        </div>
        {/* Sync button */}
        <div className="px-3 pb-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-all disabled:opacity-50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-option-hover)] rounded-[14px]"
          >
            <span className="w-[18px] text-center text-sm">{syncing ? '⏳' : '🔄'}</span>
            {syncing ? 'Sincronizando...' : 'Atualizar catálogo'}
          </button>
          {syncResult && (
            <div className="px-4 py-1.5 text-[10px] text-[var(--text-faint)] leading-relaxed">{syncResult}</div>
          )}
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-[var(--border-subtle)] p-4 mt-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ring-2 ring-[var(--border)]">
            {user?.name
              ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : '??'
            }
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[var(--text-primary)]">{user?.name ?? 'Usuário'}</div>
            <div className="text-[11px] text-[var(--text-faint)] truncate">{user?.email ?? ''}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
