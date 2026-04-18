# Skills_Measured Prompt Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pass real `skills_measured` from the database into the question generation prompt, with fallback to static `EXAM_TOPICS`.

**Architecture:** Single task — modify route to fetch `skills_measured` from `exams` table and pass it to `generateQuestion`. Modify `generateQuestion` to accept optional `skills_measured` param and format it when provided.

**Tech Stack:** Next.js Route Handlers, Supabase, OpenAI.

---

## File Changes

- Modify: `app/api/generate-question/route.ts` — fetch `skills_measured` from exams table, pass to `generateQuestion`
- Modify: `lib/openai.ts` — accept optional `skills_measured` param, format when provided

---

## Task 1: Add skills_measured to route and generateQuestion

**Files:**
- Modify: `app/api/generate-question/route.ts`
- Modify: `lib/openai.ts`

- [ ] **Step 1: Read current route.ts to confirm structure**

Run: `cat app/api/generate-question/route.ts`
Confirm: imports `generateQuestion` from `@/lib/openai`, calls `generateQuestion(examId, weakTopics, askedTopics)`

- [ ] **Step 2: Read current lib/openai.ts to confirm signatures**

Run: `cat lib/openai.ts`
Confirm: `generateQuestion(examId: string, weakTopics: string[], askedTopics?: string[])` signature and `buildPrompt` signature

- [ ] **Step 3: Modify route.ts — fetch skills_measured and pass to generateQuestion**

Replace the relevant section in `app/api/generate-question/route.ts`:

Find this block:
```typescript
const question = await generateQuestion(examId, weakTopics, askedTopics)
return NextResponse.json(question)
```

Replace with:
```typescript
// Fetch skills_measured from the exam
const { data: exam } = await supabase
  .from('exams')
  .select('skills_measured')
  .eq('id', examId)
  .single()

const skills_measured = exam?.skills_measured ?? null
const question = await generateQuestion(examId, weakTopics, askedTopics, skills_measured)
return NextResponse.json(question)
```

- [ ] **Step 4: Modify lib/openai.ts — update generateQuestion and buildPrompt**

In `lib/openai.ts`, find the `buildPrompt` function signature:
```typescript
export function buildPrompt(
  examId: string,
  weakTopics: string[],
  askedTopics: string[] = [],
  enrichedTopics?: ReturnType<typeof enrichTopics>
): string {
```

Replace `enrichedTopics` param and its usage with `skills_measured`:

```typescript
export function buildPrompt(
  examId: string,
  weakTopics: string[],
  askedTopics: string[] = [],
  skills_measured?: { topic: string; weight: number; subtopics: string[] }[] | null
): string {
  let enriched = skills_measured
  if (!enriched || enriched.length === 0) {
    enriched = enrichTopics(examId, weakTopics)
  }
  // ... rest of function unchanged (formatTopics usage stays the same)
```

In `generateQuestion`, update the function signature and body:

Find:
```typescript
export async function generateQuestion(
  examId: string,
  weakTopics: string[],
  askedTopics: string[] = []
): Promise<GeneratedQuestion> {
  const enriched = enrichTopics(examId, weakTopics);
```

Replace with:
```typescript
export async function generateQuestion(
  examId: string,
  weakTopics: string[],
  askedTopics: string[] = [],
  skills_measured?: { topic: string; weight: number; subtopics: string[] }[] | null
): Promise<GeneratedQuestion> {
  let enriched = skills_measured
  if (!enriched || enriched.length === 0) {
    enriched = enrichTopics(examId, weakTopics)
  }
```

And in the `buildPrompt` call inside `generateQuestion`, pass `enriched`:
```typescript
content: buildPrompt(examId, weakTopics, askedTopics, enriched),
```

- [ ] **Step 5: Run build to verify no TypeScript errors**

Run: `npm run build 2>&1 | tail -30`
Expected: No TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add app/api/generate-question/route.ts lib/openai.ts
git commit -m "$(cat <<'EOF'
feat: use skills_measured from DB in question generation prompt

- Fetch skills_measured from exams table in generate-question route
- Pass to generateQuestion and buildPrompt
- Fall back to static EXAM_TOPICS when skills_measured is null/empty
- API and response format unchanged

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Spec Coverage

| Spec item | Step |
|-----------|------|
| Fetch skills_measured from exams table | Step 3 |
| Pass to generateQuestion | Step 3 |
| generateQuestion accepts optional skills_measured | Step 4 |
| buildPrompt accepts optional skills_measured | Step 4 |
| Fallback to enrichTopics when skills_measured empty | Step 4 |
| API compatibility maintained | Step 3-4 |

## Placeholder Scan

No placeholders. All field names are exact: `skills_measured`, `examId`, `weakTopics`, `askedTopics`, `enrichTopics`, `buildPrompt`.

## Type Consistency

- `skills_measured` typed as `{ topic: string; weight: number; subtopics: string[] }[] | null` ✓
- Compatible with `ExamTopic[]` (`{ topic, subtopics }`) — extra `weight` field ignored by `formatTopics` ✓
- `buildPrompt` param type matches what route passes ✓
