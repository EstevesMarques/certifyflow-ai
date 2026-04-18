import OpenAI from 'openai';
import { z } from 'zod';
import { GeneratedQuestion } from '@/types';
import { enrichTopics } from './exam-topics';

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

function formatTopics(enriched: { topic: string; subtopics: string[] }[]) {
  return enriched
    .map(t => {
      const subs = t.subtopics.map(s => `  - ${s}`).join('\n')
      return `Tópico: ${t.topic}\nSubtópicos:\n${subs}`
    })
    .join('\n\n')
}

export function buildPrompt(
  examId: string,
  weakTopics: string[],
  askedTopics: string[] = [],
  enrichedTopics?: ReturnType<typeof enrichTopics>
): string {
  const enriched = enrichedTopics ?? enrichTopics(examId, weakTopics);

  const topicLine = weakTopics.length > 0
    ? `Priorize os seguintes tópicos (onde o usuário tem maior dificuldade): ${weakTopics.join(', ')}.`
    : 'Escolha um tópico relevante para o exame.';

  const avoidLine = askedTopics.length > 0
    ? `\n\nIMPORTANTE: Evite completamente os tópicos já perguntados: ${askedTopics.join(', ')}. Gere uma questão sobre um tópico diferente.`
    : '';

  const structuredContext =
    enriched.length > 0
      ? `\n\nContexto estruturado do exame:\n${formatTopics(enriched)}`
      : ''

  return `Exame de certificação Microsoft: ${examId}. ${topicLine}${avoidLine}${structuredContext}

Gere UMA questão de múltipla escolha no estilo PearsonVue, simulando uma questão REAL de prova da Microsoft.

A questão deve:
- Ser baseada em cenário prático sempre que possível (use contexto realista: empresa, ambiente, requisitos)
- Exigir raciocínio técnico (não apenas definição teórica)
- Ter alternativas plausíveis e próximas entre si (evitar opções óbvias)
- Incluir pelo menos uma alternativa que represente um erro comum
- Refletir o nível do exame (${examId})

Instruções:
- Foque nos subtópicos listados no contexto estruturado
- Use terminologia oficial da Microsoft sempre que possível
- 4 alternativas (A, B, C, D), apenas uma correta
- Não use "todas as anteriores" ou "nenhuma das anteriores"
- Inclua explicação clara e objetiva, justificando por que a resposta correta é a melhor escolha
- O topic_tag deve refletir o tópico específico da questão

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
  "topic_tag": "nome do tópico"
}`;
}

export async function generateQuestion(
  examId: string,
  weakTopics: string[],
  askedTopics: string[] = []
): Promise<GeneratedQuestion> {
  const enriched = enrichTopics(examId, weakTopics);

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
        content: buildPrompt(examId, weakTopics, askedTopics, enriched),
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