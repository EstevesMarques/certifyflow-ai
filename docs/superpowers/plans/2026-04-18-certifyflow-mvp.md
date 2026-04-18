# CertifyFlow AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the CertifyFlow AI MVP — PWA para simulação de exames de certificação Microsoft com motor de questões adaptativo via OpenAI GPT-4o.

**Architecture:** Monolito Next.js 14 (App Router) no Vercel. Server Components buscam dados do Supabase diretamente; Route Handlers lidam com OpenAI e Microsoft Catalog API. Tema light/dark via CSS custom properties + localStorage.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion, Supabase (PostgreSQL + Auth), OpenAI API (GPT-4o), Zod, Jest + React Testing Library

---

## File Map

### Infrastructure
- `middleware.ts` — protege rotas `(app)`, redireciona para `/login`
- `lib/supabase/browser-client.ts` — Supabase client para Client Components
- `lib/supabase/server-client.ts` — Supabase client para Server Components e Route Handlers
- `types/index.ts` — tipos TypeScript compartilhados

### Lib & API
- `lib/catalog.ts` — fetch Microsoft Catalog API + lista estática de fallback
- `lib/openai.ts` — client OpenAI + prompt builder
- `app/api/catalog/route.ts` — GET: lista de exames
- `app/api/generate-question/route.ts` — POST: geração adaptativa de questão
- `app/api/results/route.ts` — POST: persiste resultados da sessão

### Theme & Layout
- `app/globals.css` — CSS custom properties light/dark + estilos base
- `components/ThemeProvider.tsx` — define `data-theme` no `<html>` via localStorage
- `components/ThemeToggle.tsx` — botão de alternar tema
- `components/Sidebar.tsx` — sidebar de navegação
- `app/layout.tsx` — root layout com ThemeProvider
- `app/(auth)/layout.tsx` — layout público (login/register)
- `app/(app)/layout.tsx` — layout protegido com Sidebar

### Páginas
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/catalog/page.tsx`
- `app/(app)/exam/[examId]/page.tsx` — setup do simulado
- `app/(app)/exam/[examId]/session/page.tsx` — simulado + resultado

### Componentes Dashboard
- `components/dashboard/StatCard.tsx`
- `components/dashboard/PerformanceChart.tsx`
- `components/dashboard/TopicBreakdown.tsx`
- `components/dashboard/HistoryTable.tsx`
- `components/dashboard/CTABanner.tsx`

### Componentes Exam
- `components/exam/OptionItem.tsx`
- `components/exam/QuestionCard.tsx`
- `components/exam/Timer.tsx`
- `components/exam/ProgressBar.tsx`

### Testes
- `__tests__/lib/catalog.test.ts`
- `__tests__/lib/openai.test.ts`
- `__tests__/components/exam/Timer.test.tsx`
- `__tests__/components/exam/QuestionCard.test.tsx`

---

## Task 1: Inicializar projeto Next.js

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `.env.local`, `.gitignore` (via next create)
- Modify: `.gitignore`

- [ ] **Step 1: Inicializar Next.js no diretório existente**

```bash
cd C:/Projetos/certifyflow-ai
npx create-next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*" --no-src-dir
```

Responda `No` para "Would you like to use Turbopack?" e aceite os demais defaults.

- [ ] **Step 2: Instalar dependências principais**

```bash
npm install @supabase/supabase-js @supabase/ssr openai zod framer-motion
```

- [ ] **Step 3: Inicializar Shadcn/UI**

```bash
npx shadcn@latest init
```

Quando solicitado: style `Default`, base color `Slate`, CSS variables `yes`.

- [ ] **Step 4: Adicionar componentes Shadcn necessários**

```bash
npx shadcn@latest add button card badge progress separator table input label
```

- [ ] **Step 5: Instalar dependências de teste**

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-node @types/jest
```

- [ ] **Step 6: Criar `jest.config.ts`**

```typescript
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  testPathPattern: '__tests__',
}

export default createJestConfig(config)
```

- [ ] **Step 7: Criar `jest.setup.ts`**

```typescript
// jest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Adicionar script de test no `package.json`**

Abra `package.json` e adicione em `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 9: Criar `.env.local`**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
OPENAI_API_KEY=sk-...
```

- [ ] **Step 10: Adicionar `.env.local` ao `.gitignore`**

Verifique que `.env.local` já está no `.gitignore` (create-next-app inclui por padrão). Se não estiver:
```
.env.local
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js project with deps and test setup"
```

---

## Task 2: Tipos TypeScript compartilhados

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Criar `types/index.ts`**

```typescript
// types/index.ts
export type ExamLevel = 'Fundamentals' | 'Associate' | 'Expert'

export interface Exam {
  id: string
  title: string
  description: string
  level: ExamLevel
  updated_at?: string
}

export interface Profile {
  id: string
  full_name: string | null
  created_at: string
}

export interface ExamSession {
  id: string
  user_id: string
  exam_id: string
  score: number
  total_q: number
  started_at: string
  completed_at: string | null
}

export interface QuestionAttempt {
  id: string
  session_id: string
  user_id: string
  exam_id: string
  topic_tag: string
  is_correct: boolean
  question_text: string
  correct_answer: string
  user_answer: string
  attempted_at: string
}

export interface GeneratedQuestion {
  question: string
  options: { A: string; B: string; C: string; D: string }
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  topic_tag: string
}

export interface SessionAnswer {
  question_text: string
  topic_tag: string
  correct_answer: string
  user_answer: string
  is_correct: boolean
}

export interface TopicStat {
  topic_tag: string
  total: number
  correct: number
  pct: number
}
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Schema do banco de dados no Supabase

**Files:** Nenhum arquivo local — SQL executado no Supabase Dashboard.

- [ ] **Step 1: Acessar Supabase Dashboard → SQL Editor**

Acesse https://app.supabase.com → seu projeto → SQL Editor.

- [ ] **Step 2: Executar SQL de criação de tabelas**

Cole e execute o SQL abaixo:

```sql
-- Perfil do usuário
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  created_at timestamptz default now() not null
);

-- Cache de exames
create table if not exists exams (
  id text primary key,
  title text not null,
  description text,
  level text not null default 'Associate',
  updated_at timestamptz default now()
);

-- Sessões de simulado
create table if not exists exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  exam_id text not null references exams,
  score int not null default 0,
  total_q int not null default 0,
  started_at timestamptz default now() not null,
  completed_at timestamptz
);

-- Log de questões respondidas
create table if not exists question_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references exam_sessions on delete cascade,
  user_id uuid not null references profiles on delete cascade,
  exam_id text not null,
  topic_tag text not null,
  is_correct boolean not null,
  question_text text not null,
  correct_answer text not null,
  user_answer text not null,
  attempted_at timestamptz default now() not null
);
```

