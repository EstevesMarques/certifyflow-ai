# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start development server (http://localhost:3000)
npm run build      # production build
npm run lint       # ESLint
npm test           # Jest test suite
npm run test:watch # Jest in watch mode
```

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
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY
```
