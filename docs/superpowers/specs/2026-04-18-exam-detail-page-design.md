# Exam Detail Page — Visual Redesign Spec

**Date:** 2026-04-18
**Status:** Approved

## Goal

Redesign `/exam/[examId]` to be clean, modern, and scannable — product-quality, not prototype.

## Constraints

- No logic changes
- No backend changes
- Layout/styling only
- Tailwind with consistent spacing

## Layout Structure

### Container
- `max-w-4xl mx-auto`
- Vertical spacing: `space-y-8`
- Page padding: `p-6 md:p-8`

### Section Order
1. Back link
2. Header card (exam name + badge + description)
3. Skills Measured section (topic cards grid)
4. CTA card (question selector + Start button)

---

## 1. Header Card

**Visual:** `rounded-2xl shadow-sm border p-6 md:p-8` with `bg-card`

**Contents:**
- Back link: `text-sm` with accent color, inline-flex with arrow
- Level badge: `Badge` component (variant: `outline` for Fundamentals, `secondary` for Associate, `destructive` for Expert)
- Exam title: `text-2xl md:text-3xl font-bold` in `text-primary`
- Exam description: `text-base` in `text-secondary`

---

## 2. Skills Measured Section

**Section label:** `text-xs font-bold uppercase tracking-wider` in accent color

**Layout:** Grid — `grid-cols-1 md:grid-cols-2` with `gap-4`

### Topic Card
**Visual:** Each topic is a card with `rounded-2xl shadow-sm border p-5` and `bg-card`

**Inside each card:**
- **Topic title:** `font-semibold text-base text-primary`
- **Subtopics list:** vertical list with `gap-2`
  - Each item: small check icon (lucide `CheckCircle2` or `Check`, `size-4`) in accent color + `text-sm text-secondary`

### Responsiveness
- Mobile: single column
- Desktop (md+): 2-column grid

---

## 3. CTA Card

**Visual:** `rounded-2xl shadow-sm border p-6` with `bg-card`

**Contents:**

### Question selector
- Label: `text-sm font-medium text-secondary`
- 3 toggle buttons (10 / 20 / 40) in a row
- Selected state: filled with accent bg + white text
- Unselected: transparent with border

### Start button
- Full width: `w-full`
- Height: `h-12`
- Text: `text-base font-semibold`
- Style: filled with accent color
- Label: "Iniciar Simulado"

### Error message (if any)
- `text-sm text-accent text-center`

---

## Component Inventory

| Component | Source | Notes |
|-----------|--------|-------|
| Badge | `components/ui/badge.tsx` | Existing, used as-is |
| Button | `components/ui/button.tsx` | Existing, used as-is |
| Check icon | `lucide-react` | Already in project |

---

## Tailwind Tokens

- Spacing: `gap-2`, `gap-4`, `space-y-8`, `p-5`, `p-6`, `md:p-8`
- Typography: `text-xs`, `text-sm`, `text-base`, `text-2xl`, `md:text-3xl`, `font-bold`, `font-semibold`, `uppercase`, `tracking-wider`
- Border radius: `rounded-2xl`
- Shadow: `shadow-sm`

---

## Files to Modify

- `app/(app)/exam/[examId]/page.tsx` — complete redesign

## No Changes

- Logic (startExam, state, routing) — unchanged
- Backend/API
- Other pages
