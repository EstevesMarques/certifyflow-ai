'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(15,17,23,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #0078d4, #50aaff)' }}>
              C
            </div>
            <span className="font-bold text-base tracking-tight">CertifyFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Depoimentos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
            >
              Entrar
            </Link>
            <Link
              href="/login?tab=register"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all text-white"
              style={{ background: 'var(--accent)' }}
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6" style={{ background: 'linear-gradient(180deg, #0a0e15 0%, var(--bg-page) 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: 'rgba(0,120,212,0.1)', color: 'var(--accent)', border: '1px solid rgba(0,120,212,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
            IA multi-provedor — OpenAI, Anthropic & DeepSeek
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Passe na{' '}
            <span style={{ background: 'linear-gradient(135deg, #0078d4, #50aaff, #a0d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              certificação Microsoft
            </span>
            <br />
            com prática realista em IA
          </h1>
          <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Simulados adaptativos que identificam seus pontos fracos e geram questões
            personalizadas no estilo PearsonVue. Mais de 140 exames Microsoft disponíveis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?tab=register"
              className="px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0078d4, #005a9e)', boxShadow: '0 0 40px rgba(0,120,212,0.3)' }}
            >
              Comece grátis agora
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl text-base font-semibold transition-all hover:bg-white/5"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Fazer login
            </Link>
          </div>
          <p className="text-xs mt-4" style={{ color: 'var(--text-faint)' }}>
            Sem cartão de crédito • Comece em 1 minuto
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Por que o CertifyFlow?</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Prática inteligente que se adapta ao seu nível e foca onde você mais precisa melhorar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯', title: 'IA Adaptativa',
                desc: 'O algoritmo analisa seu desempenho e gera questões focadas nos tópicos onde você tem mais dificuldade.',
              },
              {
                icon: '📚', title: 'Catálogo completo',
                desc: 'Mais de 140 exames Microsoft sincronizados direto do catálogo oficial. Do AZ-900 ao AZ-305.',
              },
              {
                icon: '📊', title: 'Estatísticas detalhadas',
                desc: 'Dashboard com gráficos de evolução, performance por tópico e histórico completo de simulados.',
              },
              {
                icon: '🔐', title: 'BYOK — Sua chave, suas regras',
                desc: 'Use sua própria API key da OpenAI, Anthropic ou DeepSeek. Zero dependência de terceiros.',
              },
              {
                icon: '🎨', title: 'Experiência PearsonVue',
                desc: 'Questões no estilo real da prova: cenários práticos, alternativas plausíveis e explicações detalhadas.',
              },
              {
                icon: '⚡', title: 'Gratuito e rápido',
                desc: 'Comece em segundos, sem instalação. Interface moderna com tema claro e escuro.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border transition-all hover:border-[#0078d4]/30 hover:shadow-lg"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: 'var(--bg-card)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Como funciona</h2>
          <p className="text-base mb-16 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Três passos simples para começar sua jornada de certificação.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📝', title: 'Escolha seu exame', desc: 'Navegue pelo catálogo com 140+ certificações Microsoft e escolha a sua.' },
              { step: '2', icon: '🧠', title: 'Responda as questões', desc: 'A IA gera questões personalizadas com base nos tópicos oficiais de cada exame.' },
              { step: '3', icon: '📈', title: 'Acompanhe seu progresso', desc: 'Veja estatísticas por tópico, identifique fraquezas e repita até dominar.' },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 text-white"
                  style={{ background: 'linear-gradient(135deg, #0078d4, #005a9e)' }}>
                  {s.step}
                </div>
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-base mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 -right-4 text-xl" style={{ color: 'var(--text-faint)' }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <Link
            href="/login?tab=register"
            className="inline-block mt-16 px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:scale-105 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0078d4, #005a9e)', boxShadow: '0 0 40px rgba(0,120,212,0.3)' }}
          >
            Começar agora
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">O que dizem os alunos</h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Histórias reais de quem passou na certificação usando o CertifyFlow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Carlos Silva', role: 'Cloud Engineer', text: 'O CertifyFlow foi essencial para eu passar no AZ-104. As questões adaptativas identificaram exatamente meus gaps. Recomendo demais.' },
              { name: 'Ana Oliveira', role: 'DevOps Sênior', text: 'A qualidade das questões é impressionante — muito próximas do exame real. Passei no AZ-400 de primeira.' },
              { name: 'Rafael Costa', role: 'Arquiteto de Soluções', text: 'Usei para o AZ-305 e o que mais me ajudou foi o dashboard de performance. Saber meus tópicos fracos fez toda diferença.' },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #0078d4, #50aaff)' }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, var(--bg-card) 0%, #0a1628 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Pronto para sua{' '}
            <span style={{ background: 'linear-gradient(135deg, #0078d4, #50aaff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              certificação?
            </span>
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Junte-se a milhares de profissionais que já usam o CertifyFlow para se preparar
            para os exames Microsoft. 100% gratuito.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?tab=register"
              className="px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0078d4, #005a9e)', boxShadow: '0 0 40px rgba(0,120,212,0.3)' }}
            >
              Começar grátis agora
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs" style={{ color: 'var(--text-faint)' }}>
            <span>Microsoft Partner</span>
            <span>•</span>
            <span>140+ exames</span>
            <span>•</span>
            <span>SSL criptografado</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'var(--border)', background: '#0a0e15' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm" style={{ color: 'var(--text-faint)' }}>
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>CertifyFlow</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Como funciona</a>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
