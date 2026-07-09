import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'
import { buildPrompt } from '@/lib/openai'
import { generateWithProvider, getFallbackConfig } from '@/lib/ai-providers'
import type { AIProvider, ProviderConfig } from '@/lib/ai-providers'
import { getContentForTopics } from '@/lib/content-retriever'
import { z } from 'zod'

const BodySchema = z.object({
  examId: z.string().min(1),
  sessionId: z.string().uuid(),
  askedTopics: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { examId, askedTopics = [] } = BodySchema.parse(body)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: attempts } = await supabase
      .from('question_attempts')
      .select('topic_tag, is_correct')
      .eq('user_id', user.id)
      .limit(500)
      .order('attempted_at', { ascending: false })

    const weakTopics = getWeakTopics(attempts ?? [], askedTopics)

    // Fetch skills_measured from the exam
    const { data: exam } = await supabase
      .from('exams')
      .select('skills_measured')
      .eq('id', examId)
      .single()

    const skills_measured = exam?.skills_measured ?? null

    // Buscar conteúdo real do Microsoft Learn (DB ou skills_measured fallback)
    const skillsTyped = skills_measured as import('@/types').SkillItem[] | null
    const learningContent = await getContentForTopics(examId, weakTopics, skillsTyped, 2)

    // Fetch user's AI provider config (BYOK) or fall back to server key
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_provider, ai_api_key')
      .eq('id', user.id)
      .single()

    let config: ProviderConfig
    if (profile?.ai_api_key) {
      config = {
        provider: (profile.ai_provider as AIProvider) ?? 'openai',
        apiKey: profile.ai_api_key,
      }
    } else {
      config = getFallbackConfig()
    }

    const prompt = buildPrompt(examId, weakTopics, askedTopics, skills_measured, learningContent || undefined)
    const question = await generateWithProvider(config, prompt)
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

