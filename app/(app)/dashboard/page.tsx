import { createClient } from '@/lib/supabase/server-client'
import { redirect } from 'next/navigation'
import StatCard from '@/components/dashboard/StatCard'
import PerformanceChart from '@/components/dashboard/PerformanceChart'
import TopicBreakdown from '@/components/dashboard/TopicBreakdown'
import HistoryTable from '@/components/dashboard/HistoryTable'
import CTABanner from '@/components/dashboard/CTABanner'
import { TopicStat } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(10)

  const allSessions = sessions ?? []

  const totalSims = allSessions.length
  const avgScore = totalSims > 0
    ? Math.round(allSessions.reduce((acc, s) => acc + s.score, 0) / totalSims)
    : 0

  const { data: attempts } = await supabase
    .from('question_attempts')
    .select('topic_tag, is_correct')
    .eq('user_id', user.id)

  const topicStats = computeTopicStats(attempts ?? [])
  const weakTopics = topicStats.filter((t) => t.pct < 70).slice(0, 3).map((t) => t.topic_tag)

  const lastExamId = allSessions[0]?.exam_id ?? 'AZ-900'

  const chartData = allSessions
    .slice(0, 7)
    .reverse()
    .map((s, i) => ({ label: `Sim ${i + 1}`, value: s.score }))

  const totalAttempts = attempts?.length ?? 0
  const correctAttempts = attempts?.filter((a) => a.is_correct).length ?? 0

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>

      {totalSims > 0 && (
        <CTABanner
          examId={lastExamId}
          examTitle={lastExamId}
          weakTopics={weakTopics}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Simulados" value={totalSims} sub="realizados" />
        <StatCard label="Média geral" value={`${avgScore}%`} accent sub="de acerto" />
        <StatCard label="Questões" value={totalAttempts} sub={`${totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0}% corretas`} />
        <StatCard
          label="Melhor exame"
          value={allSessions.length > 0 ? allSessions.reduce((a, b) => a.score > b.score ? a : b).exam_id : '—'}
        />
      </div>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PerformanceChart data={chartData} title="Evolução de scores" />
          <TopicBreakdown stats={topicStats.slice(0, 5)} title="Desempenho por tópico" />
        </div>
      )}

      <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-secondary)' }}>
          Histórico de simulados
        </div>
        <HistoryTable sessions={allSessions} />
      </div>
    </div>
  )
}

function computeTopicStats(attempts: { topic_tag: string; is_correct: boolean }[]): TopicStat[] {
  const stats: Record<string, { total: number; correct: number }> = {}
  for (const a of attempts) {
    if (!stats[a.topic_tag]) stats[a.topic_tag] = { total: 0, correct: 0 }
    stats[a.topic_tag].total++
    if (a.is_correct) stats[a.topic_tag].correct++
  }
  return Object.entries(stats)
    .map(([topic_tag, { total, correct }]) => ({
      topic_tag, total, correct,
      pct: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct)
}
