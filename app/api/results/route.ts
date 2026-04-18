import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server-client'
import { z } from 'zod'
import { TopicStat } from '@/types'

const AnswerSchema = z.object({
  question_text: z.string(),
  topic_tag: z.string(),
  correct_answer: z.string(),
  user_answer: z.string(),
  is_correct: z.boolean(),
})

const BodySchema = z.object({
  sessionId: z.string().uuid(),
  examId: z.string().min(1),
  answers: z.array(AnswerSchema).min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, examId, answers } = BodySchema.parse(body)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const score = Math.round(
      (answers.filter((a) => a.is_correct).length / answers.length) * 100
    )

    const { error: attemptsError } = await supabase.from('question_attempts').insert(
      answers.map((a) => ({
        session_id: sessionId,
        question_id: crypto.randomUUID(),
        topic_tag: a.topic_tag,
        is_correct: a.is_correct,
        question_text: a.question_text,
        selected_option: a.user_answer,
        correct_option: a.correct_answer,
      }))
    )
    if (attemptsError) throw attemptsError

    const { error: sessionError } = await supabase
      .from('exam_sessions')
      .update({ score, total_q: answers.length, completed_at: new Date().toISOString() })
      .eq('id', sessionId)
    if (sessionError) throw sessionError

    const topicStats = computeTopicStats(answers)

    // Invalidate dashboard cache to show updated progress
    revalidatePath('/dashboard')
    revalidatePath('/progress')

    return NextResponse.json({ score, topicStats })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 })
    }
    console.error('results error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function computeTopicStats(
  answers: { topic_tag: string; is_correct: boolean }[]
): TopicStat[] {
  const stats: Record<string, { total: number; correct: number }> = {}
  for (const a of answers) {
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
