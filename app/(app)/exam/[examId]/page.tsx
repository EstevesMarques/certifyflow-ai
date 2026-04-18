'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { STATIC_EXAMS } from '@/lib/catalog'

const QUESTION_OPTIONS = [10, 20, 40]

export default function ExamSetupPage() {
  const { examId } = useParams<{ examId: string }>()
  const exam = STATIC_EXAMS.find(e => e.id === examId)
  const examTitle = exam?.title ?? examId
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

      router.push(`/exam/${examId}/session?sessionId=${session.id}&totalQ=${totalQ}&examTitle=${encodeURIComponent(examTitle)}`)
    } catch (err) {
      console.error('Error starting exam:', err)
      setError('Erro ao iniciar simulado')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
      <div className="w-full max-w-sm rounded-[10px] border p-6 space-y-5"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>
            {examId}
          </div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {examTitle}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            O motor adaptativo priorizará seus tópicos mais fracos.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            Número de questões
          </div>
          <div className="flex gap-2">
            {QUESTION_OPTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setTotalQ(q)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-all"
                style={{
                  borderColor: totalQ === q ? 'var(--accent)' : 'var(--border)',
                  background: totalQ === q ? 'var(--bg-option-selected)' : 'transparent',
                  color: totalQ === q ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
            {error}
          </div>
        )}

        <button
          onClick={startExam}
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? 'Iniciando…' : 'Iniciar Simulado →'}
        </button>
      </div>
    </div>
  )
}
