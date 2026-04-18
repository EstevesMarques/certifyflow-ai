# Exam Detail Page — Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/exam/[examId]` page with clean, modern UI — professional product look with topic cards grid, check icons for subtopics, and improved CTA section.

**Architecture:** Single-page component redesign in `app/(app)/exam/[examId]/page.tsx`. No backend changes. Import `CheckCircle2` from `lucide-react` for subtopic icons. CSS variables already in use throughout the codebase.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, lucide-react, existing Badge/Button UI components

---

## File Map

- **Modify:** `app/(app)/exam/[examId]/page.tsx` — complete visual redesign
- **No other files changed**

---

## Task 1: Redesign Header Section

**Files:**
- Modify: `app/(app)/exam/[examId]/page.tsx`

- [ ] **Step 1: Change outer container from `max-w-2xl mx-auto p-6 space-y-6` to `max-w-4xl mx-auto p-6 md:p-8 space-y-8`**

In the JSX return, update the root `<div>`:
```tsx
<div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
```

- [ ] **Step 2: Update Header card from `rounded-[10px] border p-6 space-y-3` to `rounded-2xl shadow-sm border p-6 md:p-8 space-y-4`**

```tsx
<div
  className="rounded-2xl shadow-sm border p-6 md:p-8 space-y-4"
  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
>
```

- [ ] **Step 3: Update exam title from `text-xl font-bold` to `text-2xl md:text-3xl font-bold`**

```tsx
<h1 className="text-2xl md:text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
```

- [ ] **Step 4: Move badge above title (already done) and ensure description uses `text-base`**

```tsx
<p className="text-base" style={{ color: 'var(--text-secondary)' }}>
```

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/exam/\[examId\]/page.tsx
git commit -m "feat: update exam detail header to larger typography and 2xl radius

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Redesign Skills Measured Section

**Files:**
- Modify: `app/(app)/exam/[examId]/page.tsx`

- [ ] **Step 1: Change section wrapper from `rounded-[10px] border p-6 space-y-3` to `rounded-2xl shadow-sm border p-6 space-y-5`**

```tsx
<div
  className="rounded-2xl shadow-sm border p-6 space-y-5"
  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
>
```

- [ ] **Step 2: Update section heading to `text-xs font-bold uppercase tracking-wider`**

```tsx
<h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
  Skills Measured
</h2>
```

- [ ] **Step 3: Change topics list from `space-y-2` to `grid grid-cols-1 md:grid-cols-2 gap-4`**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

- [ ] **Step 4: Update each topic row from `<details>` with old styling to a proper card with `rounded-xl border p-4 space-y-2`**

Replace the `<details>` block with a card div for each topic:
```tsx
<div
  className="rounded-xl border p-4 space-y-2"
  style={{ background: 'var(--bg-page)', borderColor: 'var(--border)' }}
>
  <div className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
    {section.topic}
  </div>
  <div className="flex flex-wrap gap-1.5">
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
</div>
```

- [ ] **Step 5: Remove the `<details>` wrapper and replace with the card div above**

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/exam/\[examId\]/page.tsx
git commit -m "feat: transform skills measured into card grid layout

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Add Check Icons to Subtopics

**Files:**
- Modify: `app/(app)/exam/[examId]/page.tsx`

- [ ] **Step 1: Add CheckCircle2 import from lucide-react**

```tsx
import { CheckCircle2 } from 'lucide-react'
```

- [ ] **Step 2: Update subtopics from inline spans to a list with check icons**

Replace the flex-wrap span block with:
```tsx
<div className="flex flex-col gap-2 pl-1">
  {section.subtopics.map((sub) => (
    <div key={sub} className="flex items-center gap-2">
      <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {sub}
      </span>
    </div>
  ))}
</div>
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/exam/\[examId\]/page.tsx
git commit -m "feat: add check icons to subtopics list

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Redesign CTA Section

**Files:**
- Modify: `app/(app)/exam/[examId]/page.tsx`

- [ ] **Step 1: Update CTA card from `rounded-[10px] border p-6 space-y-5` to `rounded-2xl shadow-sm border p-6 space-y-5`**

```tsx
<div
  className="rounded-2xl shadow-sm border p-6 space-y-5"
  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
>
```

- [ ] **Step 2: Update question selector label from `text-xs font-semibold` to `text-sm font-medium`**

```tsx
<div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
  Número de questões
</div>
```

- [ ] **Step 3: Update question buttons to larger with `h-11` and `text-sm font-semibold`**

Replace button class:
```tsx
className="flex-1 h-11 rounded-xl text-sm font-semibold border transition-all"
```

- [ ] **Step 4: Update Start Exam button to `h-12 text-base font-semibold w-full`**

```tsx
<Button
  onClick={startExam}
  disabled={loading}
  className="w-full h-12 text-base font-semibold"
  style={{ background: 'var(--accent)', color: '#fff' }}
>
```

- [ ] **Step 5: Change button text from "Start Exam" to "Iniciar Simulado"**

```tsx
{loading ? 'Criando sessão...' : 'Iniciar Simulado'}
```

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/exam/\[examId\]/page.tsx
git commit -m "feat: redesign CTA section with larger buttons and improved spacing

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: Final Review and Build

**Files:**
- Modify: `app/(app)/exam/[examId]/page.tsx`

- [ ] **Step 1: Run build to verify no errors**

```bash
npm run build 2>&1 | head -50
```
Expected: Build completes without errors

- [ ] **Step 2: Start dev server and manually verify page renders correctly**

```bash
npm run dev &
# Navigate to http://localhost:3000/exam/AZ-900 in browser
# Verify: header with large title, badge, description
# Verify: topic cards in 2-column grid with check icons
# Verify: CTA section with question selector and Start button
```

- [ ] **Step 3: Commit any remaining changes**

```bash
git add -A && git commit -m "feat: complete exam detail page visual redesign

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

- [ ] Spec section "1. Header Card" — covered in Task 1
- [ ] Spec section "2. Skills Measured" — covered in Tasks 2 and 3
- [ ] Spec section "3. CTA Card" — covered in Task 4
- [ ] No placeholder steps (TBD/TODO) in plan
- [ ] All className changes use Tailwind tokens from spec
- [ ] Check icon from lucide-react already in dependencies
- [ ] Button text changed to "Iniciar Simulado"
