import OpenAI from 'openai';
import { z } from 'zod';
import { GeneratedQuestion } from '@/types';
import { ExamTopic } from './exam-topics';

interface SkillItem {
  topic: string
  weight: string
  subtopics: string[]
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const QuestionSchema = z.object({
  question: z.string().min(10),
  options: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
    D: z.string().min(1),
  }),
  correct_answer: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().min(10),
  topic_tag: z.string().min(2),
});

function formatTopics(enriched: SkillItem[]) {
  return enriched
    .map(t => {
      const subs = t.subtopics.map(s => `  - ${s}`).join('\n')
      return `Tópico: ${t.topic} (peso: ${t.weight}%)\nSubtópicos:\n${subs}`
    })
    .join('\n\n')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+&\s+/g, '-')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function buildPrompt(
  examId: string,
  weakTopics: string[],
  askedTopics: string[] = [],
  skills_measured?: SkillItem[] | null
): string {
  const topicLine = weakTopics.length > 0
    ? `Priorize os seguintes tópicos (onde o usuário tem maior dificuldade): ${weakTopics.join(', ')}.`
    : 'Escolha um tópico relevante para o exame.';

  const avoidLine = askedTopics.length > 0
    ? `\n\nIMPORTANTE: Evite completamente os tópicos já perguntados: ${askedTopics.join(', ')}. Gere uma questão sobre um tópico diferente.`
    : '';

  const skillsSection =
    skills_measured && skills_measured.length > 0
      ? `\n\nSKILLS OFICIAIS DO EXAME (USO OBRIGATÓRIO):\n${formatTopics(skills_measured)}`
      : ''

  return `Exame de certificação Microsoft: ${examId}. ${topicLine}${avoidLine}${skillsSection}

REGRAS OBRIGATÓRIAS:
- A questão DEVE ser baseada EXCLUSIVAMENTE nos skills listados acima
- Escolha EXATAMENTE UM subtopic dos skills fornecidos
- NÃO use conhecimento fora da lista de skills
- Priorize tópicos com maior peso (weight) — quanto maior o peso, maior a chance de ser cobrado
- A pergunta deve refletir cenário real de uso em produção (arquitetura, integração, troubleshooting)
- Use tecnologias reais (ex: Azure AI Foundry, Azure AI Search, Azure OpenAI, RAG, agentes, etc.)

Gere UMA questão de múltipla escolha no estilo PearsonVue, simulando uma questão REAL de prova da Microsoft.

A questão deve:
- Ser baseada em cenário prático (empresa real, ambiente, problema concreto)
- Exigir raciocínio técnico (não apenas definição teórica)
- Ter alternativas plausíveis e próximas entre si (evitar opções óbvias)
- Incluir pelo menos uma alternativa que represente um erro comum
- Refletir o nível do exame (${examId})

Instruções:
- Use terminologia oficial da Microsoft sempre que possível
- 4 alternativas (A, B, C, D), apenas uma correta
- Não use "todas as anteriores" ou "nenhuma das anteriores"
- Inclua explicação clara e objetiva, justificando por que a resposta correta é a melhor escolha
- topic_tag deve ser DERIVADO do subtopic escolhido e normalizado em slug (ex: "rag-implementation", "agent-orchestration", "ai-foundry-deployment")

Retorne APENAS um objeto JSON com a seguinte estrutura exata (sem markdown, sem texto extra):
{
  "question": "enunciado da questão",
  "options": {
    "A": "...",
    "B": "...",
    "C": "...",
    "D": "..."
  },
  "correct_answer": "A",
  "explanation": "explicação detalhada da resposta correta",
  "topic_tag": "nome-do-topico-em-slug"
}`;
}

export async function generateQuestion(
  examId: string,
  weakTopics: string[],
  askedTopics: string[] = [],
  skills_measured?: SkillItem[] | null
): Promise<GeneratedQuestion> {
  if (skills_measured && skills_measured.length > 0) {
    console.log('[AI INPUT SKILLS]', JSON.stringify(skills_measured, null, 2))
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Você é um gerador de questões de certificação Microsoft no estilo PearsonVue. Retorne APENAS JSON válido, sem markdown. Gere questões ORIGINAIS e VARIADAS.',
      },
      {
        role: 'user',
        content: buildPrompt(examId, weakTopics, askedTopics, skills_measured),
      },
    ],
    temperature: 0.9,
  }, {
    signal: AbortSignal.timeout(15000),
  });

  const raw = completion.choices[0].message.content;

  if (!raw) {
    throw new Error('Empty response from OpenAI');
  }

  const parsed = JSON.parse(raw);
  return QuestionSchema.parse(parsed);
}