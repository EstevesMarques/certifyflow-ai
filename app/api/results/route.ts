import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server-client'
import { z } from 'zod'
import { computeTopicStats } from '@/lib/topic-stats'

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
        user_id: user.id,
        exam_id: examId,
        topic_tag: a.topic_tag,
        is_correct: a.is_correct,
        question_text: a.question_text,
        user_answer: a.user_answer,
        correct_answer: a.correct_answer,
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
