---
phase: 06-polish-compliance
plan: 02
subsystem: ui
tags: disclaimer, tooltip, radix-ui, lucide-react, tailwind, responsive, mobile

# Dependency graph
requires:
  - phase: 06-01
    provides: ScoreBreakdownBar, CnaeLabel components, conflict badge patterns
provides:
  - Score interpretation disclaimer banner on /fiscalizacao (DOCS-03)
  - Per-card disclaimer info icon with Tooltip on ConflictBadge (DOCS-03)
  - Mobile responsive layout at sm(640) and md(768) breakpoints (QSA-14)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Tooltip + stopPropagation pattern for Clickable elements inside expandable cards
    - Responsive grid progression: 1col → 2col → 3col/4col

key-files:
  created:
    - Frontend/components/fiscalizacao/DisclaimerBanner.tsx
  modified:
    - Frontend/components/fiscalizacao/ConflictBadge.tsx
    - Frontend/app/fiscalizacao/FiscalizacaoDashboard.tsx
    - Frontend/components/fiscalizacao/index.tsx
    - Frontend/components/fiscalizacao/QsaRelationshipCard.tsx
    - Frontend/components/fiscalizacao/QsaSummaryCards.tsx
    - Frontend/components/fiscalizacao/QsaFilterBar.tsx
    - Frontend/components/fiscalizacao/QsaEmptyState.tsx

key-decisions:
  - "Disclaimer banner is static (non-dismissable, no LocalStorage) per D-11/D-12"
  - "Tooltip wrapped with TooltipProvider per instance (inside ConflictBadge span)"
  - "e.stopPropagation() on info icon button prevents card toggle (Research Pitfall 4)"
  - "QsaSummaryCards grid: 1col base → 2col sm → 4col lg (improves mobile layout)"

requirements-completed: [DOCS-03, QSA-14]

# Metrics
duration: 2 min
completed: 2026-06-15
---

# Phase 6 Plan 2: Score Disclaimer + Mobile Responsive Summary

**Score interpretation disclaimer banner on /fiscalizacao page, per-card info icon with Tooltip on ConflictBadge, and mobile responsive audit/fixes across all QSA pages at sm(640) and md(768) breakpoints**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-15T09:48:17Z
- **Completed:** 2026-06-15T09:50:34Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Created DisclaimerBanner component with D-12 Portuguese disclaimer text, blue-themed styling (bg-blue-950/20, border-blue-800/40, text-blue-300)
- Inserted DisclaimerBanner in FiscalizacaoDashboard between FreshnessBanner and SummaryCards (inside `!loading` block)
- Added Info icon with Tooltip wrapping on ConflictBadge when score is defined, with `e.stopPropagation()` to prevent card collapse
- Responsive audit and fixes across 6 components at sm(640) and md(768) breakpoints
- QsaSummaryCards grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` for better mobile layout
- Pagination: `flex-wrap` and increased `py-2.5` touch targets for mobile
- QsaFilterBar sort dropdown: improved touch targets with `py-2`
- QsaRelationshipCard capital/CnaeLabel row: added `flex-wrap` for narrow viewports
- QsaEmptyState: responsive padding `py-12 sm:py-16` with `px-4`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create DisclaimerBanner** - `593ee50` (feat: create DisclaimerBanner with D-12 score disclaimer text)
2. **Task 2: Info icon with Tooltip on ConflictBadge** - `81ef129` (feat: add per-card disclaimer info icon with Tooltip)
3. **Task 3: Mobile responsive audit and fixes** - `92ab278` (feat: mobile responsive audit and fixes for QSA pages)

## Files Created/Modified

- `Frontend/components/fiscalizacao/DisclaimerBanner.tsx` - New: static blue-themed banner with D-12 disclaimer text, Info icon, and `"use client"` directive
- `Frontend/app/fiscalizacao/FiscalizacaoDashboard.tsx` - Imported DisclaimerBanner, rendered between FreshnessBanner and SummaryCards; pagination `flex-wrap` + `py-2.5` touch targets
- `Frontend/components/fiscalizacao/index.tsx` - Added DisclaimerBanner export
- `Frontend/components/fiscalizacao/ConflictBadge.tsx` - Added Info icon with Tooltip when score is defined; `e.stopPropagation()` on click; replaced `"group relative"` with `"inline-flex items-center"`
- `Frontend/components/fiscalizacao/QsaRelationshipCard.tsx` - Added `flex-wrap` to capital/CnaeLabel row
- `Frontend/components/fiscalizacao/QsaSummaryCards.tsx` - Changed grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- `Frontend/components/fiscalizacao/QsaFilterBar.tsx` - Sort dropdown items `py-2` for better touch targets
- `Frontend/components/fiscalizacao/QsaEmptyState.tsx` - Responsive padding `py-12 sm:py-16` with `px-4`

## Decisions Made

- **Static disclaimer banner (non-dismissable):** Per D-11/D-12, the banner is always visible when data loads. No LocalStorage or dismiss button needed — keeps implementation simple and ensures legal text is always shown.
- **TooltipProvider per ConflictBadge instance:** Each ConflictBadge that shows a score gets its own TooltipProvider, avoiding wrapping the entire page or card in a provider. This is clean scoping since ConflictBadge is a leaf component.
- **`flex-wrap` on capital+CnaeLabel row:** Prevents overflow when CNAE descriptions are long at narrow viewports, ensuring content wraps naturally instead of causing horizontal scroll.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Pre-existing TypeScript error blocks `npm run build`:** `GrafoCanvas.tsx:635` has `Parameter 'n' implicitly has an 'any' type` in a MiniMap `nodeColor` callback. This is in an unrelated component (grafo visualization, not fiscalizacao). All our files compile correctly (compilation step: "✓ Compiled successfully in 6.3s"). Documented in `deferred-items.md`.
- **`--no-lint` flag behavior:** The plan's `npm run build --no-lint` flag only affects ESLint, not Next.js TypeScript type checking. The `no-lint` flag does not skip the `tsc` type-check step.

## Next Phase Readiness

- Disclaimer cover both page-level (banner) and per-card (info icon Tooltip) tiers per D-11
- All QSA pages are now responsive at sm(640) and md(768) breakpoints
- Ready for Phase 6 remaining work (06-03: VALIDATION.md for v1.0 phases + Docker healthchecks)

## Self-Check: PASSED

- ✅ 8 files exist (DisclaimerBanner.tsx created, 7 files modified)
- ✅ 3 commits present (593ee50, 81ef129, 92ab278)
- ✅ DisclaimerBanner rendered between FreshnessBanner and SummaryCards
- ✅ Info icon with Tooltip on score display in ConflictBadge
- ✅ stopPropagation() prevents card toggle
- ✅ All responsive fixes applied without custom breakpoints

---

*Phase: 06-polish-compliance*
*Completed: 2026-06-15*
