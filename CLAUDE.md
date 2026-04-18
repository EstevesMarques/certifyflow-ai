# CLAUDE.md

CertifyFlow AI — Microsoft Certification Exam Simulator PWA. Guidance for Claude Code and other developers.

## Project Status

**MVP Phase**: Core exam simulation flow fully functional.
- ✅ Authentication (Supabase Auth)
- ✅ Dashboard with stats, charts, and history
- ✅ Exam catalog with 15+ Microsoft certifications
- ✅ Adaptive exam engine (questions ranked by weakest topics)
- ✅ Session management and results tracking
- ✅ Theme system (light/dark mode)
- ✅ Progress tracking page
- ✅ Settings page
- ✅ Results API — fully working (score calculation, topic stats, dashboard cache invalidation)

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npm test           # Jest test suite
npm run test:watch # Jest in watch mode
```

## Architecture

**Framework**: Next.js 14 (App Router, Server Components by default)

**Route Structure**:
- `(auth)` — Public routes (login, register)
- `(app)` — Protected routes (middleware guards + auth checks)

### Key Routes

| Route | Purpose | Type |
|-------|---------|------|
| `/login`, `/register` | Authentication | Public |
| `/dashboard` | Home page with stats & history | Protected |
| `/catalog` | Browse all exams | Protected |
| `/simulado` | Start new exam (mirrors catalog) | Protected |
| `/exam/{examId}` | Exam setup (choose question count) | Protected |
| `/exam/{examId}/session` | Active exam session | Protected |
| `/progress` | History + topic performance | Protected |
| `/settings` | Account info & preferences | Protected |

### Key Directories

- **`app/api/`** — Route Handlers
  - `/generate-question` — Adaptive question generation (POST)
  - `/results` — Session result submission (POST)
  - `/catalog` — Exam catalog proxy (GET)

- **`lib/supabase/`**
  - `browser-client.ts` — Client-side Supabase (Client Components only)
  - `server-client.ts` — Server-side Supabase (Route Handlers + Server Components)

- **`lib/`**
  - `openai.ts` — `generateQuestion()` + `buildPrompt()` (called from Route Handlers only)
  - `catalog.ts` — `fetchExams()` (Microsoft Catalog API with static fallback)

- **`components/`**
  - `Sidebar.tsx` — Navigation sidebar with theme toggle
  - `ThemeToggle.tsx` — Dark/light mode switcher
  - `exam/` — QuestionCard, Timer, ProgressBar, OptionItem
  - `dashboard/` — StatCard, PerformanceChart, TopicBreakdown, HistoryTable, CTABanner
  - `ui/` — Base UI components (Button, Badge, etc.)

- **`types/index.ts`** — All TypeScript interfaces (Exam, ExamSession, TopicStat, etc.)

### Adaptive Logic

`/api/generate-question` workflow:
1. Query `question_attempts` grouped by `topic_tag`
2. Find 3 topics with lowest correct-answer rate
3. Pass to OpenAI with prompt asking for questions on those topics
4. Return generated question with 4 options and explanation

### Theme System

CSS custom properties in `app/globals.css`:
- Light theme: `[data-theme="light"]`
- Dark theme: `[data-theme="dark"]`
- Always use `var(--accent)`, `var(--bg-card)`, `var(--text-primary)`, etc.
- **Never hardcode colors**
- ThemeToggle reads/writes `localStorage` for persistence

## Supabase Schema

**Tables**:
- `profiles` — User metadata (id, email, display_name)
- `exams` — Exam catalog (id: TEXT, title, exam_code, provider)
- `exam_sessions` — User exam attempts (id, user_id, exam_id, total_q, score, passed, started_at, completed_at)
- `question_attempts` — Individual question records (id, session_id, question_id, topic_tag, question_text, selected_option, correct_option, is_correct, time_spent_seconds)

**Note**: `question_attempts` does NOT have `user_id` or `exam_id` columns directly — access via `session_id` -> `exam_sessions`.

**Security**:
- All tables protected by RLS: `user_id = auth.uid()`
- `exams` table has public read policy (unauthenticated users can browse)
- Use `browser-client.ts` in Client Components
- Use `server-client.ts` in Route Handlers + Server Components

## Results API Flow

1. User completes exam or timer expires
2. `submitResults()` called with all answers
3. `/api/results` receives: `{ sessionId, examId, answers[] }`
4. Insert each answer into `question_attempts` with:
   - `session_id` (NOT `user_id` or `exam_id`)
   - `question_id` (generated via `crypto.randomUUID()`)
   - `topic_tag`, `question_text`, `selected_option`, `correct_option`, `is_correct`
5. Update `exam_sessions` with `score`, `total_q`, `completed_at`
6. Invalidate dashboard/progress cache via `revalidatePath()`
7. Return `{ score, topicStats }` to client

## Dependencies

**Core**:
- next@14.2.4
- react@18, react-dom@18
- typescript@5
- tailwindcss@3
- @supabase/supabase-js
- openai (for question generation)
- framer-motion (animations)

**UI**:
- @base-ui/react (Button, Badge, etc.)
- class-variance-authority (CVA)
- clsx/classnames

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://czcqxrosrxhzppmyqaol.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
OPENAI_API_KEY=sk-...
```

## Design System

**Colors** (define in globals.css):
- `--accent` — Primary action color (#0078d4)
- `--bg-page` — Page background
- `--bg-card` — Card/elevated surfaces
- `--bg-option` — Option/selection backgrounds
- `--text-primary` — Main text
- `--text-secondary` — Secondary text
- `--text-muted` — Disabled/faint text
- `--border` — Border color

**Spacing**:
- Cards use `rounded-[10px]` (not rounded-xl)
- Padding: `18px` standard for cards
- Gap between items: `2.5` (Tailwind)

**Typography**:
- Headings: `font-bold`, size varies by context
- Labels: `text-xs`, `uppercase`, `tracking-wider`
- Body: `text-sm`

## Development Workflow

1. **Sidebar** has hard-coded nav items → to make dynamic, fetch from user role/permissions
2. **Catalog** is read-only display + Link navigation
3. **Exam Setup** (`/exam/{examId}`) creates `exam_sessions` record
4. **Session** page polls `/api/generate-question` for each new question
5. **Results** submitted via `/api/results` → calculates score + topic stats

## Known Issues / TODO

- [ ] Add question flagging feature (UI exists, no backend)
- [ ] Populate more Microsoft exam data (currently ~15 static exams)
- [ ] Add certificate generation
- [ ] Analytics dashboard for platform metrics
- [ ] Export results as PDF
- [ ] Improve mobile responsiveness (sidebar collapse on small screens)

## For Next Developer

**To continue work**:
1. Run `npm install` to install all dependencies
2. Set up `.env.local` with Supabase credentials
3. Run `npm run dev` and test flows

**Testing flow**:
1. Create test account (register)
2. Go to `/catalog` → click exam → set question count → click "Iniciar Simulado"
3. Answer questions, submit or wait for timer
4. Verify results page shows score + topic breakdown
5. Check `/dashboard` and `/progress` to see recorded session + history

**Important Schema Notes**:
- `question_attempts` columns: `session_id`, `question_id`, `topic_tag`, `question_text`, `selected_option`, `correct_option`, `is_correct` — NO `user_id` or `exam_id`
- When querying user attempts for stats, join via `exam_sessions`: `supabase.from('question_attempts').select(...).in('session_id', sessionIds)`
- When inserting results, always generate `question_id` with `crypto.randomUUID()`
