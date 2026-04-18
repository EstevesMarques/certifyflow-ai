# Exam Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sparse exam setup page at `/exam/[examId]` with a full exam detail page showing title, description, level badge, collapsible topic list, question count selector, and Start Exam button.

**Architecture:** Single-page rewrite of `app/(app)/exam/[examId]/page.tsx`. Keep session creation logic (creates `exam_sessions` via Supabase then redirects to session). Exam topics read from `lib/exam-topics.ts` (`EXAM_TOPICS` keyed by exam ID). Level badge uses existing `Badge` component with variant mapping.

**Tech Stack:** Next.js 14 App Router, React, CSS custom properties, `class-variance-authority`, Supabase.

---

## File Changes

- **Modify**: `app/(app)/exam/[examId]/page.tsx` — complete rewrite as detail page
- **No backend changes** — session creation stays in this page, just more visual content around it

---

### Task 1: Rewrite exam detail page UI

**Files:**
- Modify: `app/(app)/exam/[examId]/page.tsx`

- [ ] **Step 1: Read current file to confirm full content**

Run: `cat app/(app)/exam/[examId]/page.tsx`
Confirm: `'use client'`, `useRouter`, `useParams`, `useState`, `STATIC_EXAMS`, `createClient`, `QUESTION_OPTIONS`

- [ ] **Step 2: Write the complete new page**

Replace the entire file content with this:

```tsx
'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser-client'
import { STATIC_EXAMS } from '@/lib/catalog'
import { EXAM_TOPICS } from '@/lib/exam-topics'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const QUESTION_OPTIONS = [10, 20, 40]

const LEVEL_BADGE_VARIANT = {
  Fundamentals: 'outline' as const,
  Associate: 'secondary' as const,
  Expert: 'destructive' as const,
}

export default function ExamDetailPage() {
  const { examId } = useParams<{ examId: string }>()
  const exam = STATIC_EXAMS.find((e) => e.id === examId)
  const examTitle = exam?.title ?? examId
  const topics = EXAM_TOPICS[examId] ?? []
  const router = useRouter()
  const [totalQ, setTotalQ] = useState(20)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function startExam() {
    try {
      setError('')
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: session, error: insertError } = await supabase
        .from('exam_sessions')
        .insert({ user_id: user.id, exam_id: examId, total_q: totalQ })
        .select()
        .single()

      if (insertError || !session) {
        console.error('Insert error:', insertError)
        setError('Erro ao criar sessão. Tente novamente.')
        setLoading(false)
        return
      }

      router.push(
        `/exam/${examId}/session?sessionId=${session.id}&totalQ=${totalQ}&examTitle=${encodeURIComponent(examTitle)}`
      )
    } catch (err) {
      console.error('Error starting exam:', err)
      setError('Erro ao iniciar simulado')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Back link */}
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1 text-sm transition-colors"
        style={{ color: 'var(--accent)' }}
      >
        ← Voltar ao Catálogo
      </Link>

      {/* Header card */}
      <div
        className="rounded-[10px] border p-6 space-y-3"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2">
              <Badge variant={exam ? LEVEL_BADGE_VARIANT[exam.level] : 'outline'}>
                {exam?.level ?? 'N/A'}
              </Badge>
            </div>
            <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {examTitle}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {exam?.description ?? 'Descrição não disponível.'}
            </p>
          </div>
        </div>
      </div>

      {/* Topics section */}
      {topics.length > 0 && (
        <div
          className="rounded-[10px] border p-6 space-y-3"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            Tópicos do Exame
          </h2>
          <div className="space-y-2">
            {topics.map((section, i) => (
              <details key={i} className="group">
                <summary
                  className="flex items-center justify-between cursor-pointer list-none text-sm font-medium p-2 rounded-md transition-colors hover:bg-[var(--bg-option)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span>{section.topic}</span>
                  <span className="text-xs transition-transform group-open:rotate-180" style={{ color: 'var(--text-muted)' }}>
                    ▼
                  </span>
                </summary>
                <div className="flex flex-wrap gap-1.5 mt-2 pl-2">
                  {section.subtopics.map((sub) => (
                    <span
                      key={sub}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--bg-option)', color: 'var(--text-secondary)' }}
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Start section */}
      <div
        className="rounded-[10px] border p-6 space-y-5"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
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
                  background: totalQ === q ? 'var(--accent)' : 'transparent',
                  color: totalQ === q ? '#fff' : 'var(--text-primary)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: 'var(--accent)' }}>
            {error}
          </p>
        )}

        <Button
          onClick={startExam}
          disabled={loading}
          className="w-full"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {loading ? 'Criando sessão...' : 'Start Exam'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run build to verify no errors**

Run: `npm run build 2>&1 | tail -30`
Expected: No TypeScript errors, no module resolution errors

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/exam/\[examId\]/page.tsx
git commit -m "$(cat <<'EOF'
feat: transform exam setup page into full exam detail page

- Add exam title, description, level badge
- Add collapsible topics from lib/exam-topics.ts
- Keep question count selector and session creation
- Navigation: catalog → detail → session

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Spec Coverage Check

| Spec item | Task step |
|-----------|-----------|
| Exam title, description, level | Step 2 (header card) |
| Level badge with variant mapping | Step 2 (`LEVEL_BADGE_VARIANT`) |
| Topics + subtopics, collapsible | Step 2 (`<details>` accordions) |
| Question count selector (10/20/40) | Step 2 (existing logic preserved) |
| Start Exam → `/exam/[examId]/session?sessionId=...&totalQ=...` | Step 2 (`startExam` function) |
| Back to catalog link | Step 2 (Link to `/catalog`) |

## Placeholder Scan

No placeholders. All field names match `Exam` interface: `id`, `title`, `description`, `level`. `EXAM_TOPICS` keys match exam IDs in `STATIC_EXAMS`. Badge variants match `badgeVariants` definition.

## Type Consistency

- `exam?.level` typed as `ExamLevel` ('Fundamentals' | 'Associate' | 'Expert') ✓
- `LEVEL_BADGE_VARIANT` keys match all three `ExamLevel` values ✓
- `EXAM_TOPICS[examId]` returns `ExamTopic[]` ✓
- `startExam` navigates to session with `sessionId`, `totalQ`, `examTitle` params ✓
