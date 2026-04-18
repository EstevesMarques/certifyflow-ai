# CertifyFlow AI — Especificação Técnica

**Versão:** 1.0
**Data:** 2026-04-18
**Status:** Em Desenvolvimento

---

## 1. Visão Geral do Produto

**CertifyFlow AI** é um PWA (Progressive Web App) para simulação de exames de certificação Microsoft, focado em aprendizado adaptativo baseado em IA.

### 1.1 Problema
Profissionais de TI brasileiros precisam de uma ferramenta eficiente para se preparar para certificações Microsoft, com questões alinhadas ao formato real dos exames e foco nos tópicos onde têm maior dificuldade.

### 1.2 Solução
Motor de questões adaptativo que:
- Gera questões usando IA (GPT-4o)
- Prioriza tópicos com base no histórico de erros do usuário
- Simula a experiência real do exame (timer, barra de progresso, navegação)

### 1.3 Público-Alvo
Profissionais de TI brasileiros que buscam certificações Microsoft (AZ-900, AZ-104, AZ-305, etc.)

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, Heroicons |
| UI | Shadcn/UI (Button, Badge) |
| Backend | Next.js Route Handlers (Serverless) |
| Banco de Dados | Supabase (PostgreSQL + Auth + RLS) |
| IA | OpenAI API — GPT-4o |
| Catálogo | Microsoft Learn Catalog API + Fallback estático |
| Deploy | Vercel |

---

## 3. Arquitetura do Sistema

### 3.1 Diagrama de Fluxo

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Usuário   │────▶│  Next.js    │────▶│  Supabase   │
│   Browser   │◀────│  (SSR/API)  │◀────│  (Postgres) │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  OpenAI API  │
                    │  (GPT-4o)   │
                    └──────────────┘
