import { createClient } from '@/lib/supabase/server-client'
import type { SkillItem } from '@/types'

/**
 * Constrói contexto rico a partir dos skills_measured como fallback
 * quando não há conteúdo ingerido no learning_content.
 */
function buildSkillsContext(
  skillsMeasured: SkillItem[],
  weakTopics: string[],
  topicTag: string
): string {
  if (!skillsMeasured || skillsMeasured.length === 0) return ''

  // Encontrar o skill item mais relevante para o tópico
  const relevant = skillsMeasured.filter(s => {
    const slug = s.topic.toLowerCase().replace(/\s+/g, '-')
    return slug.includes(topicTag.toLowerCase()) ||
           topicTag.toLowerCase().includes(slug) ||
           s.subtopics.some(st => st.toLowerCase().includes(topicTag.toLowerCase().replace(/-/g, ' ')))
  })

  const items = relevant.length > 0 ? relevant : skillsMeasured.slice(0, 1)
  if (items.length === 0) return ''

  return items.map(skill => {
    const subs = skill.subtopics
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n')
    return `TÓPICO OFICIAL DO EXAME: ${skill.topic} (Peso: ${skill.weight}%)\n\nSub-tópicos detalhados:\n${subs}\n\nUse estes sub-tópicos como guia para criar uma questão precisa e relevante.`
  }).join('\n\n')
}

/**
 * Busca conteúdo de aprendizagem relevante para um tópico específico.
 * Prioriza learning_content do banco; fallback para skills_measured.
 */
export async function getRelevantContent(
  examId: string,
  topicTag: string,
  maxChunks: number = 2
): Promise<string> {
  if (!topicTag || !examId) return ''

  try {
    const supabase = await createClient()

    // Buscar unidades com skills_tags contendo o topicTag
    const { data: units, error } = await supabase
      .from('learning_content')
      .select('title, content, source_type, skills_tags')
      .eq('exam_id', examId)
      .eq('source_type', 'unit')
      .not('content', 'is', null)
      .limit(maxChunks * 3)

    if (error || !units || units.length === 0) {
      // Fallback: buscar módulos ou paths como contexto mais amplo
      const { data: fallback } = await supabase
        .from('learning_content')
        .select('title, summary, source_type, skills_tags')
        .eq('exam_id', examId)
        .in('source_type', ['module', 'learning_path'])
        .limit(maxChunks)

      if (!fallback || fallback.length === 0) return ''

      return fallback
        .map(item => `## ${item.title}\n${(item as { summary?: string }).summary ?? ''}`)
        .join('\n\n')
    }

    // Filtrar unidades que têm correspondência nos skills_tags
    const relevant = units.filter(u => {
      const tags = u.skills_tags as string[] ?? []
      return tags.length === 0 || tags.some(t =>
        t.toLowerCase().includes(topicTag.toLowerCase()) ||
        topicTag.toLowerCase().includes(t.toLowerCase())
      )
    })

    // Se nenhuma unidade tem tags correspondentes, usar todas as unidades encontradas
    const chunks = (relevant.length > 0 ? relevant : units).slice(0, maxChunks)

    // Extrair trechos relevantes do conteúdo
    return chunks
      .map(chunk => {
        const content = chunk.content ?? ''
        // Pegar os primeiros ~2000 caracteres do conteúdo para evitar estourar tokens
        const excerpt = content.length > 2000
          ? content.substring(0, 2000) + '...'
          : content

        return `CONTEÚDO OFICIAL DE APRENDIZADO (Microsoft Learn) — "${chunk.title}":\n"""\n${excerpt}\n"""`
      })
      .join('\n\n')
  } catch (err) {
    console.error('[content-retriever] Error:', err)
    return ''
  }
}

/**
 * Busca conteúdo para múltiplos tópicos fracos.
 * Retorna uma string concatenada pronta para o prompt.
 * Usa learning_content do banco; fallback para skills_measured.
 */
export async function getContentForTopics(
  examId: string,
  weakTopics: string[],
  skillsMeasured?: SkillItem[] | null,
  maxChunks: number = 2
): Promise<string> {
  if (!weakTopics || weakTopics.length === 0) return ''

  const contents: string[] = []

  for (const topic of weakTopics.slice(0, 2)) {
    // Primeiro tenta buscar do learning_content (conteúdo ingerido)
    const content = await getRelevantContent(examId, topic, maxChunks)
    if (content) {
      contents.push(content)
    }
  }

  // Se nada encontrado no learning_content, constrói contexto dos skills_measured
  if (contents.length === 0 && skillsMeasured && skillsMeasured.length > 0) {
    const skillContext = buildSkillsContext(skillsMeasured, weakTopics, weakTopics[0])
    if (skillContext) {
      contents.push(skillContext)
    }
  }

  return contents.join('\n\n')
}
