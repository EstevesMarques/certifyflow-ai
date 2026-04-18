'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { createClient } from '@/lib/supabase/browser-client'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/catalog', label: 'Catálogo', icon: '📋' },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = userEmail.slice(0, 2).toUpperCase()

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col border-r"
      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="font-extrabold text-base tracking-tight" style={{ color: 'var(--accent)' }}>
          CertifyFlow
        </div>
        <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-faint)' }}>
          AI · Microsoft Certs
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-colors"
              style={{
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                background: active ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent',
              }}
            >
              <span className="w-4 text-center">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
        <ThemeToggle />
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>
              {userEmail}
            </div>
            <button
              onClick={signOut}
              className="text-[10px] hover:underline"
              style={{ color: 'var(--text-faint)' }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
