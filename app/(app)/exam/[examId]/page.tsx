'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser-client'
import { STATIC_EXAMS } from '@/lib/static-exams'
import { EXAM_TOPICS } from '@/lib/exam-topics'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

const QUESTION_OPTIONS = [10, 20, 40]

const LEVEL_BADGE_VARIANT = {
  Fundamentals: 'outline' as const,
  Associate: 'secondary' as const,
  Expert: 'destructive' as const,
}

export default function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>()
  const exam = STATIC_EXAMS.find((e) => e.id === examId)
  const examTitle = exam?.title ?? examId
  const topics = EXAM_TOPICS[examId] ?? []
  const router = useRouter()
  const [totalQ, setTotalQ] = useState(20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function startExam() {
    try {
      setError('')
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: session, error: insertError } = await supabase
        .from('exam_sessions')
        .insert({ user_id: user.id, exam_id: examId, total_q: totalQ })
        .select()
        .single()

      if (insertError || !session) {
        console.error('Insert error:', insertError)
        setError('Erro ao criar sessão. Tente novamente.')
        setLoading(false)
        return
      }

      router.push(
        `/exam/${examId}/session?sessionId=${session.id}&totalQ=${totalQ}&examTitle=${encodeURIComponent(examTitle)}`
      )
    } catch (err) {
      console.error('Error starting exam:', err)
      setError('Erro ao iniciar simulado')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Back link */}
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1 text-sm transition-colors mb-6 block"
        style={{ color: 'var(--accent)' }}
      >
        ← Voltar ao Catálogo
      </Link>

      {/* Three-column layout with full-width header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Header - full width (col-span-3) */}
        <div className="lg:col-span-3">
          <div
            className="rounded-2xl shadow-sm border p-8 space-y-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <div className="mb-2">
              <Badge variant={exam ? LEVEL_BADGE_VARIANT[exam.level] : 'outline'}>
                {exam?.level ?? 'N/A'}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {examTitle}
            </h1>
            <p className="text-base max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              {exam?.description ?? 'Descrição não disponível.'}
            </p>
          </div>
        </div>

        {/* Left column - Skills (col-span-2) */}
        <div className="lg:col-span-2">
          {/* Topics section */}
          {topics.length > 0 && (
            <div
              className="rounded-2xl shadow-sm border p-6 space-y-5"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                Conteúdos cobrados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {topics.map((section, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-4 space-y-2"
                    style={{ background: 'var(--bg-page)', borderColor: 'var(--border)' }}
                  >
                    <div className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                      {section.topic}
                    </div>
                    <div className="flex flex-col gap-2 pl-1">
                      {section.subtopics.map((sub) => (
                        <div key={sub} className="flex items-center gap-2">
                          <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {sub}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column - Sticky CTA (col-span-1) */}
        <div className="lg:col-span-1">
          <div
            className="sticky top-24 rounded-2xl shadow-lg border p-8 space-y-6"
            style={{ background: 'var(--accent)' }}
          >
            <div className="space-y-4">
              <h3 className="text-2xl font-bold" style={{ color: '#fff' }}>
                Pronto para começar?
              </h3>
              <div className="text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Número de questões
              </div>
              <div className="flex gap-2">
                {QUESTION_OPTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => setTotalQ(q)}
                    className="flex-1 h-12 rounded-xl text-base font-medium border transition-all"
                    style={{
                      borderColor: totalQ === q ? '#fff' : 'rgba(255,255,255,0.3)',
                      background: totalQ === q ? 'rgba(255,255,255,0.25)' : 'transparent',
                      color: '#fff',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {error}
              </p>
            )}

            <Button
              onClick={startExam}
              disabled={loading}
              className="w-full h-14 text-base font-semibold"
              style={{ background: '#fff', color: 'var(--accent)' }}
            >
              {loading ? 'Criando sessão...' : 'Iniciar Simulado'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
