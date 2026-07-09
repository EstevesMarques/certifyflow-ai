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

      // Fetch current AI settings
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
      <div className="p-6 flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
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

        {/* AI Provider (BYOK) */}
        <div className="rounded-[10px] border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Provedor de IA (BYOK)
          </h2>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Configure sua própria chave de API para gerar questões. Se não configurada, usamos a chave do servidor.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                Provedor
              </label>
              <select
                value={provider}
                onChange={e => setProvider(e.target.value as AIProvider)}
                className="w-full px-3 py-2 bg-[var(--bg-option)] border border-[var(--border)] rounded-[10px] text-sm"
              >
                {PROVIDERS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                API Key {hasKey && <span className="text-green-500 ml-1">● Configurada</span>}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={PROVIDERS.find(p => p.value === provider)?.placeholder ?? 'sua-api-key'}
                className="w-full px-3 py-2 bg-[var(--bg-option)] border border-[var(--border)] rounded-[10px] text-sm"
              />
            </div>
            {message && (
              <p className="text-xs" style={{ color: message.startsWith('✅') ? '#16a34a' : '#ef4444' }}>{message}</p>
            )}
            <Button
              onClick={handleSaveAI}
              disabled={saving}
              className="w-full"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {saving ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
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