```

### 3.2 Estrutura de Pastas

```
certifyflow-ai/
├── app/
│   ├── (auth)/                    # Rotas públicas
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                    # Rotas protegidas
│   │   ├── layout.tsx            # Layout com sidebar responsivo
│   │   ├── dashboard/page.tsx    # Dashboard principal
│   │   ├── catalog/page.tsx      # Catálogo de exames
│   │   ├── simulado/page.tsx     # Página inicial do simulado
│   │   ├── progress/page.tsx     # Histórico de progresso
│   │   ├── settings/page.tsx     # Configurações da conta
│   │   └── exam/[examId]/
│   │       ├── page.tsx         # Setup do exame
│   │       └── session/
│   │           └── page.tsx     # Sessão de simulação
│   ├── api/
│   │   ├── catalog/route.ts      # Proxy para Microsoft API
│   │   ├── generate-question/
│   │   │   └── route.ts         # Geração de questões IA
│   │   └── results/
│   │       └── route.ts          # Salvar resultados
│   └── globals.css
├── components/
│   ├── dashboard/
│   │   ├── StatCard.tsx          # Card de estatística
│   │   ├── PerformanceChart.tsx  # Gráfico de barras
│   │   ├── TopicBreakdown.tsx    # Breakdown por tópico
│   │   ├── HistoryTable.tsx      # Tabela de histórico
│   │   └── CTABanner.tsx         # Banner de ação
│   ├── exam/
│   │   ├── QuestionCard.tsx       # Card de questão
│   │   ├── Timer.tsx             # Cronômetro
│   │   ├── ProgressBar.tsx        # Barra de progresso
│   │   └── OptionItem.tsx         # Item de opção
│   ├── ui/
│   │   └── button.tsx            # Componente Button
│   ├── Header.tsx                # Header global
│   ├── Sidebar.tsx               # Sidebar com navegação
│   ├── ResponsiveLayout.tsx       # Layout responsivo
│   └── ThemeToggle.tsx           # Toggle de tema
├── lib/
│   ├── supabase/
│   │   ├── browser-client.ts     # Cliente Supabase (browser)
│   │   └── server-client.ts      # Cliente Supabase (server)
│   ├── openai.ts                 # Funções OpenAI
│   └── catalog.ts                 # Fetch do catálogo
├── types/
│   └── index.ts                  # Tipos TypeScript
└── proxy.ts                      # Middleware (auth)
```

---

## 4. Schema do Banco de Dados (Supabase)

### 4.1 Tabela: `profiles`

Armazena metadados adicionais do usuário (estende `auth.users`).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | uuid | PK, FK → auth.users | ID do usuário |
| email | text | — | Email do usuário |
| display_name | text | nullable | Nome de exibição |
| created_at | timestamptz | default: now() | Data de criação |
| updated_at | timestamptz | nullable | Data de atualização |

### 4.2 Tabela: `exams`

Catálogo de exames disponíveis (cache da Microsoft API).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | text | PK | Código do exame (ex: "AZ-900") |
| title | text | — | Título completo |
| description | text | nullable | Descrição do exame |
| exam_code | text | unique | Código oficial Microsoft |
| provider | text | — | Provedor (sempre "Microsoft") |
| total_questions | integer | nullable | Total de questões |
| duration_minutes | integer | nullable | Duração em minutos |
| passing_score | integer | nullable | Score mínimo para aprovação |
| created_at | timestamptz | default: now() | Data de criação |
| updated_at | timestamptz | nullable | Data de atualização |

**RLS:** Leitura pública (sem autenticação).

### 4.3 Tabela: `exam_sessions`

Registra cada tentativa de simulado do usuário.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | uuid | PK, default: gen_random_uuid() | ID da sessão |
| user_id | uuid | FK → profiles.id | Usuário |
| exam_id | text | FK → exams.id | Exame realizado |
| started_at | timestamptz | default: now() | Início do simulado |
| completed_at | timestamptz | nullable | Término do simulado |
| score | integer | nullable | Percentual de acerto (0-100) |
| passed | boolean | nullable | Aprovado (score ≥ 70) |
| total_q | integer | nullable, default: 20 | Total de questões |
| created_at | timestamptz | default: now() | Data de criação |
| updated_at | timestamptz | nullable | Data de atualização |

**RLS:** `user_id = auth.uid()`

### 4.4 Tabela: `question_attempts`

Log granular de cada questão respondida.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| id | uuid | PK, default: gen_random_uuid() | ID do registro |
| session_id | uuid | FK → exam_sessions.id | Sessão relacionada |
| question_id | text | NOT NULL | ID da questão (gerado) |
| question_text | text | — | Texto da questão |
| topic_tag | text | nullable | Tag do tópico (ex: "Azure Networking") |
| selected_option | text | nullable | Opção selecionada pelo usuário |
| correct_option | text | nullable | Opção correta |
| is_correct | boolean | nullable | Se a resposta está correta |
| time_spent_seconds | integer | nullable | Tempo gasto na questão |
| created_at | timestamptz | default: now() | Data de criação |
| updated_at | timestamptz | nullable | Data de atualização |

**Nota:** Esta tabela NÃO tem `user_id` ou `exam_id` diretamente — o acesso é via `session_id` → `exam_sessions`.

**RLS:** Acessível via policy em `exam_sessions`.

---

## 5. Screens e Funcionalidades

### 5.1 Autenticação

#### `/login`
- Formulário com email e senha
- Botão "Entrar"
- Link para página de registro
- Validação de campos
- Mensagem de erro em caso de falha

#### `/register`
- Formulário com email e senha
- Confirmação de senha
- Botão "Criar conta"
- Redirect para `/dashboard` após sucesso

### 5.2 Dashboard (`/dashboard`)

**Purpose:** Visão geral do desempenho do usuário.

**Componentes:**
1. **Header** — Título "Dashboard" + Toggle de tema
2. **CTABanner** — Se há simulados, mostra último exame + tópicos fracos
3. **StatCards** (4 cards em grid):
   - Simulados feitos: total de sessões completadas
   - Média geral: média dos scores
   - Questões respondidas: total + % de acerto
   - Melhor exame: código do exame com maior score
4. **PerformanceChart** — Gráfico de barras com evolução dos scores
5. **TopicBreakdown** — Barras coloridas por tópico (% de acerto)
6. **HistoryTable** — Tabela com histórico de simulados

**Fluxo de dados:**
```
exam_sessions (completados) → stats agregadas
question_attempts (via session_id) → topic stats
```

### 5.3 Catálogo (`/catalog`)

**Purpose:** Listar exames disponíveis.

**Componentes:**
- Título + descrição
- Grid de cards de exames
- Cada card mostra: código, título, nível (badge colorido), descrição

**Fluxo:**
```
fetchExams() → Microsoft API ou STATIC_EXAMS fallback
```

### 5.4 Setup do Exame (`/exam/[examId]`)

**Purpose:** Configurar e iniciar um simulado.

**Componentes:**
- Informações do exame selecionado
- Seleção de quantidade de questões (10, 20, 40)
- Botão "Iniciar Simulado"

**Fluxo:**
1. Usuário seleciona quantidade
2. Clica "Iniciar Simulado"
3. Cria registro em `exam_sessions` (sem `completed_at`)
4. Redirect para `/exam/[examId]/session?sessionId=X&totalQ=Y`

### 5.5 Sessão de Simulado (`/exam/[examId]/session`)

**Purpose:** Realização do simulado com timer e questões.

**Parâmetros de query:**
- `sessionId`: UUID da sessão
- `totalQ`: Quantidade de questões

**Estados:**
1. **Loading** — Preparando simulado
2. **Question** — Questão em andamento
3. **Result** — Tela de resultado

**Componentes:**
- **Timer** — Cronômetro regressivo (90s por questão)
- **ProgressBar** — "Questão N de Total"
- **QuestionCard** — Texto da questão + 4 opções (A, B, C, D)
- **OptionItem** — Opção selecionável com feedback visual
- **FlagButton** — Marcar questão para revisão

**Fluxo de uma questão:**
```
fetch /api/generate-question → mostra questão
usuário seleciona opção → próxima
repete até totalQ ou timer expira
submitResults() → POST /api/results
```

**Timeout:** Se timer chega a 0, submete automaticamente com respostas atuais.

### 5.6 Tela de Resultado

**Purpose:** Exibir resultado do simulado.

**Componentes:**
- Header gradient azul com:
  - Score grande (ex: "85%")
  - Quantidade de corretas (ex: "8 de 10")
  - Badge "Aprovado" ou "Abaixo do mínimo (70%)"
- **TopicBreakdown** — Desempenho por área
- Botões:
  - "Refazer" → volta para setup
  - "Ver dashboard" → redirect para `/dashboard`

### 5.7 Progresso (`/progress`)

**Purpose:** Histórico detalhado de progresso.

**Componentes:**
- Título + descrição
- **TopicBreakdown** — Visão geral por tópico
- **HistoryTable** — Lista completa de sessões

### 5.8 Configurações (`/settings`)

**Purpose:** Gerenciar conta e preferências.

**Componentes:**
- Informações da conta (email)
- Preferências (checkboxes):
  - Notificações de progresso
  - Modo escuro automático
- Botão "Sair" (logout)

---

## 6. API Routes

### 6.1 `GET /api/catalog`

Busca exames da Microsoft Catalog API.

**Response (sucesso):**
```json
{
  "exams": [
    {
      "id": "AZ-900",
      "title": "Microsoft Azure Fundamentals",
      "description": "...",
      "level": "Fundamentals"
    }
  ]
}
```

**Fallback:** Se API falhar, retorna lista estática de 15 exames.

### 6.2 `POST /api/generate-question`

Gera uma questão usando OpenAI GPT-4o.

**Request:**
```json
{
  "examId": "AZ-900",
  "sessionId": "uuid",
  "askedTopics": ["Azure Networking"]
}
```

**Fluxo interno:**
1. Query `question_attempts` para calcular tópicos fracos
2. Monta prompt para OpenAI com tópicos priorizados
3. Chama OpenAI com `response_format: json_object`
4. Valida resposta com Zod
5. Retorna questão gerada

**Response:**
```json
{
  "id": "uuid",
  "question": "Qual é a principal função do Azure Resource Group?",
  "options": {
    "A": "Gerenciar redes virtuais",
    "B": "Agrupar recursos logicamente",
    "C": "Autenticar usuários",
    "D": "Monitorar custos"
  },
  "correct_answer": "B",
  "explanation": "Resource Groups são contêineres...",
  "topic_tag": "Azure Resource Management"
}
```

### 6.3 `POST /api/results`

Salva os resultados de uma sessão.

**Request:**
```json
{
  "sessionId": "uuid",
  "examId": "AZ-900",
  "answers": [
    {
      "question_text": "...",
      "topic_tag": "Azure Networking",
      "correct_answer": "C",
      "user_answer": "C",
      "is_correct": true
    }
  ]
}
```

**Fluxo interno:**
1. Calcula score: `(corretas / total) * 100`
2. Insert em `question_attempts` (batch)
3. Update em `exam_sessions`: `score`, `total_q`, `completed_at`
4. `revalidatePath('/dashboard')` e `revalidatePath('/progress')`
5. Retorna análise de tópicos

**Response:**
```json
{
  "score": 85,
  "topicStats": [
    { "topic_tag": "Azure Networking", "total": 3, "correct": 3, "pct": 100 }
  ]
}
```

---

## 7. Motor Adaptativo

### 7.1 Lógica

1. **Primeiro simulado:** Questões de tópicos genéricos do exame
2. **Simulados subsequentes:** Prioriza 3 tópicos com menor taxa de acerto

### 7.2 Implementação

```typescript
// pseudo-code
function getWeakTopics(attempts, askedTopics):
  stats = aggregate by topic_tag
  sorted = sort by (correct/total) ascending
  weak3 = take first 3, excluding askedTopics
  return weak3
