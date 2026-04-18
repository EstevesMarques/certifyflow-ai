# CertifyFlow AI — Design Spec

**Data:** 2026-04-17  
**Status:** Aprovado

---

## Visão Geral

PWA para simulação de exames de certificação Microsoft com motor de questões adaptativo baseado em IA. Público-alvo: profissionais de TI brasileiros que buscam certificações Microsoft.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Shadcn/UI, Framer Motion |
| Backend | Next.js Route Handlers (Serverless) |
| Banco de dados | Supabase (PostgreSQL + Auth) |
| IA | OpenAI API — GPT-4o (chave única da aplicação via env) |
| Catálogo | Microsoft Catalog API + fallback estático |
| Deploy | Vercel |

---

## Arquitetura

Monolito Next.js puro (App Router). Server Components buscam dados do Supabase diretamente. Route Handlers lidam com OpenAI e Microsoft Catalog. Sem camada de serviço separada.

### Estrutura de Pastas

```
certifyflow-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                        # rotas protegidas por middleware
│   │   ├── layout.tsx                # sidebar + auth guard
│   │   ├── dashboard/page.tsx
│   │   ├── catalog/page.tsx
│   │   └── exam/[examId]/
│   │       ├── page.tsx              # setup do simulado
│   │       └── session/page.tsx     # simulado em andamento
│   ├── api/
│   │   ├── generate-question/route.ts
│   │   ├── catalog/route.ts
│   │   └── results/route.ts
│   └── layout.tsx
├── components/
│   ├── exam/          # QuestionCard, Timer, ProgressBar, ReviewFlag
│   ├── dashboard/     # PerformanceChart, TopicBreakdown, HistoryTable
│   └── ui/            # shadcn re-exports
├── lib/
│   ├── supabase/      # browser-client.ts + server-client.ts
│   ├── openai.ts
│   └── catalog.ts     # Microsoft Catalog API + lista estática fallback
└── types/index.ts
```

---

## Autenticação

Supabase Auth com email e senha. Middleware Next.js verifica sessão em todas as rotas do grupo `(app)`. Redirect para `/login` se não autenticado.

---

## Schema do Banco de Dados (Supabase)

```sql
-- Perfil do usuário (estende auth.users)
profiles
  id          uuid  PK  references auth.users
  full_name   text
  created_at  timestamptz

-- Cache de exames disponíveis
exams
  id          text  PK   -- ex: "AZ-900"
  title       text
  description text
  level       text       -- Fundamentals | Associate | Expert
  updated_at  timestamptz

-- Sessões de simulado
exam_sessions
  id           uuid  PK
  user_id      uuid  references profiles
  exam_id      text  references exams
  score        int        -- % de acerto
  total_q      int
  started_at   timestamptz
  completed_at timestamptz

-- Log granular de questões respondidas
question_attempts
  id              uuid  PK
  session_id      uuid  references exam_sessions
  user_id         uuid  references profiles
  exam_id         text
  topic_tag       text       -- ex: "Azure Networking"
  is_correct      boolean
  question_text   text
  correct_answer  text
  user_answer     text
  attempted_at    timestamptz
```

**RLS:** Todas as tabelas com policy `user_id = auth.uid()`.

---

## Rotas de API

### `GET /api/catalog`
- Tenta `GET https://learn.microsoft.com/api/catalog/?type=examinations`
- Em caso de falha: retorna lista estática com ~15 exames (AZ-900, AZ-104, AZ-305, AZ-500, MS-900, SC-900, DP-900, AI-900, PL-900, AZ-700, AZ-800, AZ-801, MS-102, SC-300, DP-300)
- Cache: `next: { revalidate: 86400 }` (24h)

### `POST /api/generate-question`

**Body:** `{ examId: string, sessionId: string }`

**Fluxo:**
1. Buscar os 3 `topic_tag` com maior taxa de erro do usuário via `question_attempts` (GROUP BY topic_tag, filtrado por user_id + exam_id, ORDER BY erro% DESC)
2. Se usuário não tem histórico, usar tópicos genéricos do exame
3. Montar prompt:
   - **System:** "Você é um gerador de questões de certificação Microsoft no estilo PearsonVue. Retorne APENAS JSON válido, sem markdown."
   - **User:** `"Exame: {examId}. Priorize os tópicos: {weakTopics}. Gere uma questão de múltipla escolha. JSON estrito: { question, options: { A, B, C, D }, correct_answer, explanation, topic_tag }"`
4. Chamar OpenAI com `response_format: { type: "json_object" }`
5. Validar schema com Zod
6. Retornar questão validada

### `POST /api/results`
- Recebe `{ sessionId, answers: QuestionAnswer[] }`
- Insere todos os `question_attempts` em batch
- Calcula score e atualiza `exam_sessions`
- Retorna análise de áreas fracas (topic_tag + % acerto)

---

## Interface

### Design System
- **Cores:** Azul Microsoft `#0078d4` como accent. Cinzas profissionais. Fundo branco no tema claro.
- **Tipografia:** Inter (fallback: Segoe UI)
- **Tema:** Light/Dark com toggle persistido em `localStorage`. CSS custom properties com transição 0.25s.
- **Componentes:** Shadcn/UI com Tailwind. Mobile-first.

### Tema Claro
- `--bg-page: #f8fafc`, `--bg-card: #ffffff`, `--border: #e2e8f0`
- `--text-primary: #111827`, `--text-muted: #6b7280`

### Tema Escuro
- `--bg-page: #0f1117`, `--bg-card: #1a1d27`, `--border: #2d3148`
- `--text-primary: #f1f5f9`, `--text-muted: #94a3b8`

### Telas

**Dashboard** (aprovado em mockup)
- Sidebar com navegação e avatar
- CTA inteligente: exame em andamento + tópicos fracos priorizados pelo motor
- 4 stat cards: simulados feitos, média geral, questões respondidas, melhor exame
- Gráfico de barras: evolução de scores por simulado
- Breakdown por tópico: barras coloridas (vermelho < 60%, amarelo 60–79%, verde ≥ 80%)
- Tabela de histórico com badges Aprovado/Reprovado

**Catálogo**
- Grid de cards de exames (nome, nível, descrição)
- Fonte: Microsoft Catalog API com fallback estático

**Simulador — Setup** (`/exam/[examId]`)
- Seleção de quantidade de questões (10, 20, 40)
- Botão de iniciar

**Simulador — Sessão** (`/exam/[examId]/session`) (aprovado em mockup)
- Topbar: badge do exame + título + timer regressivo
- Barra de progresso fina (questão N de Total)
- Questão com opções A/B/C/D selecionáveis
- Botão "Marcar para revisão"
- Navegação: Próxima →
- Transição suave entre questões (Framer Motion fade)

**Resultado Final** (aprovado em mockup)
- Header gradient azul com score grande e status (Aprovado/Reprovado)
- Barras de desempenho por área de conhecimento
- Botões: "Refazer simulado" e "Ver dashboard"

---

## Lógica Adaptativa

O motor adaptativo funciona por acumulação de histórico:
- Primeiros simulados: tópicos aleatórios do exame
- A partir do 2º simulado no mesmo exame: `/api/generate-question` prioriza os 3 tópicos com menor taxa de acerto em `question_attempts`
- Sem cap de repetição por sessão — a IA pode gerar questões diferentes sobre o mesmo tópico

---

## Decisões Fora de Escopo (MVP)

- OAuth com Microsoft (Azure AD) — não incluído
- Chave OpenAI por usuário — não incluído
- Tavily Search API — não incluído
- Modo offline/PWA service worker avançado — não incluído
- Monetização / planos — não incluído
