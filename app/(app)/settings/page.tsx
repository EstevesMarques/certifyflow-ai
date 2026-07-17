'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { AIProvider } from '@/lib/ai-providers'

const PROVIDERS: { value: AIProvider; label: string; placeholder: string }[] = [
  { value: 'openai', label: 'OpenAI (GPT-4o-mini)', placeholder: 'sk-...' },
  { value: 'anthropic', label: 'Anthropic (Claude Sonnet 5)', placeholder: 'sk-ant-...' },
  { value: 'deepseek', label: 'DeepSeek (DeepSeek-Chat)', placeholder: 'sk-...' },
]

export default function SettingsPage() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [hasKey, setHasKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const res = await fetch('/api/settings/ai')
      if (res.ok) {
        const data = await res.json()
        setProvider(data.provider ?? 'openai')
        setHasKey(data.hasKey)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSaveAI = async () => {
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/settings/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey: apiKey || undefined }),
    })
    if (res.ok) {
      setApiKey('')
      setHasKey(true)
      setMessage('✅ Configuração salva com sucesso!')
    } else {
      setMessage('❌ Erro ao salvar.')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Configurações</h1>
      <p className="text-[14px] mb-8" style={{ color: 'var(--text-secondary)' }}>
        Gerencie suas preferências e conta.
      </p>

      <div className="space-y-5 max-w-2xl">
        {/* Account Info */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
            Informações da Conta
          </h2>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>Email</div>
            <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>{user?.email}</p>
          </div>
        </div>

        {/* AI Provider */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
            Provedor de IA (BYOK)
          </h2>
          <p className="text-[13px] mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Configure sua própria chave de API para gerar questões. Se não configurada, usamos a chave do servidor.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-faint)' }}>
                Provedor
              </label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value as AIProvider)}
                className="w-full px-4 py-3 glass-input text-sm"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                {PROVIDERS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-faint)' }}>
                API Key {hasKey && <span style={{ color: 'var(--accent-success)' }}>● Configurada</span>}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={PROVIDERS.find(p => p.value === provider)?.placeholder ?? 'sua-api-key'}
                className="w-full glass-input text-sm"
                style={{ borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            {message && (
              <p className="text-[13px] font-medium" style={{ color: message.startsWith('✅') ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                {message}
              </p>
            )}
            <Button
              onClick={handleSaveAI}
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
            Preferências
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded accent-[var(--accent)]"
              />
              <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Notificações de progresso</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded accent-[var(--accent)]"
              />
              <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Modo escuro automático</span>
            </label>
          </div>
        </div>

        {/* Logout */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
            Sessão
          </h2>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  )
}
