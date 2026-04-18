'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { ExamSession } from '@/types'
import HistoryTable from '@/components/dashboard/HistoryTable'
import TopicBreakdown from '@/components/dashboard/TopicBreakdown'
import { TopicStat } from '@/types'

export default function ProgressPage() {
  const [sessions, setSessions] = useState<(ExamSession & { exam_id: string })[]>([])
  const [topicStats, setTopicStats] = useState<TopicStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data: sessionData } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      setSessions(sessionData ?? [])

      // Calculate overall topic stats
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('topic_tag, is_correct')
        .eq('user_id', user.id)

      if (attempts && attempts.length > 0) {
        const stats: Record<string, { correct: number; total: number }> = {}

        attempts.forEach((a: { topic_tag: string; is_correct: boolean }) => {
          if (!stats[a.topic_tag]) {
            stats[a.topic_tag] = { correct: 0, total: 0 }
          }
          stats[a.topic_tag].total++
          if (a.is_correct) stats[a.topic_tag].correct++
        })

        const topicList = Object.entries(stats)
          .map(([tag, { correct, total }]) => ({
            topic_tag: tag,
            pct: Math.round((correct / total) * 100),
          }))
          .sort((a, b) => a.pct - b.pct)

        setTopicStats(topicList)
      }

      setLoading(false)
    }

    fetchProgress()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--text-muted)' }}>Carregando progresso...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Meu Progresso</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Acompanhe seu desempenho em cada tópico e simulado realizado.
      </p>

      <div className="space-y-6">
        {topicStats.length > 0 && (
          <TopicBreakdown stats={topicStats} title="Desempenho por área" />
        )}

        <div>
          <h2 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Histórico de Simulados
          </h2>
          <div className="rounded-[10px] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', padding: '18px' }}>
            <HistoryTable sessions={sessions} />
          </div>
        </div>
      </div>
    </div>
  )
}
