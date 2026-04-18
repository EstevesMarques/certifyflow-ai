# Exam Detail Page — Design Spec

**Date**: 2026-04-18
**Status**: Approved

## Overview

Transform `/exam/[examId]` from a sparse setup page into a full exam detail page. The goal is a professional UX where users explore an exam before committing to a session.

## Flow

```
Catalog → /exam/[examId] → /exam/[examId]/session
```

## Data Sources

| Field | Source |
|-------|--------|
| Title, description, level | `STATIC_EXAMS` / `fetchExams()` |
| Topics + subtopics | `lib/exam-topics.ts` (keyed by exam ID) |
| Badge component | `components/ui/badge.tsx` |

## Layout

```
┌─────────────────────────────────────────────┐
│  ← Voltar ao Catálogo                       │
├─────────────────────────────────────────────┤
│  [Badge: Associate]                         │
│  Microsoft Azure Administrator (AZ-104)    │
│  Descrição do exame em 1-2 linhas.         │
├─────────────────────────────────────────────┤
│  TÓPICOS DO EXAME                          │
│  ▼ Azure App Service                       │
│    Web Apps, API Apps, Mobile Apps, ...     │
│  ▼ Azure Functions                         │
│    Triggers and bindings, Durable ...       │
│  (collapsible accordions)                   │
├─────────────────────────────────────────────┤
│  Quantas perguntas?                         │
│  [10] [20] [40]                            │
│  ┌─────────────────────────────────────┐   │
│  │         Start Exam                   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Component Changes

### `app/(app)/exam/[examId]/page.tsx`

- Replace current setup-only page with full detail page
- Read exam from `STATIC_EXAMS.find(e => e.id === examId)`
- Read topics from `EXAM_TOPICS[examId]` (from `lib/exam-topics.ts`)
- Render level badge, title, description
- Render collapsible topic accordions (each topic expandable to show subtopics)
- Keep question count selector (10/20/40)
- Keep "Start Exam" button → navigates to `/exam/[examId]/session?totalQ=X&examTitle=Y`

### Level → Badge Variant

| Level | Variant |
|-------|---------|
| Fundamentals | `default` (outline) |
| Associate | `secondary` |
| Expert | `destructive` |

## No Changes to Backend

- No DB schema changes
- No new API routes
- Session creation stays in session page

## Design System

- Use CSS vars: `var(--accent)`, `var(--bg-card)`, `var(--border)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`
- Cards: `rounded-[10px]`, padding `18px`
- No hardcoded colors
