'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import { GeneratedQuestion, SessionAnswer, TopicStat } from '@/types'
import QuestionCard from '@/components/exam/QuestionCard'
import ProgressBar from '@/components/exam/ProgressBar'
import TopicBreakdown from '@/components/dashboard/TopicBreakdown'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Phase = 'loading' | 'question' | 'review' | 'result'

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function SessionPage() {
  const { examId } = useParams<{ examId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const sessionId = searchParams.get('sessionId') ?? ''
  const totalQ = Number(searchParams.get('totalQ') ?? '20')
  const examTitle = searchParams.get('examTitle') ?? examId

  const [phase, setPhase] = useState<Phase>('loading')
  const [current, setCurrent] = useState<GeneratedQuestion | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>()
  const [answers, setAnswers] = useState<SessionAnswer[]>([])
  const [flagged, setFlagged] = useState(false)
  const [topicStats, setTopicStats] = useState<TopicStat[]>([])
  const [error, setError] = useState('')
  const [resultData, setResultData] = useState<{ score: number; topicStats: TopicStat[] } | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(totalQ * 90)

  // Global timer (not reset per question)
  useEffect(() => {
    if (phase === 'result' || timeRemaining <= 0) return
    const timer = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          handleExpire()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase])

  // Buscar primeira questão ao montar
  useEffect(() => {
    fetchQuestion()
  }, [])

  async function fetchQuestion() {
    setPhase('loading')
    setSelectedAnswer(undefined)
    setFlagged(false)
    try {
      const askedTopics = answers.map((a) => a.topic_tag)
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, sessionId, askedTopics }),
      })
      if (!res.ok) throw new Error('Falha ao gerar questão')
      const q: GeneratedQuestion = await res.json()
      setCurrent(q)
      setPhase('question')
    } catch (e) {
      setError('Erro ao carregar questão. Verifique sua conexão.')
    }
  }

  function onAnswer(letter: string) {
    if (phase !== 'question' || !current) return
    setSelectedAnswer(letter)
    setPhase('review')
  }

  async function nextQuestion() {
    if (!current || !selectedAnswer) return

    const answer: SessionAnswer = {
      question_text: current.question,
      topic_tag: current.topic_tag,
      correct_answer: current.correct_answer,
      user_answer: selectedAnswer,
      is_correct: selectedAnswer === current.correct_answer,
    }
    const updatedAnswers = [...answers, answer]
    setAnswers(updatedAnswers)

    if (questionIndex + 1 >= totalQ) {
      await submitResults(updatedAnswers)
    } else {
      setQuestionIndex((i) => i + 1)
      fetchQuestion()
    }
  }

  const handleExpire = useCallback(() => {
    if (answers.length > 0) submitResults(answers)
    else router.push('/dashboard')
  }, [answers, router])

  async function submitResults(finalAnswers: SessionAnswer[]) {
    setPhase('loading')
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, examId, answers: finalAnswers }),
      })
      const data = await res.json()
      setResultData({ score: data.score, topicStats: data.topicStats ?? [] })
      setPhase('result')
    } catch {
      setError('Erro ao salvar resultados.')
    }
  }

  // --- RESULT SCREEN ---
  if (phase === 'result' && resultData) {
    const passed = resultData.score >= 70
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border overflow-hidden"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="py-8 px-6 text-center"
            style={{ background: 'linear-gradient(135deg, #0078d4 0%, #0063b1 100%)' }}>
            <div className="text-5xl font-extrabold text-white">{resultData.score}%</div>
            <div className="text-sm text-white/80 mt-1">
              {answers.filter((a) => a.is_correct).length} de {answers.length} corretas
            </div>
            <div className="inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              {passed ? '✓ Aprovado' : `⚠ Abaixo do mínimo (passing score: 700/1000)`}
            </div>
          </div>
          <div className="p-5 space-y-4">
            {resultData.topicStats.length > 0 && (
              <TopicBreakdown stats={resultData.topicStats} title="Áreas para melhoria" />
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push(`/exam/${examId}`)}>
                Refazer
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full" style={{ background: 'var(--accent)' }}>Ver dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Always render topbar + progress bar
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      {/* Topbar — always visible */}
      <div className="border-b px-5 py-3 flex items-center justify-between shrink-0"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
            style={{ background: 'var(--accent)' }}>
            {examId}
          </span>
          <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {decodeURIComponent(examTitle)}
          </span>
        </div>
        <span
          className="text-xl font-bold tabular-nums transition-colors"
          style={{ color: timeRemaining < 60 ? '#ef4444' : 'var(--accent)' }}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>

      <ProgressBar current={questionIndex + 1} total={totalQ} />

      {/* Question area — full width */}
      <div className="flex-1 p-5 w-full">
        {/* Loading skeleton */}
        {phase === 'loading' && (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-32 rounded" style={{ background: 'var(--bg-option)' }} />
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 rounded-lg" style={{ background: 'var(--bg-option)' }} />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center space-y-3 py-12">
            <p className="text-sm text-red-500">{error}</p>
            <Button onClick={fetchQuestion} style={{ background: 'var(--accent)' }}>Tentar novamente</Button>
          </div>
        )}

        {/* Question content */}
        {phase !== 'loading' && !error && current && (
          <>
            <div className="text-[11px] font-semibold mb-3 uppercase tracking-wider"
              style={{ color: 'var(--text-faint)' }}>
              QUESTÃO {questionIndex + 1}
            </div>

            <QuestionCard
              question={current}
              selectedAnswer={selectedAnswer}
              onAnswer={onAnswer}
              disabled={phase === 'review'}
              showCorrect={phase === 'review'}
            />

            {/* Review: explanation + next */}
            {phase === 'review' && (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg p-3.5 border text-sm"
                  style={{ background: 'var(--bg-option)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Explicação: </strong>
                  {current.explanation}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setFlagged((f) => !f)}
                    className="text-xs transition-colors"
                    style={{ color: flagged ? '#f59e0b' : 'var(--text-muted)' }}
                  >
                    {flagged ? '⚑ Marcado' : '⚑ Marcar para revisão'}
                  </button>
                  <Button onClick={nextQuestion} style={{ background: 'var(--accent)' }}>
                    {questionIndex + 1 >= totalQ ? 'Ver resultado →' : 'Próxima →'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
