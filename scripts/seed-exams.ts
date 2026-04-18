import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

type SkillSubtopic = {
  topic: string
  weight: string
  subtopics: string[]
}

type ExamSeed = {
  id: string
  external_id: string
  title: string
  provider: string
  skills_measured: SkillSubtopic[]
}

const examSeeds: ExamSeed[] = [
  {
    id: 'AI-103',
    external_id: 'AI-103',
    title: 'Microsoft Azure AI Engineer Associate',
    provider: 'Microsoft',
    skills_measured: [
      {
        topic: 'Build AI solutions using Azure AI Foundry',
        weight: '25-30%',
        subtopics: [
          'Create and manage AI agents',
          'Configure agent instructions and system prompts',
          'Use prompt flow to orchestrate AI workflows',
          'Ground agents with enterprise data sources',
          'Implement retrieval-augmented generation (RAG) patterns',
          'Manage tools and actions for agents'
        ]
      },
      {
        topic: 'Integrate and use Azure OpenAI models',
        weight: '20-25%',
        subtopics: [
          'Deploy and manage Azure OpenAI models',
          'Configure temperature, max_tokens, and top_p',
          'Design effective prompts for different use cases',
          'Handle chat completions and streaming responses',
          'Implement function calling and tool usage',
          'Optimize token usage and cost control'
        ]
      }
    ]
  }
]

async function seedExam(exam: ExamSeed) {
  // Upsert: tenta update primeiro, se não encontrar faz insert
  const { error } = await supabase
    .from('exams')
    .upsert({
      id: exam.id,
      exam_code: exam.id,
      title: exam.title,
      provider: exam.provider,
      skills_measured: exam.skills_measured,
      external_id: exam.external_id,
      last_updated: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) {
    console.error(`❌ ${exam.id}: ${error.message}`)
    return false
  }

  console.log(`✅ ${exam.id} — ${exam.skills_measured.length} topics populated`)
  return true
}

async function main() {
  console.log('🌱 Starting exam seed...\n')

  let success = 0
  for (const exam of examSeeds) {
    const ok = await seedExam(exam)
    if (ok) success++
  }

  console.log(`\n🏁 Done — ${success}/${examSeeds.length} exams seeded`)

  if (success < examSeeds.length) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