- [ ] **Step 3: Executar SQL de RLS**

```sql
-- Habilitar RLS
alter table profiles enable row level security;
alter table exam_sessions enable row level security;
alter table question_attempts enable row level security;

-- Policies: usuário só acessa seus próprios dados
create policy "profiles: own data" on profiles
  for all using (auth.uid() = id);

create policy "exam_sessions: own data" on exam_sessions
  for all using (auth.uid() = user_id);

create policy "question_attempts: own data" on question_attempts
  for all using (auth.uid() = user_id);

-- exams é leitura pública
alter table exams enable row level security;
create policy "exams: public read" on exams
  for select using (true);

create policy "exams: service insert" on exams
  for insert with check (true);
```

- [ ] **Step 4: Executar SQL do trigger de auto-criação de perfil**

```sql
-- Cria perfil automaticamente ao cadastrar usuário
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

- [ ] **Step 5: Confirmar criação**

No Supabase Dashboard → Table Editor, verifique que as tabelas `profiles`, `exams`, `exam_sessions` e `question_attempts` aparecem.

---

## Task 4: Supabase clients + Middleware

**Files:**
- Create: `lib/supabase/browser-client.ts`
- Create: `lib/supabase/server-client.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Criar `lib/supabase/browser-client.ts`**

```typescript
// lib/supabase/browser-client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Criar `lib/supabase/server-client.ts`**

```typescript
// lib/supabase/server-client.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Criar `middleware.ts`**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isAppRoute = !isAuthRoute && !pathname.startsWith('/api') && pathname !== '/'

  if (isAppRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/ middleware.ts
git commit -m "feat: add Supabase clients and auth middleware"
```

---

## Task 5: Sistema de Tema (CSS + ThemeProvider + ThemeToggle)

**Files:**
- Modify: `app/globals.css`
- Create: `components/ThemeProvider.tsx`
- Create: `components/ThemeToggle.tsx`

- [ ] **Step 1: Substituir `app/globals.css`**

```css
/* app/globals.css */
@import "tailwindcss";

:root[data-theme="light"] {
  --bg-page: #f8fafc;
  --bg-card: #ffffff;
  --bg-option: #f3f4f6;
  --bg-option-hover: #f0f7ff;
  --bg-option-selected: #eff6ff;
  --border: #e2e8f0;
  --border-option: #e5e7eb;
  --border-selected: #0078d4;
  --text-primary: #111827;
  --text-secondary: #374151;
  --text-muted: #6b7280;
  --text-faint: #9ca3af;
  --accent: #0078d4;
  --accent-hover: #106ebe;
  --progress-bg: #e5e7eb;
  --sidebar-bg: #ffffff;
}

:root[data-theme="dark"] {
  --bg-page: #0f1117;
  --bg-card: #1a1d27;
  --bg-option: #252836;
  --bg-option-hover: #1e2d42;
  --bg-option-selected: #1a2f4a;
  --border: #2d3148;
  --border-option: #2d3148;
  --border-selected: #0078d4;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-faint: #64748b;
  --accent: #0078d4;
  --accent-hover: #1a8fe8;
  --progress-bg: #2d3148;
  --sidebar-bg: #13151f;
}

* { box-sizing: border-box; }

body {
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  transition: background 0.25s, color 0.25s;
}
```

- [ ] **Step 2: Criar `components/ThemeProvider.tsx`**

```typescript
// components/ThemeProvider.tsx
'use client'

import { useEffect } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem('theme') ?? 'light'
    document.documentElement.setAttribute('data-theme', stored)
  }, [])

  return <>{children}</>
}
```

- [ ] **Step 3: Criar `components/ThemeToggle.tsx`**

```typescript
// components/ThemeToggle.tsx
'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = (localStorage.getItem('theme') ?? 'light') as 'light' | 'dark'
    setTheme(stored)
  }, [])

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
    >
      <span>{theme === 'light' ? '☀' : '☾'}</span>
      <span className="hidden sm:inline">{theme === 'light' ? 'Claro' : 'Escuro'}</span>
      <div
        className="relative w-10 h-5 rounded-full transition-colors"
        style={{ background: theme === 'dark' ? 'var(--accent)' : 'var(--progress-bg)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
          style={{ left: theme === 'dark' ? '22px' : '2px' }}
        />
      </div>
    </button>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/globals.css components/ThemeProvider.tsx components/ThemeToggle.tsx
git commit -m "feat: add theme system with light/dark CSS variables"
```

---

## Task 6: Catalog lib + API route + testes

**Files:**
- Create: `lib/catalog.ts`
- Create: `app/api/catalog/route.ts`
- Create: `__tests__/lib/catalog.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```typescript
// __tests__/lib/catalog.test.ts
import { fetchExams, STATIC_EXAMS } from '@/lib/catalog'

global.fetch = jest.fn()

describe('fetchExams', () => {
  afterEach(() => jest.clearAllMocks())

  it('returns static list when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
    const exams = await fetchExams()
    expect(exams).toEqual(STATIC_EXAMS)
    expect(exams.length).toBeGreaterThan(0)
  })

  it('returns static list when API returns non-ok status', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false })
    const exams = await fetchExams()
    expect(exams).toEqual(STATIC_EXAMS)
  })

  it('returns static list when API returns empty examinations', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ examinations: [] }),
    })
    const exams = await fetchExams()
    expect(exams).toEqual(STATIC_EXAMS)
  })

  it('STATIC_EXAMS contains AZ-900 and AZ-104', () => {
    const ids = STATIC_EXAMS.map((e) => e.id)
    expect(ids).toContain('AZ-900')
    expect(ids).toContain('AZ-104')
  })
})
```

- [ ] **Step 2: Executar o teste e confirmar que falha**

```bash
npm test -- --testPathPattern=catalog
```

Expected: FAIL — `Cannot find module '@/lib/catalog'`

- [ ] **Step 3: Criar `lib/catalog.ts`**

```typescript
// lib/catalog.ts
import { Exam } from '@/types'

export const STATIC_EXAMS: Exam[] = [
  { id: 'AZ-900', title: 'Microsoft Azure Fundamentals', description: 'Foundational knowledge of cloud services and Microsoft Azure.', level: 'Fundamentals' },
  { id: 'AZ-104', title: 'Microsoft Azure Administrator', description: 'Implement, manage, and monitor Azure environments.', level: 'Associate' },
  { id: 'AZ-305', title: 'Azure Solutions Architect Expert', description: 'Design solutions that run on Azure.', level: 'Expert' },
  { id: 'AZ-500', title: 'Microsoft Azure Security Technologies', description: 'Implement security controls and threat protection.', level: 'Associate' },
  { id: 'AZ-700', title: 'Azure Network Engineer Associate', description: 'Design and implement Azure networking solutions.', level: 'Associate' },
  { id: 'AZ-800', title: 'Administering Windows Server Hybrid Core Infrastructure', description: 'Hybrid Windows Server environments.', level: 'Associate' },
  { id: 'AZ-801', title: 'Configuring Windows Server Hybrid Advanced Services', description: 'Advanced hybrid services.', level: 'Associate' },
  { id: 'MS-900', title: 'Microsoft 365 Fundamentals', description: 'Foundational knowledge of Microsoft 365 services.', level: 'Fundamentals' },
  { id: 'MS-102', title: 'Microsoft 365 Administrator', description: 'Deploy and manage Microsoft 365 tenants.', level: 'Associate' },
  { id: 'SC-900', title: 'Microsoft Security, Compliance, and Identity Fundamentals', description: 'Fundamentals of security, compliance, and identity.', level: 'Fundamentals' },
  { id: 'SC-300', title: 'Microsoft Identity and Access Administrator', description: 'Identity and access solutions using Azure AD.', level: 'Associate' },
  { id: 'DP-900', title: 'Microsoft Azure Data Fundamentals', description: 'Foundational knowledge of core data concepts.', level: 'Fundamentals' },
  { id: 'DP-300', title: 'Administering Microsoft Azure SQL Solutions', description: 'Operate SQL solutions on Microsoft Azure.', level: 'Associate' },
  { id: 'AI-900', title: 'Microsoft Azure AI Fundamentals', description: 'AI and machine learning workloads on Azure.', level: 'Fundamentals' },
  { id: 'PL-900', title: 'Microsoft Power Platform Fundamentals', description: 'Foundational knowledge of Microsoft Power Platform.', level: 'Fundamentals' },
]

export async function fetchExams(): Promise<Exam[]> {
  try {
    const res = await fetch(
      'https://learn.microsoft.com/api/catalog/?type=examinations',
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return STATIC_EXAMS
    const data = await res.json()
    const exams = data?.examinations
    if (!Array.isArray(exams) || exams.length === 0) return STATIC_EXAMS
    return exams.map((e: Record<string, string>) => ({
      id: e.examNumber ?? e.uid,
      title: e.title,
      description: e.summary ?? '',
      level: (e.level as Exam['level']) ?? 'Associate',
    }))
  } catch {
    return STATIC_EXAMS
  }
}
```

- [ ] **Step 4: Executar teste e confirmar que passa**

```bash
npm test -- --testPathPattern=catalog
```

Expected: PASS (4 tests)

- [ ] **Step 5: Criar `app/api/catalog/route.ts`**

```typescript
// app/api/catalog/route.ts
import { NextResponse } from 'next/server'
import { fetchExams } from '@/lib/catalog'

export async function GET() {
  const exams = await fetchExams()
  return NextResponse.json(exams)
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/catalog.ts app/api/catalog/ __tests__/lib/catalog.test.ts
git commit -m "feat: add catalog lib with Microsoft API + static fallback"
```

---

## Task 7: OpenAI lib + testes

**Files:**
- Create: `lib/openai.ts`
- Create: `__tests__/lib/openai.test.ts`

- [ ] **Step 1: Escrever o teste que falha**

```typescript
// __tests__/lib/openai.test.ts
import { buildPrompt } from '@/lib/openai'

describe('buildPrompt', () => {
  it('includes examId in prompt', () => {
    const prompt = buildPrompt('AZ-104', [])
    expect(prompt).toContain('AZ-104')
  })

  it('includes weak topics when provided', () => {
    const prompt = buildPrompt('AZ-104', ['Azure Networking', 'IAM & RBAC'])
    expect(prompt).toContain('Azure Networking')
    expect(prompt).toContain('IAM & RBAC')
  })

  it('uses generic instruction when no weak topics', () => {
    const prompt = buildPrompt('AZ-900', [])
    expect(prompt).toContain('Escolha um tópico relevante')
  })

  it('prompt includes required JSON keys', () => {
    const prompt = buildPrompt('AZ-104', ['Storage'])
    expect(prompt).toContain('correct_answer')
    expect(prompt).toContain('explanation')
    expect(prompt).toContain('topic_tag')
  })
})
```

- [ ] **Step 2: Executar o teste e confirmar que falha**

```bash
npm test -- --testPathPattern=openai
```

Expected: FAIL — `Cannot find module '@/lib/openai'`

- [ ] **Step 3: Criar `lib/openai.ts`**

```typescript
// lib/openai.ts
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
```

- [ ] **Step 4: Executar teste e confirmar que passa**

```bash
npm test -- --testPathPattern=openai
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/openai.ts __tests__/lib/openai.test.ts
git commit -m "feat: add OpenAI lib with adaptive prompt builder"
```

---

## Task 8: API Route — generate-question

**Files:**
- Create: `app/api/generate-question/route.ts`

- [ ] **Step 1: Criar `app/api/generate-question/route.ts`**

```typescript
// app/api/generate-question/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'
import { generateQuestion } from '@/lib/openai'
import { z } from 'zod'

const BodySchema = z.object({
  examId: z.string().min(1),
  sessionId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { examId, sessionId } = BodySchema.parse(body)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Buscar tópicos mais fracos do usuário para este exame
    const { data: attempts } = await supabase
      .from('question_attempts')
      .select('topic_tag, is_correct')
      .eq('user_id', user.id)
      .eq('exam_id', examId)

    const weakTopics = getWeakTopics(attempts ?? [])

    const question = await generateQuestion(examId, weakTopics)
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
  attempts: { topic_tag: string; is_correct: boolean }[]
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
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
    .map((x) => x.tag)
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/generate-question/
git commit -m "feat: add adaptive question generation API route"
```

---

## Task 9: API Route — results

**Files:**
- Create: `app/api/results/route.ts`

- [ ] **Step 1: Criar `app/api/results/route.ts`**

```typescript
// app/api/results/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'
import { z } from 'zod'
import { TopicStat } from '@/types'

const AnswerSchema = z.object({
  question_text: z.string(),
  topic_tag: z.string(),
  correct_answer: z.string(),
  user_answer: z.string(),
  is_correct: z.boolean(),
})

const BodySchema = z.object({
  sessionId: z.string().uuid(),
  examId: z.string().min(1),
  answers: z.array(AnswerSchema).min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, examId, answers } = BodySchema.parse(body)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const score = Math.round(
      (answers.filter((a) => a.is_correct).length / answers.length) * 100
    )

    // Inserir attempts em batch
    const { error: attemptsError } = await supabase.from('question_attempts').insert(
      answers.map((a) => ({
        session_id: sessionId,
        user_id: user.id,
        exam_id: examId,
        topic_tag: a.topic_tag,
        is_correct: a.is_correct,
        question_text: a.question_text,
        correct_answer: a.correct_answer,
        user_answer: a.user_answer,
      }))
    )
    if (attemptsError) throw attemptsError

    // Atualizar sessão
    const { error: sessionError } = await supabase
      .from('exam_sessions')
      .update({ score, total_q: answers.length, completed_at: new Date().toISOString() })
      .eq('id', sessionId)
    if (sessionError) throw sessionError

    // Calcular stats por tópico para retornar
    const topicStats = computeTopicStats(answers)

    return NextResponse.json({ score, topicStats })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 })
    }
    console.error('results error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function computeTopicStats(
  answers: { topic_tag: string; is_correct: boolean }[]
): TopicStat[] {
  const stats: Record<string, { total: number; correct: number }> = {}
  for (const a of answers) {
    if (!stats[a.topic_tag]) stats[a.topic_tag] = { total: 0, correct: 0 }
    stats[a.topic_tag].total++
    if (a.is_correct) stats[a.topic_tag].correct++
  }
  return Object.entries(stats)
    .map(([topic_tag, { total, correct }]) => ({
      topic_tag,
      total,
      correct,
      pct: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct)
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/results/
git commit -m "feat: add results API route with batch insert and topic stats"
```

---

## Task 10: Root layout + layouts de auth e app

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/(auth)/layout.tsx`
- Create: `components/Sidebar.tsx`
- Create: `app/(app)/layout.tsx`

- [ ] **Step 1: Substituir `app/layout.tsx`**

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CertifyFlow AI',
  description: 'Simulador de certificações Microsoft com IA adaptativa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Criar `app/(auth)/layout.tsx`**

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            CertifyFlow AI
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Simulador de certificações Microsoft
          </p>
        </div>
        {children}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Criar `components/Sidebar.tsx`**

```typescript
// components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { createClient } from '@/lib/supabase/browser-client'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/catalog', label: 'Catálogo', icon: '📋' },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = userEmail.slice(0, 2).toUpperCase()

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col border-r"
      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="font-extrabold text-base tracking-tight" style={{ color: 'var(--accent)' }}>
          CertifyFlow
        </div>
        <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-faint)' }}>
          AI · Microsoft Certs
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-colors"
              style={{
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                background: active ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent',
              }}
            >
              <span className="w-4 text-center">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
        <ThemeToggle />
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>
              {userEmail}
            </div>
            <button
              onClick={signOut}
              className="text-[10px] hover:underline"
              style={{ color: 'var(--text-faint)' }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Criar `app/(app)/layout.tsx`**

```typescript
// app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server-client'
import Sidebar from '@/components/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-auto" style={{ background: 'var(--bg-page)' }}>
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Criar redirect `/` → `/dashboard`**

```typescript
// app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/page.tsx app/\(auth\)/ app/\(app\)/layout.tsx components/Sidebar.tsx
git commit -m "feat: add root, auth, and app layouts with sidebar"
```

---

## Task 11: Páginas de autenticação

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Criar `app/(auth)/login/page.tsx`**

```typescript
// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Entrar</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}
            style={{ background: 'var(--accent)' }}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Não tem conta?{' '}
            <Link href="/register" className="underline" style={{ color: 'var(--accent)' }}>
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
```

- [ ] **Step 2: Criar `app/(auth)/register/page.tsx`**

```typescript
// app/(auth)/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Criar conta</CardTitle>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}
            style={{ background: 'var(--accent)' }}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </Button>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Já tem conta?{' '}
            <Link href="/login" className="underline" style={{ color: 'var(--accent)' }}>
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/login/ app/\(auth\)/register/
git commit -m "feat: add login and register pages"
```

---

## Task 12: Componentes do Dashboard

**Files:**
- Create: `components/dashboard/StatCard.tsx`
- Create: `components/dashboard/PerformanceChart.tsx`
- Create: `components/dashboard/TopicBreakdown.tsx`
- Create: `components/dashboard/HistoryTable.tsx`
- Create: `components/dashboard/CTABanner.tsx`

- [ ] **Step 1: Criar `components/dashboard/StatCard.tsx`**

```typescript
// components/dashboard/StatCard.tsx
interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div
        className="text-2xl font-extrabold leading-none"
        style={{ color: accent ? 'var(--accent)' : 'var(--text-primary)' }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>{sub}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Criar `components/dashboard/PerformanceChart.tsx`**

```typescript
// components/dashboard/PerformanceChart.tsx
interface BarData { label: string; value: number }

export default function PerformanceChart({ data, title }: { data: BarData[]; title: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="text-[11px] font-bold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-secondary)' }}>
        {title}
      </div>
      <div className="flex items-end gap-2 h-24">
        {data.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-t-sm transition-all"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: 'var(--accent)',
                opacity: 0.85,
                minHeight: '4px',
              }}
            />
            <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Criar `components/dashboard/TopicBreakdown.tsx`**

```typescript
// components/dashboard/TopicBreakdown.tsx
import { TopicStat } from '@/types'

function barColor(pct: number) {
  if (pct < 60) return '#ef4444'
  if (pct < 80) return '#f59e0b'
  return '#10b981'
}

export default function TopicBreakdown({ stats, title }: { stats: TopicStat[]; title: string }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="text-[11px] font-bold uppercase tracking-wider mb-3"
        style={{ color: 'var(--text-secondary)' }}>
        {title}
      </div>
      <div className="space-y-2.5">
        {stats.map((s) => (
          <div key={s.topic_tag} className="flex items-center gap-2.5">
            <span className="text-xs w-36 flex-shrink-0 truncate" style={{ color: 'var(--text-secondary)' }}>
              {s.topic_tag}
            </span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--progress-bg)' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${s.pct}%`, background: barColor(s.pct) }}
              />
            </div>
            <span className="text-[11px] w-8 text-right" style={{ color: 'var(--text-muted)' }}>
              {s.pct}%
            </span>
          </div>
        ))}
        {stats.length === 0 && (
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Complete um simulado para ver sua análise.
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Criar `components/dashboard/HistoryTable.tsx`**

```typescript
// components/dashboard/HistoryTable.tsx
import { ExamSession } from '@/types'
import { Badge } from '@/components/ui/badge'

export default function HistoryTable({ sessions }: { sessions: (ExamSession & { exam_id: string })[] }) {
  if (sessions.length === 0) {
    return (
      <p className="text-xs py-4 text-center" style={{ color: 'var(--text-faint)' }}>
        Nenhum simulado realizado ainda.
      </p>
    )
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr>
          {['Exame', 'Data', 'Score', 'Questões', 'Status'].map((h) => (
            <th key={h} className="text-left pb-2 font-semibold uppercase tracking-wider text-[10px]"
              style={{ color: 'var(--text-faint)' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sessions.map((s) => (
          <tr key={s.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
            <td className="py-2" style={{ color: 'var(--text-secondary)' }}>{s.exam_id}</td>
            <td className="py-2" style={{ color: 'var(--text-secondary)' }}>
              {new Date(s.completed_at ?? s.started_at).toLocaleDateString('pt-BR')}
            </td>
            <td className="py-2 font-bold" style={{ color: 'var(--text-primary)' }}>{s.score}%</td>
            <td className="py-2" style={{ color: 'var(--text-secondary)' }}>{s.total_q}</td>
            <td className="py-2">
              {s.score >= 70 ? (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Aprovado
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                  Reprovado
                </Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 5: Criar `components/dashboard/CTABanner.tsx`**

```typescript
// components/dashboard/CTABanner.tsx
import Link from 'next/link'

interface CTABannerProps {
  examId: string
  examTitle: string
  weakTopics: string[]
}

export default function CTABanner({ examId, examTitle, weakTopics }: CTABannerProps) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex items-center justify-between gap-4"
      style={{
        background: 'linear-gradient(135deg, #0078d4 0%, #0063b1 100%)',
        boxShadow: '0 4px 16px rgba(0,120,212,0.3)',
      }}
    >
      <div>
        <h3 className="text-sm font-bold text-white">Continuar preparação — {examId}</h3>
        <p className="text-xs text-white/75 mt-0.5">
          {weakTopics.length > 0
            ? `Motor adaptativo priorizará: ${weakTopics.slice(0, 2).join(', ')}`
            : examTitle}
        </p>
      </div>
      <Link
        href={`/exam/${examId}`}
        className="text-xs font-bold rounded-md px-4 py-2 whitespace-nowrap flex-shrink-0 transition-opacity hover:opacity-90"
        style={{ background: '#fff', color: '#0078d4' }}
      >
        Iniciar simulado →
      </Link>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/
git commit -m "feat: add dashboard components (StatCard, Chart, Topics, History, CTA)"
```

---

## Task 13: Página do Dashboard

**Files:**
- Create: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Criar `app/(app)/dashboard/page.tsx`**

```typescript
// app/(app)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server-client'
import { redirect } from 'next/navigation'
import StatCard from '@/components/dashboard/StatCard'
import PerformanceChart from '@/components/dashboard/PerformanceChart'
import TopicBreakdown from '@/components/dashboard/TopicBreakdown'
import HistoryTable from '@/components/dashboard/HistoryTable'
import CTABanner from '@/components/dashboard/CTABanner'
import { TopicStat } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar sessões completadas
  const { data: sessions } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(10)

  const allSessions = sessions ?? []

  // Stats gerais
  const totalSims = allSessions.length
  const avgScore = totalSims > 0
    ? Math.round(allSessions.reduce((acc, s) => acc + s.score, 0) / totalSims)
    : 0

  // Buscar attempts para topic breakdown
  const { data: attempts } = await supabase
    .from('question_attempts')
    .select('topic_tag, is_correct')
    .eq('user_id', user.id)

  const topicStats = computeTopicStats(attempts ?? [])
  const weakTopics = topicStats.filter((t) => t.pct < 70).slice(0, 3).map((t) => t.topic_tag)

  // Exame mais recente para CTA
  const lastExamId = allSessions[0]?.exam_id ?? 'AZ-900'

  // Chart data: últimos 7 simulados (ordem cronológica)
  const chartData = allSessions
    .slice(0, 7)
    .reverse()
    .map((s, i) => ({ label: `Sim ${i + 1}`, value: s.score }))

  const totalAttempts = attempts?.length ?? 0
  const correctAttempts = attempts?.filter((a) => a.is_correct).length ?? 0

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>

      {totalSims > 0 && (
        <CTABanner
          examId={lastExamId}
          examTitle={lastExamId}
          weakTopics={weakTopics}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Simulados" value={totalSims} sub="realizados" />
        <StatCard label="Média geral" value={`${avgScore}%`} accent sub="de acerto" />
        <StatCard label="Questões" value={totalAttempts} sub={`${totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0}% corretas`} />
        <StatCard
          label="Melhor exame"
          value={allSessions.length > 0 ? allSessions.reduce((a, b) => a.score > b.score ? a : b).exam_id : '—'}
        />
      </div>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PerformanceChart data={chartData} title="Evolução de scores" />
          <TopicBreakdown stats={topicStats.slice(0, 5)} title="Desempenho por tópico" />
        </div>
      )}

      <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-3"
          style={{ color: 'var(--text-secondary)' }}>
          Histórico de simulados
        </div>
        <HistoryTable sessions={allSessions} />
      </div>
    </div>
  )
}

function computeTopicStats(attempts: { topic_tag: string; is_correct: boolean }[]): TopicStat[] {
  const stats: Record<string, { total: number; correct: number }> = {}
  for (const a of attempts) {
    if (!stats[a.topic_tag]) stats[a.topic_tag] = { total: 0, correct: 0 }
    stats[a.topic_tag].total++
    if (a.is_correct) stats[a.topic_tag].correct++
  }
  return Object.entries(stats)
    .map(([topic_tag, { total, correct }]) => ({
      topic_tag, total, correct,
      pct: Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct)
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/dashboard/
git commit -m "feat: add dashboard page with stats, chart, and history"
```

---

## Task 14: Página do Catálogo

**Files:**
- Create: `app/(app)/catalog/page.tsx`

- [ ] **Step 1: Criar `app/(app)/catalog/page.tsx`**

```typescript
// app/(app)/catalog/page.tsx
import Link from 'next/link'
import { fetchExams } from '@/lib/catalog'
import { Badge } from '@/components/ui/badge'

const levelColor: Record<string, string> = {
  Fundamentals: 'bg-blue-100 text-blue-700',
  Associate: 'bg-indigo-100 text-indigo-700',
  Expert: 'bg-purple-100 text-purple-700',
}

export default async function CatalogPage() {
  const exams = await fetchExams()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Catálogo de Exames</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        Escolha um exame para iniciar um simulado adaptativo.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {exams.map((exam) => (
          <Link key={exam.id} href={`/exam/${exam.id}`}>
            <div
              className="rounded-xl p-4 border h-full flex flex-col gap-2 hover:border-[#0078d4] transition-colors cursor-pointer"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {exam.id}
                </span>
                <Badge className={`text-[10px] shrink-0 ${levelColor[exam.level] ?? ''}`}>
                  {exam.level}
                </Badge>
              </div>
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {exam.title}
              </p>
              {exam.description && (
                <p className="text-[11px] line-clamp-2 mt-auto" style={{ color: 'var(--text-muted)' }}>
                  {exam.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/catalog/
git commit -m "feat: add exam catalog page"
```

---

## Task 15: Componentes do Simulador + testes

**Files:**
- Create: `components/exam/OptionItem.tsx`
- Create: `components/exam/QuestionCard.tsx`
- Create: `components/exam/Timer.tsx`
- Create: `components/exam/ProgressBar.tsx`
- Create: `__tests__/components/exam/Timer.test.tsx`
- Create: `__tests__/components/exam/QuestionCard.test.tsx`

- [ ] **Step 1: Criar `components/exam/OptionItem.tsx`**

```typescript
// components/exam/OptionItem.tsx
interface OptionItemProps {
  letter: 'A' | 'B' | 'C' | 'D'
  text: string
  selected: boolean
  correct?: boolean   // mostrado apenas no modo revisão
  wrong?: boolean
  disabled?: boolean
  onClick: () => void
}

export default function OptionItem({ letter, text, selected, correct, wrong, disabled, onClick }: OptionItemProps) {
  let borderColor = 'var(--border-option)'
  let bg = 'transparent'
  let letterBg = 'var(--bg-option)'
  let letterColor = 'var(--text-secondary)'

  if (correct) { borderColor = '#10b981'; bg = 'rgba(16,185,129,0.08)'; letterBg = '#10b981'; letterColor = '#fff' }
  else if (wrong) { borderColor = '#ef4444'; bg = 'rgba(239,68,68,0.08)'; letterBg = '#ef4444'; letterColor = '#fff' }
  else if (selected) { borderColor = 'var(--accent)'; bg = 'var(--bg-option-selected)'; letterBg = 'var(--accent)'; letterColor = '#fff' }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full flex items-start gap-3 rounded-lg px-3.5 py-3 border-[1.5px] text-left transition-all"
      style={{ borderColor, background: bg, cursor: disabled ? 'default' : 'pointer' }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-colors"
        style={{ background: letterBg, color: letterColor }}
      >
        {letter}
      </span>
      <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</span>
    </button>
  )
}
```

- [ ] **Step 2: Escrever testes do QuestionCard**

```typescript
// __tests__/components/exam/QuestionCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import QuestionCard from '@/components/exam/QuestionCard'
import { GeneratedQuestion } from '@/types'

const mockQuestion: GeneratedQuestion = {
  question: 'Qual serviço Azure você usa para armazenar blobs?',
  options: { A: 'Azure SQL', B: 'Azure Blob Storage', C: 'Azure Queue', D: 'Azure Table' },
  correct_answer: 'B',
  explanation: 'Azure Blob Storage é o serviço de armazenamento de objetos do Azure.',
  topic_tag: 'Storage',
}

describe('QuestionCard', () => {
  it('renders question text', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={jest.fn()} />)
    expect(screen.getByText(/armazenar blobs/i)).toBeInTheDocument()
  })

  it('renders all 4 options', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={jest.fn()} />)
    expect(screen.getByText('Azure SQL')).toBeInTheDocument()
    expect(screen.getByText('Azure Blob Storage')).toBeInTheDocument()
    expect(screen.getByText('Azure Queue')).toBeInTheDocument()
    expect(screen.getByText('Azure Table')).toBeInTheDocument()
  })

  it('calls onAnswer with selected letter when option is clicked', () => {
    const onAnswer = jest.fn()
    render(<QuestionCard question={mockQuestion} onAnswer={onAnswer} />)
    fireEvent.click(screen.getByText('Azure Blob Storage'))
    expect(onAnswer).toHaveBeenCalledWith('B')
  })

  it('does not call onAnswer again when disabled', () => {
    const onAnswer = jest.fn()
    render(<QuestionCard question={mockQuestion} onAnswer={onAnswer} selectedAnswer="A" disabled />)
    fireEvent.click(screen.getByText('Azure Blob Storage'))
    expect(onAnswer).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Executar teste e confirmar que falha**

```bash
npm test -- --testPathPattern=QuestionCard
```

Expected: FAIL — `Cannot find module '@/components/exam/QuestionCard'`

- [ ] **Step 4: Criar `components/exam/QuestionCard.tsx`**

```typescript
// components/exam/QuestionCard.tsx
import { motion } from 'framer-motion'
import { GeneratedQuestion } from '@/types'
import OptionItem from './OptionItem'

interface QuestionCardProps {
  question: GeneratedQuestion
  selectedAnswer?: string
  onAnswer: (letter: string) => void
  disabled?: boolean
  showCorrect?: boolean
}

const LETTERS = ['A', 'B', 'C', 'D'] as const

export default function QuestionCard({
  question, selectedAnswer, onAnswer, disabled, showCorrect,
}: QuestionCardProps) {
  return (
    <motion.div
      key={question.question}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      <p className="text-[15px] font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
        {question.question}
      </p>
      <div className="space-y-2">
        {LETTERS.map((l) => (
          <OptionItem
            key={l}
            letter={l}
            text={question.options[l]}
            selected={selectedAnswer === l}
            correct={showCorrect && question.correct_answer === l}
            wrong={showCorrect && selectedAnswer === l && selectedAnswer !== question.correct_answer}
            disabled={disabled}
            onClick={() => onAnswer(l)}
          />
        ))}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 5: Executar teste e confirmar que passa**

```bash
npm test -- --testPathPattern=QuestionCard
```

Expected: PASS (4 tests)

- [ ] **Step 6: Escrever testes do Timer**

```typescript
// __tests__/components/exam/Timer.test.tsx
import { render, screen, act } from '@testing-library/react'
import Timer from '@/components/exam/Timer'

jest.useFakeTimers()

describe('Timer', () => {
  it('renders initial time correctly', () => {
    render(<Timer totalSeconds={300} onExpire={jest.fn()} />)
    expect(screen.getByText('05:00')).toBeInTheDocument()
  })

  it('counts down every second', () => {
    render(<Timer totalSeconds={300} onExpire={jest.fn()} />)
    act(() => { jest.advanceTimersByTime(5000) })
    expect(screen.getByText('04:55')).toBeInTheDocument()
  })

  it('calls onExpire when reaches zero', () => {
    const onExpire = jest.fn()
    render(<Timer totalSeconds={3} onExpire={onExpire} />)
    act(() => { jest.advanceTimersByTime(3000) })
    expect(onExpire).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 7: Executar teste e confirmar que falha**

```bash
npm test -- --testPathPattern=Timer
```

Expected: FAIL — `Cannot find module '@/components/exam/Timer'`

- [ ] **Step 8: Criar `components/exam/Timer.tsx`**

```typescript
// components/exam/Timer.tsx
'use client'

import { useEffect, useState } from 'react'

interface TimerProps {
  totalSeconds: number
  onExpire: () => void
}

function format(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Timer({ totalSeconds, onExpire }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, onExpire])

  const urgent = remaining < 60
  return (
    <span
      className="text-xl font-bold tabular-nums transition-colors"
      style={{ color: urgent ? '#ef4444' : 'var(--accent)' }}
    >
      {format(remaining)}
    </span>
  )
}
```

- [ ] **Step 9: Executar teste e confirmar que passa**

```bash
npm test -- --testPathPattern=Timer
```

Expected: PASS (3 tests)

- [ ] **Step 10: Criar `components/exam/ProgressBar.tsx`**

```typescript
// components/exam/ProgressBar.tsx
interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="px-5 py-2.5">
      <div className="flex justify-between text-[11px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
        <span>Questão {current} de {total}</span>
        <span>{pct}% concluído</span>
      </div>
      <div className="h-1 rounded-full" style={{ background: 'var(--progress-bg)' }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 11: Commit**

```bash
git add components/exam/ __tests__/components/
git commit -m "feat: add exam components (QuestionCard, Timer, ProgressBar, OptionItem)"
```

---

## Task 16: Página de Setup do Exame

**Files:**
- Create: `app/(app)/exam/[examId]/page.tsx`

- [ ] **Step 1: Criar `app/(app)/exam/[examId]/page.tsx`**

```typescript
// app/(app)/exam/[examId]/page.tsx
'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { Button } from '@/components/ui/button'

const QUESTION_OPTIONS = [10, 20, 40]

export default function ExamSetupPage() {
  const { examId } = useParams<{ examId: string }>()
  const router = useRouter()
  const [totalQ, setTotalQ] = useState(20)
  const [loading, setLoading] = useState(false)

  async function startExam() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Garantir que o exame existe no cache
    await supabase.from('exams').upsert({ id: examId, title: examId, level: 'Associate' }, { onConflict: 'id', ignoreDuplicates: true })

    const { data: session, error } = await supabase
      .from('exam_sessions')
      .insert({ user_id: user.id, exam_id: examId, total_q: totalQ })
      .select()
      .single()

    if (error || !session) { setLoading(false); return }
    router.push(`/exam/${examId}/session?sessionId=${session.id}&totalQ=${totalQ}`)
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
      <div className="w-full max-w-sm rounded-xl border p-6 space-y-5"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>
            {examId}
          </div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Configurar Simulado
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            O motor adaptativo priorizará seus tópicos mais fracos.
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            Número de questões
          </div>
          <div className="flex gap-2">
            {QUESTION_OPTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setTotalQ(q)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold border transition-all"
                style={{
                  borderColor: totalQ === q ? 'var(--accent)' : 'var(--border)',
                  background: totalQ === q ? 'var(--bg-option-selected)' : 'transparent',
                  color: totalQ === q ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          style={{ background: 'var(--accent)' }}
          onClick={startExam}
          disabled={loading}
        >
          {loading ? 'Iniciando…' : 'Iniciar Simulado →'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/exam/[examId]/page.tsx"
git commit -m "feat: add exam setup page"
```

---

## Task 17: Página da Sessão do Simulado

**Files:**
- Create: `app/(app)/exam/[examId]/session/page.tsx`

- [ ] **Step 1: Criar `app/(app)/exam/[examId]/session/page.tsx`**

```typescript
// app/(app)/exam/[examId]/session/page.tsx
'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { GeneratedQuestion, SessionAnswer, TopicStat } from '@/types'
import QuestionCard from '@/components/exam/QuestionCard'
import Timer from '@/components/exam/Timer'
import ProgressBar from '@/components/exam/ProgressBar'
import TopicBreakdown from '@/components/dashboard/TopicBreakdown'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type Phase = 'loading' | 'question' | 'review' | 'result'

export default function SessionPage() {
  const { examId } = useParams<{ examId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const sessionId = searchParams.get('sessionId') ?? ''
  const totalQ = Number(searchParams.get('totalQ') ?? '20')

  const [phase, setPhase] = useState<Phase>('loading')
  const [current, setCurrent] = useState<GeneratedQuestion | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>()
  const [answers, setAnswers] = useState<SessionAnswer[]>([])
  const [flagged, setFlagged] = useState(false)
  const [score, setScore] = useState(0)
  const [topicStats, setTopicStats] = useState<TopicStat[]>([])
  const [error, setError] = useState('')

  // Buscar primeira questão ao montar
  useState(() => { fetchQuestion() })

  async function fetchQuestion() {
    setPhase('loading')
    setSelectedAnswer(undefined)
    setFlagged(false)
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, sessionId }),
      })
      if (!res.ok) throw new Error('Falha ao gerar questão')
      const q: GeneratedQuestion = await res.json()
      setCurrent(q)
      setPhase('question')
    } catch (e) {
      setError('Erro ao carregar questão. Verifique sua conexão.')
    }
  }

  function onAnswer(letter: string) {
    if (phase !== 'question' || !current) return
    setSelectedAnswer(letter)
    setPhase('review')
  }

  async function nextQuestion() {
    if (!current || !selectedAnswer) return

    const answer: SessionAnswer = {
      question_text: current.question,
      topic_tag: current.topic_tag,
      correct_answer: current.correct_answer,
      user_answer: selectedAnswer,
      is_correct: selectedAnswer === current.correct_answer,
    }
    const updatedAnswers = [...answers, answer]
    setAnswers(updatedAnswers)

    if (questionIndex + 1 >= totalQ) {
      await submitResults(updatedAnswers)
    } else {
      setQuestionIndex((i) => i + 1)
      fetchQuestion()
    }
  }

  const handleExpire = useCallback(() => {
    if (answers.length > 0) submitResults(answers)
    else router.push('/dashboard')
  }, [answers])

  async function submitResults(finalAnswers: SessionAnswer[]) {
    setPhase('loading')
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, examId, answers: finalAnswers }),
      })
      const data = await res.json()
      setScore(data.score)
      setTopicStats(data.topicStats ?? [])
      setPhase('result')
    } catch {
      setError('Erro ao salvar resultados.')
    }
  }

  // --- RESULT SCREEN ---
  if (phase === 'result') {
    const passed = score >= 70
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border overflow-hidden"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="py-8 px-6 text-center"
            style={{ background: 'linear-gradient(135deg, #0078d4 0%, #0063b1 100%)' }}>
            <div className="text-5xl font-extrabold text-white">{score}%</div>
            <div className="text-sm text-white/80 mt-1">
              {answers.filter((a) => a.is_correct).length} de {answers.length} corretas
            </div>
            <div className="inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              {passed ? '✓ Aprovado' : '⚠ Abaixo do mínimo (70%)'}
            </div>
          </div>
          <div className="p-5 space-y-4">
            {topicStats.length > 0 && (
              <TopicBreakdown stats={topicStats} title="Desempenho por área" />
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push(`/exam/${examId}`)}>
                Refazer
              </Button>
              <Button className="flex-1" style={{ background: 'var(--accent)' }} asChild>
                <Link href="/dashboard">Ver dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- LOADING ---
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
          {questionIndex === 0 ? 'Preparando simulado…' : 'Gerando próxima questão…'}
        </div>
      </div>
    )
  }

  // --- ERROR ---
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-red-500">{error}</p>
          <Button onClick={fetchQuestion} style={{ background: 'var(--accent)' }}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  // --- QUESTION / REVIEW ---
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      {/* Topbar */}
      <div className="border-b px-5 py-3 flex items-center justify-between"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
            style={{ background: 'var(--accent)' }}>
            {examId}
          </span>
        </div>
        <Timer totalSeconds={totalQ * 90} onExpire={handleExpire} />
      </div>

      <ProgressBar current={questionIndex + 1} total={totalQ} />

      {/* Question area */}
      <div className="flex-1 p-5 max-w-2xl mx-auto w-full">
        <div className="text-[11px] font-semibold mb-3 uppercase tracking-wider"
          style={{ color: 'var(--text-faint)' }}>
          QUESTÃO {questionIndex + 1}
        </div>

        {current && (
          <QuestionCard
            question={current}
            selectedAnswer={selectedAnswer}
            onAnswer={onAnswer}
            disabled={phase === 'review'}
            showCorrect={phase === 'review'}
          />
        )}

        {/* Review: explanation + next */}
        {phase === 'review' && current && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg p-3.5 border text-sm"
              style={{ background: 'var(--bg-option)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Explicação: </strong>
              {current.explanation}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setFlagged((f) => !f)}
                className="text-xs transition-colors"
                style={{ color: flagged ? '#f59e0b' : 'var(--text-muted)' }}
              >
                {flagged ? '⚑ Marcado' : '⚑ Marcar para revisão'}
              </button>
              <Button onClick={nextQuestion} style={{ background: 'var(--accent)' }}>
                {questionIndex + 1 >= totalQ ? 'Ver resultado →' : 'Próxima →'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/exam/[examId]/session/"
git commit -m "feat: add exam session page with adaptive questions and results"
```

---

## Task 18: Atualizar CLAUDE.md + executar todos os testes

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Executar todos os testes**

```bash
npm test
```

Expected: PASS — todos os testes em `__tests__/` devem passar.

- [ ] **Step 2: Atualizar `CLAUDE.md`**

Substitua o conteúdo existente:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

\`\`\`bash
npm run dev        # start development server (http://localhost:3000)
npm run build      # production build
npm run lint       # ESLint
npm test           # Jest test suite
npm run test:watch # Jest in watch mode
\`\`\`

## Architecture

Next.js 14 App Router monolith. Two route groups:
- `(auth)` — public pages (login, register)
- `(app)` — protected pages guarded by middleware + server-side redirect

### Key directories
- `app/api/` — Route Handlers for OpenAI, catalog, and results
- `lib/supabase/` — `browser-client.ts` (Client Components) and `server-client.ts` (Server Components + Route Handlers)
- `lib/openai.ts` — `generateQuestion()` + `buildPrompt()`, called only from Route Handlers
- `lib/catalog.ts` — `fetchExams()` with Microsoft Catalog API + static fallback
- `components/exam/` — QuestionCard, Timer, ProgressBar, OptionItem
- `components/dashboard/` — StatCard, PerformanceChart, TopicBreakdown, HistoryTable, CTABanner
- `types/index.ts` — all shared TypeScript types

### Adaptive logic
`/api/generate-question` queries `question_attempts` (grouped by `topic_tag`) to find the 3 topics with the lowest correct-answer rate, then passes them into the OpenAI prompt.

### Theme
CSS custom properties defined in `app/globals.css` under `[data-theme="light"]` and `[data-theme="dark"]`. `ThemeProvider` reads `localStorage` on mount. Always use `var(--accent)`, `var(--bg-card)`, etc. — never hardcode colors.

## Supabase
Tables: `profiles`, `exams`, `exam_sessions`, `question_attempts`. All protected by RLS (`user_id = auth.uid()`). Exams table has public read policy. Use server client in Route Handlers and Server Components; browser client in Client Components only.

## Environment variables required
\`\`\`
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY
\`\`\`
```

- [ ] **Step 3: Commit final**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with full project architecture"
```

---

## Checklist de cobertura do spec

| Requisito | Task |
|-----------|------|
| Next.js App Router + Tailwind + Shadcn/UI | Task 1 |
| Paleta azul Microsoft + tipografia Inter | Task 5 |
| Dark/light theme switch | Task 5 |
| Schema Supabase (profiles, exams, exam_sessions, question_attempts) | Task 3 |
| RLS por user_id | Task 3 |
| Microsoft Catalog API + fallback estático | Task 6 |
| Motor adaptativo (weak topics → OpenAI prompt) | Task 7, 8 |
| `/api/generate-question` com Zod validation | Task 8 |
| `/api/results` com batch insert | Task 9 |
| Autenticação email/senha via Supabase | Task 4, 11 |
| Middleware de proteção de rotas | Task 4 |
| Dashboard com stats, gráfico, breakdown, histórico | Task 12, 13 |
| Catálogo de exames | Task 14 |
| Simulador: QuestionCard, Timer, ProgressBar | Task 15 |
| Simulador: transição suave (Framer Motion) | Task 15, 17 |
| Simulador: marcar para revisão | Task 17 |
| Resultado final com análise por área | Task 17 |
| Mobile-first responsivo | todas as tasks de UI |
