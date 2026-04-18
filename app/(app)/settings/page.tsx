'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Configurações</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Gerencie suas preferências e conta.
      </p>

      <div className="space-y-4">
        {/* Account Info */}
        <div className="rounded-[10px] border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Informações da Conta
          </h2>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Email</div>
              <p style={{ color: 'var(--text-primary)' }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-[10px] border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Preferências
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded"
                style={{ borderColor: 'var(--border)' }}
              />
              <span style={{ color: 'var(--text-primary)' }}>Notificações de progresso</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded"
                style={{ borderColor: 'var(--border)' }}
              />
              <span style={{ color: 'var(--text-primary)' }}>Modo escuro automático</span>
            </label>
          </div>
        </div>

        {/* Logout */}
        <div className="rounded-[10px] border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Sessão
          </h2>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            style={{
              borderColor: '#ef4444',
              color: '#ef4444',
            }}
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
