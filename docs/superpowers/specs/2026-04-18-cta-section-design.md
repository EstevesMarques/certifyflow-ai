# CTA Section — Visual Highlight Redesign Spec

**Date:** 2026-04-18
**Status:** Approved

## Goal

Redesign the exam start CTA section to be visually highlighted and action-oriented — clear separation from the rest of the page, strong visual presence.

## Constraints

- No logic changes
- UI/styling only
- Tailwind CSS

---

## Container

- `max-w-3xl mx-auto mt-12 mb-8`
- `rounded-2xl shadow-lg border p-6 md:p-8`
- Background: `var(--bg-card)`

---

## Title

- Text: "Pronto para começar?"
- `text-xl font-semibold` in `var(--text-primary)`

---

## Question Selector

- Label: `text-sm font-medium mb-3` in `var(--text-secondary)`
- Buttons: `h-12 rounded-xl text-base font-medium`
- Active state: `background: var(--accent)` + white text
- Inactive state: `border` with `var(--border)` + `var(--text-primary)`

---

## Start Button

- `h-14 w-full rounded-xl text-base font-semibold`
- Background: `var(--accent)`, text: `#fff`
- Label: "Iniciar Simulado"

---

## Error Message

- `text-sm text-center` in accent color

---

## Files to Modify

- `app/(app)/exam/[examId]/page.tsx` — CTA section only
