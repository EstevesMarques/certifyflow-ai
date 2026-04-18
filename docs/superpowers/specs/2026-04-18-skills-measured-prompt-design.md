# Skills_Measured Prompt Enhancement — Design Spec

**Date**: 2026-04-18
**Status**: Approved

## Goal

Improve question generation quality by feeding real `skills_measured` data from the database into the prompt, falling back to static `EXAM_TOPICS` when unavailable.

## Architecture

```
generate-question API (route.ts)
  → fetch skills_measured from exams table (Supabase)
  → pass to generateQuestion()
  → generateQuestion() → buildPrompt()
  → buildPrompt() formats structured context
```

## Data Flow

1. **Route** (`app/api/generate-question/route.ts`):
   - Fetch `skills_measured` from `exams` table by `examId`
   - Pass to `generateQuestion(examId, weakTopics, askedTopics, skills_measured)`

2. **OpenAI** (`lib/openai.ts`):
   - `generateQuestion(examId, weakTopics, askedTopics, skills_measured?)` — new optional param
   - If `skills_measured` is provided → format and use directly (skip `enrichTopics`)
   - If null/undefined → use `enrichTopics(examId, weakTopics)` (current behavior)

3. **Prompt** (`buildPrompt`):
   - Already accepts optional `enrichedTopics` param — no changes needed

## skills_measured Shape

```json
[{ "topic": "Azure App Service", "weight": 0.25, "subtopics": ["Web Apps", "Authentication"] }]
```

Compatible with `ExamTopic[]` (`{ topic: string; subtopics: string[] }`) — `weight` field is ignored by the formatting function.

## Fallback Strategy

| skills_measured in DB | Behavior |
|----------------------|----------|
| Has data | Use DB data, filtered by weakTopics |
| Null / empty array | Use `EXAM_TOPICS[examId]` via `enrichTopics` |

## Weak Topics Filtering

When `skills_measured` is available and `weakTopics` is non-empty:
- Filter `skills_measured` to include only topics matching weak topic names (partial match on `topic_tag` from attempts)
- Pass filtered list to `buildPrompt`

When `weakTopics` is empty:
- Use all `skills_measured` topics

## API Compatibility

- Route handler signature unchanged
- Request/response format unchanged
- Only the prompt context is enhanced
- No breaking changes

## No Frontend Changes

All modifications are in the API layer only.