```

### 7.3 Geração de Prompt

```
System: "Você é um gerador de questões de certificação Microsoft..."

User: "Exame: AZ-900. Priorize: Azure Networking, Azure Security.
Gere uma questão de múltipla escolha..."
```

---

## 8. Tema e Design System

### 8.1 Cores

**Tema Claro:**
- `--bg-page: #f8fafc`
- `--bg-card: #ffffff`
- `--border: #e2e8f0`
- `--text-primary: #111827`
- `--text-muted: #6b7280`
- `--accent: #0078d4` (azul Microsoft)

**Tema Escuro:**
- `--bg-page: #0f1117`
- `--bg-card: #1a1d27`
- `--border: #2d3148`
- `--text-primary: #f1f5f9`
- `--text-muted: #94a3b8`

### 8.2 Tipografia
- Font: Inter (fallback: Segoe UI, system-ui)
- Headings: font-bold
- Labels: text-xs, uppercase, tracking-wider
- Body: text-sm

### 8.3 Espaçamento
- Cards: `rounded-[10px]`, padding `18px`
- Gap entre itens: `gap-2.5` (Tailwind)
- Border-radius padrão: `rounded-[10px]`

---

## 9. Responsividade

### 9.1 Breakpoints
- **Mobile:** < 1024px (sidebar oculto, hamburger menu)
- **Desktop:** ≥ 1024px (sidebar visível)

