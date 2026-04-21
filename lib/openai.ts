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
  - Escolha EXATAMENTE UM subtópicos dos skills fornecidos
  - NÃO use conhecimento fora da lista de skills
  - Priorize tópicos com maior peso (weight) MAS NÃO ignore completamente tópicos de menor peso
  - Use tecnologias, serviços e ferramentas relevantes ao exame (${examId})
  - A pergunta deve refletir cenário real de uso em produção (arquitetura, integração, troubleshooting)

  Gere UMA questão de múltipla escolha no estilo PearsonVue, simulando uma questão REAL de prova da Microsoft.

  Retorne APENAS um objeto JSON com a seguinte estrutura exata (sem markdown, sem texto extra):
  {
    "question": "enunciado da questão",
    "options": {
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    },
    "correct_answer": "X", // onde X é A, B, C ou D
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

  const question = buildPrompt(examId, weakTopics, askedTopics, skills_measured);
  //console.log('[AI INPUT QUESTION]', question);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `
          Você é um gerador de questões de certificação Microsoft no estilo PearsonVue.

          COMPORTAMENTO OBRIGATÓRIO:
          - Gere questões difíceis, no nível real da certificação
          - Sempre use cenários práticos (arquitetura, implementação, troubleshooting)
          - Evite perguntas teóricas simples

          DIFICULDADE (CRÍTICO):
          - NÃO gere perguntas triviais ou conceituais simples
          - A questão deve exigir análise e tomada de decisão
          - Se a resposta puder ser identificada rapidamente, a questão é inválida

          FORMATO DA QUESTÃO:
          - Baseada em cenário prático real (empresa, arquitetura, problema concreto)
          - Pode envolver múltiplos serviços ou componentes relevantes ao exame
          - Deve exigir comparação entre alternativas

          ALTERNATIVAS:
          - TODAS devem parecer corretas à primeira vista
          - Diferenças devem ser sutis (configuração, arquitetura, trade-offs)
          - Pelo menos 3 alternativas devem ser altamente plausíveis
          - Inclua alternativas que representem erros comuns de implementação ou arquitetura
          - NÃO use alternativas obviamente erradas

          DISTRIBUIÇÃO:
          - A resposta correta deve ser distribuída aleatoriamente entre A, B, C e D
          - NÃO repetir padrão de resposta correta

          VALIDAÇÃO INTERNA (ANTES DE RESPONDER):
          - Pelo menos 3 alternativas são plausíveis
          - A resposta exige análise técnica
          - Não há opção obviamente errada

          Instruções:
          - Use terminologia oficial da Microsoft
          - 4 alternativas (A, B, C, D), apenas uma correta
          - Não use "todas as anteriores" ou "nenhuma das anteriores"
          - Inclua explicação clara e objetiva, justificando por que a resposta correta é a melhor escolha
          - topic_tag deve ser DERIVADO do subtopic escolhido e normalizado em slug`,
      },
      {
        role: 'user',
        content: question,
      },
    ],
    temperature: 0.2,
  }, {
    signal: AbortSignal.timeout(15000),
  });
 
  const raw = completion.choices[0].message.content;

  if (!raw) {
    throw new Error('Empty response from OpenAI');
  }

  const parsed = JSON.parse(raw);
  return QuestionSchema.parse(parsed);

  // console.log('[RAW COMPLETION]', parsed);

  // return {
  //   question: "test",
  //   options: { A: "A", B: "B", C: "C", D: "D" },
  //   correct_answer: "A",
  //   explanation: "test",
  //   topic_tag: "test"
  // };  
}