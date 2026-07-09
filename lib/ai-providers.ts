import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GeneratedQuestion } from '@/types'
import { z } from 'zod'

export type AIProvider = 'openai' | 'anthropic' | 'deepseek'

export interface ProviderConfig {
  provider: AIProvider
  apiKey: string
  model?: string
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-sonnet-5-20251001',
  deepseek: 'deepseek-chat',
}

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

const SYSTEM_PROMPT = `Você é um gerador de questões de certificação Microsoft no estilo PearsonVue.

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

Instruções:
- Use terminologia oficial da Microsoft
- 4 alternativas (A, B, C, D), apenas uma correta
- Não use "todas as anteriores" ou "nenhuma das anteriores"
- Inclua explicação clara e objetiva, justificando por que a resposta correta é a melhor escolha
- topic_tag deve ser DERIVADO do subtopic escolhido e normalizado em slug`

async function callOpenAI(
  apiKey: string,
  model: string,
  prompt: string
): Promise<GeneratedQuestion> {
  const client = new OpenAI({ apiKey })
  const completion = await client.chat.completions.create(
    {
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    },
    { signal: AbortSignal.timeout(15000) }
  )

  const raw = completion.choices[0].message.content
  if (!raw) throw new Error('Empty response from OpenAI')
  return QuestionSchema.parse(JSON.parse(raw))
}

async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string
): Promise<GeneratedQuestion> {
  const client = new Anthropic({ apiKey })
  const msg = await client.messages.create(
    {
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT + '\n\nResponda APENAS com um objeto JSON válido. Sem markdown, sem texto extra.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }
  )

  const raw = msg.content[0]?.type === 'text' ? msg.content[0].text : ''
  if (!raw) throw new Error('Empty response from Anthropic')
  // Anthropic may wrap JSON in markdown code blocks
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return QuestionSchema.parse(JSON.parse(json))
}

async function callDeepSeek(
  apiKey: string,
  model: string,
  prompt: string
): Promise<GeneratedQuestion> {
  // DeepSeek uses OpenAI-compatible API
  const client = new OpenAI({ apiKey, baseURL: 'https://api.deepseek.com' })
  const completion = await client.chat.completions.create(
    {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    },
    { signal: AbortSignal.timeout(15000) }
  )

  const raw = completion.choices[0].message.content
  if (!raw) throw new Error('Empty response from DeepSeek')
  return QuestionSchema.parse(JSON.parse(raw))
}

export async function generateWithProvider(
  config: ProviderConfig,
  prompt: string
): Promise<GeneratedQuestion> {
  const model = config.model ?? DEFAULT_MODELS[config.provider]

  switch (config.provider) {
    case 'openai':
      return callOpenAI(config.apiKey, model, prompt)
    case 'anthropic':
      return callAnthropic(config.apiKey, model, prompt)
    case 'deepseek':
      return callDeepSeek(config.apiKey, model, prompt)
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`)
  }
}

export function getDefaultModel(provider: AIProvider): string {
  return DEFAULT_MODELS[provider]
}

/** Fallback: use the server's own OpenAI key if user hasn't configured BYOK */
export function getFallbackConfig(): ProviderConfig {
  return {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-mini',
  }
}
