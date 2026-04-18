import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'
import { generateQuestion } from '@/lib/openai'
import { z } from 'zod'

const BodySchema = z.object({
  examId: z.string().min(1),
  sessionId: z.string().uuid(),
  askedTopics: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { examId, sessionId, askedTopics = [] } = BodySchema.parse(body)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: attempts } = await supabase
      .from('question_attempts')
      .select('topic_tag, is_correct')
      .eq('user_id', user.id)
      .limit(500)
      .order('created_at', { ascending: false })

    const weakTopics = getWeakTopics(attempts ?? [], askedTopics)

    const question = await generateQuestion(examId, weakTopics, askedTopics)
    return NextResponse.json(question)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 })
    }
    console.error('generate-question error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getWeakTopics(
  attempts: { topic_tag: string; is_correct: boolean }[],
  askedTopics: string[] = []
): string[] {
  if (attempts.length === 0) return []

  const stats: Record<string, { total: number; correct: number }> = {}
  for (const a of attempts) {
    if (!stats[a.topic_tag]) stats[a.topic_tag] = { total: 0, correct: 0 }
    stats[a.topic_tag].total++
    if (a.is_correct) stats[a.topic_tag].correct++
  }

  return Object.entries(stats)
    .map(([tag, { total, correct }]) => ({ tag, pct: correct / total }))
    .filter(({ tag }) => !askedTopics.includes(tag))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
    .map((x) => x.tag)
}

