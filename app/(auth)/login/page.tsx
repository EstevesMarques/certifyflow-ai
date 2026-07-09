'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser-client'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
      <rect x="12" y="1" width="10" height="10" fill="#7fba00"/>
      <rect x="1" y="12" width="10" height="10" fill="#00a4ef"/>
      <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
    </svg>
  )
}

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login'

  const [tab, setTab] = useState<'login' | 'register'>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const initialError = searchParams.get('error') ? 'Falha na autenticação. Tente novamente.' : ''
  const [error, setError] = useState(initialError)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const supabase = createClient()

    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.refresh()
      router.push('/dashboard')
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.session) {
        router.refresh()
        router.push('/dashboard')
      } else {
        setMessage('Conta criada! Verifique seu email para confirmar.')
        setLoading(false)
      }
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto px-6">
      {/* Logo mobile */}
      <div className="lg:hidden text-center mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-3 text-white"
          style={{ background: 'linear-gradient(135deg, #0078d4, #50aaff)' }}>
          C
        </div>
        <h1 className="text-xl font-bold">CertifyFlow</h1>
      </div>

      {/* Tabs */}
      <div className="flex mb-8 bg-[var(--bg-option)] rounded-xl p-1">
        <button
          onClick={() => { setTab('login'); setError(''); setMessage('') }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            tab === 'login'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          Entrar
        </button>
        <button
          onClick={() => { setTab('register'); setError(''); setMessage('') }}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            tab === 'register'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          Criar conta
        </button>
      </div>

      {/* Google OAuth */}
      <button
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-md disabled:opacity-50 border mb-6"
        style={{
          color: 'var(--text-primary)',
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <GoogleIcon />
        {googleLoading ? 'Redirecionando...' : `Continuar com Google`}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>ou com email</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {/* Email form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {tab === 'register' && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Nome</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0078d4]/40 border"
              style={{ background: 'var(--bg-option)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              placeholder="Seu nome completo"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0078d4]/40 border"
            style={{ background: 'var(--bg-option)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0078d4]/40 border"
            style={{ background: 'var(--bg-option)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-500/10 px-4 py-3 rounded-xl">{error}</div>
        )}
        {message && (
          <div className="text-sm text-green-500 bg-green-500/10 px-4 py-3 rounded-xl">{message}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] shadow-lg disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #0078d4, #005a9e)',
            boxShadow: '0 4px 24px rgba(0,120,212,0.25)',
          }}
        >
          {loading
            ? (tab === 'login' ? 'Entrando...' : 'Criando conta...')
            : (tab === 'login' ? 'Entrar' : 'Criar conta')}
        </button>
      </form>

      <p className="text-xs text-center mt-6" style={{ color: 'var(--text-faint)' }}>
        {tab === 'login' ? (
          <>Ainda não tem conta?{' '}
            <button onClick={() => setTab('register')} className="font-semibold underline" style={{ color: 'var(--accent)' }}>
              Cadastre-se grátis
            </button>
          </>
        ) : (
          <>Já tem conta?{' '}
            <button onClick={() => setTab('login')} className="font-semibold underline" style={{ color: 'var(--accent)' }}>
              Faça login
            </button>
          </>
        )}
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div
        className="hidden lg:flex w-[42%] fixed left-0 top-0 bottom-0 flex-col justify-between p-10"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d1f3c 30%, #0f2748 60%, #07101e 100%)' }}
      >
        <div>
          <Link href="/" className="flex items-center gap-2.5 mb-20">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #0078d4, #50aaff)' }}>
              C
            </div>
            <span className="font-bold text-lg tracking-tight text-white">CertifyFlow</span>
          </Link>

          <h2 className="text-3xl font-extrabold leading-tight mb-6 text-white">
            Domine as certificações Microsoft com{' '}
            <span style={{ background: 'linear-gradient(135deg, #50aaff, #a0d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              prática inteligente
            </span>
          </h2>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: '#8ba4c7' }}>
            Simulados adaptativos alimentados por IA que identificam seus pontos fracos
            e geram questões personalizadas no estilo PearsonVue.
          </p>

          <div className="mt-12 space-y-4">
            {[
              'Mais de 140 exames Microsoft',
              'IA multi-provedor (OpenAI, Anthropic, DeepSeek)',
              'Dashboard de performance por tópico',
              '100% gratuito — sem cartão de crédito',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ background: 'rgba(80,170,255,0.15)', color: '#50aaff' }}>
                  ✓
                </div>
                <span className="text-sm" style={{ color: '#8ba4c7' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs" style={{ color: '#5a7a9e' }}>
          <div className="flex items-center gap-2">
            <MicrosoftIcon />
            <span>Microsoft Partner</span>
          </div>
          <span>•</span>
          <span>SSL Criptografado</span>
        </div>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 lg:ml-[42%] flex items-center justify-center min-h-screen p-4" style={{ background: 'var(--bg-page)' }}>
        <Suspense fallback={
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Carregando...</div>
        }>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  )
}