### 9.2 Layout Mobile
- Sidebar em overlay (slide da esquerda)
- Header com hamburger + título
- Conteúdo full-width
- Grid: 1 coluna por padrão

### 9.3 Layout Desktop
- Sidebar fixo à esquerda (220px)
- Header com título + toggle de tema
- Conteúdo responsivo
- Grid: 4 colunas para stats, 2 para charts

---

## 10. Segurança

### 10.1 Autenticação
- Supabase Auth (email/senha)
- Middleware verifica sessão em todas as rotas `(app)`
- Redirect para `/login` se não autenticado

### 10.2 Row Level Security (RLS)
- `profiles`: `user_id = auth.uid()`
- `exam_sessions`: `user_id = auth.uid()`
- `exams`: leitura pública
- `question_attempts`: via `session_id` → `exam_sessions`

### 10.3 Validação
- Zod schemas em todas as API routes
- Sanitização de inputs
- Parâmetros de URL validados

---

## 11. Fluxo Completo do Usuário

```
1. Acessa / → redirect para /login
2. Faz login → redirect para /dashboard
3. Vê dashboard vazio ou com stats
4. Vai para /catalog → vê lista de exames
5. Seleciona AZ-900 → /exam/AZ-900
6. Escolhe 10 questões → inicia sessão
7. /exam/AZ-900/session?sessionId=X&totalQ=10
8. Responde 10 questões (timer: 90s cada)
9. Submete ou timer expira
10. Vê tela de resultado (score, %)
11. Redirect para /dashboard com stats atualizadas
```

---

## 12. Variáveis de Ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL=https://czcqxrosrxhzppmyqaol.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave-anonima>
OPENAI_API_KEY=sk-...
```

---

## 13. Scripts Disponíveis

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npm test         # Jest tests
npm run test:watch  # Jest watch mode
```

---

## 14. Status de Implementação

### Funcionalidades MVP

| Funcionalidade | Status |
|----------------|--------|
| Autenticação (Supabase Auth) | ✅ Completo |
| Dashboard com stats | ✅ Completo |
| Catálogo de exames | ✅ Completo |
| Motor adaptativo (GPT-4o) | ✅ Completo |
| Sessão de simulado | ✅ Completo |
| Timer por questão | ✅ Completo |
|结果 tracking | ✅ Completo |
| Tema light/dark | ✅ Completo |
| Responsividade | ✅ Completo |
| Header global | ✅ Completo |

### Funcionalidades Futuras

| Funcionalidade | Prioridade |
|----------------|------------|
| Certificate generation | Baixa |
| Export results PDF | Baixa |
| Modo offline/PWA | Média |
| OAuth Microsoft | Média |
| Analytics dashboard | Baixa |

---

## 15. Limitações Conhecidas

1. **Microsoft Catalog API** pode retornar erros — fallback para lista estática
2. **Question flagging** (marcar para revisão) tem UI mas não persiste no backend
3. **Per-topic timers** não estão implementados — timer global por questão
4. **OAuth Microsoft** não implementado — apenas email/senha

---

*Documento gerado em 2026-04-18*
