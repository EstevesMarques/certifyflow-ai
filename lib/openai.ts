import OpenAI from 'openai'
import { z } from 'zod'
import { GeneratedQuestion } from '@/types'

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
})

export function buildPrompt(examId: string, weakTopics: string[]): string {
  const topicLine =
    weakTopics.length > 0
      ? `Priorize os seguintes tópicos (onde o usuário tem maior dificuldade): ${weakTopics.join(', ')}.`
      : 'Escolha um tópico relevante para o exame.'

  return `Exame de certificação Microsoft: ${examId}. ${topicLine}

Gere UMA questão de múltipla escolha no estilo PearsonVue. A questão deve ser objetiva, técnica e ter exatamente 4 alternativas plausíveis, com apenas uma correta.

Retorne APENAS um objeto JSON com a seguinte estrutura exata (sem markdown, sem texto extra):
{
  "question": "enunciado da questão",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "correct_answer": "A",
  "explanation": "explicação detalhada da resposta correta",
  "topic_tag": "nome do tópico"
}`
}

export async function generateQuestion(
  examId: string,
  weakTopics: string[]
): Promise<GeneratedQuestion> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Você é um gerador de questões de certificação Microsoft no estilo PearsonVue. Retorne APENAS JSON válido, sem markdown.',
      },
      { role: 'user', content: buildPrompt(examId, weakTopics) },
    ],
    temperature: 0.8,
  })

  const raw = completion.choices[0].message.content
  if (!raw) throw new Error('Empty response from OpenAI')
  const parsed = JSON.parse(raw)
  return QuestionSchema.parse(parsed)
}
