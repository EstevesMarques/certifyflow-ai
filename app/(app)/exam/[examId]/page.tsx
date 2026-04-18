'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'

const QUESTION_OPTIONS = [10, 20, 40]

export default function ExamSetupPage() {
  const { examId } = useParams<{ examId: string }>()
  const router = useRouter()
  const [totalQ, setTotalQ] = useState(20)
  const [loading, setLoading] = useState(false)

  async function startExam() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('exams').upsert({ id: examId, title: examId, level: 'Associate' }, { onConflict: 'id', ignoreDuplicates: true })

    const { data: session, error } = await supabase
      .from('exam_sessions')
      .insert({ user_id: user.id, exam_id: examId, total_q: totalQ })
      .select()
      .single()

    if (error || !session) { setLoading(false); return }
    router.push(`/exam/${examId}/session?sessionId=${session.id}&totalQ=${totalQ}`)
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
      <div className="w-full max-w-sm rounded-xl border p-6 space-y-5"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>
            {examId}
          </div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Configurar Simulado
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

        <Button
          className="w-full"
          style={{ background: 'var(--accent)' }}
          onClick={startExam}
          disabled={loading}
        >
          {loading ? 'Iniciando…' : 'Iniciar Simulado →'}
        </Button>
      </div>
    </div>
  )
}
