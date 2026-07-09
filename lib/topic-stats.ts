import { TopicStat } from '@/types'

export function computeTopicStats(
  attempts: { topic_tag: string; is_correct: boolean }[]
): TopicStat[] {
  const stats: Record<string, { total: number; correct: number }> = {}
  for (const a of attempts) {
    if (!stats[a.topic_tag]) stats[a.topic_tag] = { total: 0, correct: 0 }
    stats[a.topic_tag].total++
    if (a.is_correct) stats[a.topic_tag].correct++
  }
  return Object.entries(stats)
    .map(([topic_tag, { total, correct }]) => ({
      topic_tag,
      total,
      correct,
      pct: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct)
}
