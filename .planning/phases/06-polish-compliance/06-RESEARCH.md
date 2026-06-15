# Phase 6: Polish & Compliance — Research

**Researched:** 2026-06-15
**Domain:** Frontend UI polish, compliance documentation, Docker hardening, mobile responsive
**Confidence:** HIGH

## Summary

Phase 6 is the final polish and compliance pass for the v1.1 milestone. It addresses seven requirements spanning four areas: (1) score breakdown visualization and CNAE labels inside the existing QsaRelationshipCard, (2) mobile responsive audit of all QSA pages, (3) compliance documentation (score disclaimer, VALIDATION.md), and (4) Docker wiring (healthchecks, persistence verification). DOCS-02 (nav link to `/fiscalizacao`) is already fulfilled by Phase 5 — confirmed present in `NavbarWithSearch.tsx:82-86`.

The score breakdown bar can be implemented **entirely client-side** using the existing API response fields (`alta_exposicao`, `relationship_type`, `score_conflito`) — no backend changes needed. CNAE conflict-class detection requires either a small backend field addition (`cnae_conflito` boolean) or client-side duplication of the CNAE class check against known codes (41204, 70204, 73190, 86101). The project already has a `Tooltip` component (radix-ui) that can be reused for the per-card disclaimer info icon.

**Primary recommendation:** Execute in 3 parallel workstreams: (A) UI Polish — score bar, CNAE labels, disclaimer banner, info icon (all touch the same components); (B) Compliance — VALIDATION.md files; (C) Docker — healthchecks + end-to-end build test. Mobile responsive (QSA-14) is a cross-cutting audit that can run in parallel but may produce small fixes in any component.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Score breakdown bar inline inside expanded relationship detail row in QsaRelationshipCard — below capital value and existing badges
- **D-02:** Legend labels: "Capital (50pts) / CNAE (30pts) / CPF (20pts)"
- **D-03:** Segment colors: Capital=green, CNAE=amber, CPF=blue (distinct, colorblind-friendly palette)
- **D-04:** CSS-only segmented bar (no canvas, no JS animation)
- **D-05:** Zero-score relationships: show "Sem fatores de conflito" placeholder instead of bar
- **D-06:** Show both description and raw code — `cnae_descricao` primary, raw `cnae_principal` muted
- **D-07:** Conflict-class CNAEs (41204, 70204, 73190, 86101) get amber/red color treatment
- **D-08:** No separate risk-category grouping beyond existing conflict class check
- **D-09:** Full responsive audit at sm(640) / md(768) breakpoints
- **D-10:** No custom breakpoints — existing Tailwind sm/md/lg suffice
- **D-11:** Two-tier disclaimer: page-level banner + per-card info icon
- **D-12:** Disclaimer text: "Os scores são indicadores algorítmicos baseados em dados públicos da Receita Federal e não constituem determinação legal de conflito de interesses."
- **D-13:** One file per phase: 01-VALIDATION.md, 02-VALIDATION.md, 03-VALIDATION.md
- **D-14:** Requirements traceability matrix format — map each requirement to test(s) with validation evidence
- **D-15:** Add healthcheck configuration to both services in docker-compose.yml
- **D-16:** Run `docker-compose up --build` end-to-end test
- **D-17:** Verify QSA data persistence across restarts via volume mapping

### the agent's Discretion
- Implementation details for disclaimer banner styling (position, color, dismissable vs static)
- Whether to add CNAE labels to QsaInlineSection (deputy profile) or only card expanded section
- Exact Tailwind responsive fixes — discretion to use standard patterns

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QSA-12 | Score breakdown visualization — CSS-only 50/30/20 segmented bar with legend | Score factors derivable client-side; bar component replaces existing numeric score; zero-score placeholder pattern identified |
| QSA-13 | CNAE category labels — map raw CNAE codes to human-readable risk categories | `cnae_descricao` and `cnae_principal` already in API response; conflict classes known; color treatment pattern from ConflictBadge |
| QSA-14 | Mobile responsive layout for QSA pages | Existing grid patterns use sm/md breakpoints; audit checklist compiled from component inventory |
| DOCS-01 | Create VALIDATION.md for all 3 v1.0 phases | VERIFICATION.md format precedent exists; phase directories exist |
| DOCS-02 | Add nav link to /fiscalizacao | ✅ Already fulfilled — confirmed at NavbarWithSearch.tsx:82-86 |
| DOCS-03 | Add score interpretation disclaimer on all score displays | Tooltip component from radix-ui exists; two-tier pattern feasible |
| DOCS-04 | Ensure Docker compose wires backend service correctly | Healthcheck endpoints identified; volume persistence working but needs verification |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Score bar visualization | Browser | — | CSS-only rendering, no server round-trip needed |
| Score factor computation | Browser | API | Factors derivable from existing API flags — no backend change needed |
| CNAE label display | Browser | — | `cnae_descricao` already in API response; color logic is client-side |
| CNAE conflict-class detection | Shared | — | Works client-side with known codes, OR backend adds `cnae_conflito` boolean |
| Mobile responsive fixes | Browser | — | All Tailwind breakpoint changes, no server-side involvement |
| Score disclaimer banner | Browser | — | Static banner component |
| Score disclaimer info icon | Browser | — | Tooltip component already exists (radix-ui) |
| VALIDATION.md | Documentation | — | No code changes — pure documentation artifact |
| Docker healthchecks | Infrastructure | — | docker-compose.yml + Dockerfile changes |

## Standard Stack

### Core (No new packages needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TailwindCSS | 4.x | CSS segmented bar, responsive breakpoints, color treatments | Already project standard |
| lucide-react | ^0.577.0 | Info icon for disclaimer, bar icons | Already project standard |
| radix-ui/tooltip | ^1.4.3 | Per-card score disclaimer tooltip | Already exists as shadcn/ui `Tooltip` component |
| Python urllib (stdlib) | — | Docker healthcheck for backend | No `curl` in slim image — use `python -c` |

### Installation
```bash
# No new packages required for any Phase 6 deliverable
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side score derivation | Add `score_capital`/`score_cnae`/`score_cpf` to backend response | Backend change adds precision but increases scope; client-side works with existing data |
| Tooltip component | Custom hover effect | Tooltip from shadcn/ui is already available, accessible, and consistent with project patterns |
| Install `curl` in Docker images | Use `python -c urllib` or `wget --spider` | Installing curl adds image size; stdlib approach is lighter |

## Package Legitimacy Audit

> No new external packages are required for Phase 6. All UI work uses existing dependencies (TailwindCSS, lucide-react, radix-ui). Docker healthchecks use stdlib tools (Python urllib, Alpine wget). No `pip install` or `npm install` commands are needed.

| Package | Registry | slopcheck | Disposition |
|---------|----------|-----------|-------------|
| (none) | — | — | No packages to audit |

## Architecture Patterns

### System Architecture Diagram

```
User Browser
    │
    ├── /fiscalizacao (page.tsx)
    │   └── FiscalizacaoDashboard
    │       ├── [NEW] DisclaimerBanner (page-level)
    │       ├── QsaFreshnessBanner (existing)
    │       ├── QsaSummaryCards (existing)
    │       ├── QsaFilterBar (existing)
    │       └── QsaRelationshipCard[] (existing → MODIFY)
    │           ├── Card header (existing)
    │           └── Expanded section (existing → MODIFY)
    │               ├── Company info + CNPJ (existing)
    │               ├── [NEW] ScoreBreakdownBar ← derives from API flags
    │               ├── [NEW] CnaeLabel ← cnae_descricao + color treatment
    │               └── Badge row: ConflictBadge [+ info icon], MatchType, etc.
    │
    └── /deputados/[id] (deputy profile)
        └── QsaInlineSection (existing)
            └── [OPTIONAL] CNAE labels in relationship rows
```

### Recommended Component Structure
```
Frontend/components/fiscalizacao/
├── QsaRelationshipCard.tsx    # MODIFY: add ScoreBreakdownBar + CnaeLabel in expanded section
├── ConflictBadge.tsx          # MODIFY: add info icon with Tooltip for per-card disclaimer
├── FiscalizacaoDashboard.tsx  # MODIFY: add DisclaimerBanner below FreshnessBanner
├── ScoreBreakdownBar.tsx      # NEW: CSS-only 50/30/20 segmented bar component
├── CnaeLabel.tsx              # NEW: CNAE description + code with conflict-class color
├── DisclaimerBanner.tsx       # NEW: page-level score disclaimer banner
├── ExposureIndicator.tsx      # (existing, no change)
├── MatchTypeBadge.tsx         # (existing, no change)
├── SpouseDisclosure.tsx       # (existing, no change)
├── QsaFreshnessBanner.tsx     # (existing, no change)
├── QsaSummaryCards.tsx        # (existing, no change)
├── QsaFilterBar.tsx           # (existing, no change)
├── QsaEmptyState.tsx          # (existing, no change)
└── QsaErrorState.tsx          # (existing, no change)
```

### Pattern 1: Score Factor Derivation (Client-Side)
**What:** Compute individual score factors (capital=50, CNAE=30, CPF=20) from existing API boolean flags. No backend changes needed.

**When to use:** In any component that needs to render the score breakdown bar.

**Why it works:** The scoring formula is deterministic: `alta_exposicao → +50`, CNAE conflict → +30, `cpf_match → +20`. The three flags are all available in the `RelacaoDetalhada` response. Capital and CPF factors are directly derivable from booleans; CNAE factor is the remainder after subtracting known factors from `score_conflito`.

**Derivation logic:**
```
capitalFactor = alta_exposicao ? 50 : 0
cpfFactor = relationship_type === false ? 20 : 0
cnaeFactor = score_conflito - capitalFactor - cpfFactor  (guaranteed non-negative)
```

**Edge case verification:** All possible score combinations:
| Score | alta_exposicao | relationship_type | Capital | CPF | CNAE (derived) |
|-------|---------------|-------------------|---------|-----|----------------|
| 0 | false | null/true | 0 | 0 | 0 |
| 20 | false | false | 0 | 20 | 0 |
| 30 | false | null/true | 0 | 0 | 30 |
| 50 | true | null/true | 50 | 0 | 0 |
| 50 | false | false | 0 | 20 | 30 ✓ |
| 70 | true | false | 50 | 20 | 0 |
| 80 | true | null/true | 50 | 0 | 30 |
| 100 | true | false | 50 | 20 | 30 |

The derivation is unambiguous in all cases because capital and CPF are directly from booleans, and CNAE is always the remainder.

### Pattern 2: CSS-Only Segmented Bar
**What:** A horizontal bar divided into three segments at fixed 50%/30%/20% widths. Each segment is either "active" (colored) if that factor contributed to the score, or "inactive" (grayed out) if it didn't.

**Implementation approach:** Three `<div>` children inside a flex container. Each child has fixed percentage width. Active segments get their color class; inactive segments get `bg-gray-700/50`. The bar container gets `rounded-full overflow-hidden` for clean caps.

**When to use:** Replace the existing plain numeric score display (`{rel.score_conflito}/100` with color classes) in QsaRelationshipCard.tsx expanded section.

### Pattern 3: CNAE Label with Conflict-Class Highlighting
**What:** Display `cnae_descricao` as primary text with `cnae_principal` as muted code suffix. When the CNAE class (first 5 chars of code) matches a known conflict class, apply amber/red color.

**Conflict classes:** 41204, 70204, 73190, 86101

**Color treatment:**
- Conflict CNAE: `text-amber-400` (code) / `text-amber-300` (description) — following the existing "amber for warning" pattern from MatchTypeBadge and QsaFilterBar
- Non-conflict CNAE: `text-gray-300` (description) / `text-gray-500` (code)

### Anti-Patterns to Avoid
- **Canvas/JS animation for bar:** D-04 explicitly forbids this. Use CSS width percentages.
- **Duplicating CNAE conflict logic on both client+server:** Either use client-side derivation from existing data, or add `cnae_conflito` field to backend. Don't maintain two separate implementations.
- **Hardcoding conflict CNAE codes in multiple places:** If using client-side detection, define the codes in ONE constant file.
- **Large disclaimer banner cluttering layout:** Keep the banner compact — one line, icon + text, dismissable optional.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tooltip for score disclaimer | Custom hover/popover component | `@/components/ui/tooltip.tsx` (radix-ui) | Already exists, accessible, keyboard-navigable |
| Disclaimer banner | Custom animation/dismiss logic | Static banner with Tailwind styling | D-11/D-12 don't require interactivity beyond static display |

## Common Pitfalls

### Pitfall 1: Score Bar Factor Miscalculation
**What goes wrong:** The CNAE factor is computed incorrectly in edge cases, leading to wrong bar visualization.
**Why it happens:** The derivation `cnaeFactor = score_conflito - capitalFactor - cpfFactor` assumes the formula is strictly 50+30+20 additive. If the backend scoring formula changes, this breaks.
**How to avoid:** Verify derivation against all 8 possible score combinations (see Pattern 1 table). Add a unit-level assertion. If the backend scoring rules ever change, update the derivation logic in lockstep.
**Warning signs:** Bar shows incorrect segment colors (e.g., CNAE segment filled when it shouldn't be).

### Pitfall 2: CNAE Conflict Class Drift
**What goes wrong:** Backend adds new CNAE conflict classes (stored in Config table), but client-side detection only checks the original 4 codes.
**Why it happens:** The Config table is backend-only; there's no mechanism to sync it to the frontend.
**How to avoid:** Either (a) add `cnae_conflito` boolean to the backend response (so the Config table is the single source of truth), or (b) document that CNAE class additions require frontend updates. Option (a) is recommended for maintainability.
**Warning signs:** A relationship shows a CNAE conflict badge but the CNAE label appears in default (non-conflict) colors.

### Pitfall 3: Docker Healthcheck Fails Due to Missing Tools
**What goes wrong:** The Docker healthcheck `test` command uses `curl`, but the slim/Alpine images don't have `curl` installed.
**Why it happens:** `python:3.13-slim` doesn't include `curl`. `node:20-alpine` has `wget` but not `curl`.
**How to avoid:** 
- Backend: Use `python -c "import urllib.request; urllib.request.urlopen('http://localhost:3001/')"`
- Frontend: Use `wget --spider http://localhost:3000/` (wget is in Alpine by default)
- Alternatively, install `curl` in Dockerfiles (adds ~5MB to image)

### Pitfall 4: Responsive Audit Misses Dynamic States
**What goes wrong:** The responsive audit checks the default page state but misses the expanded card section, sort dropdown, or filter overflow in edge cases.
**Why it happens:** Responsive testing is done only with static viewports, not with interactive states expanded.
**How to avoid:** Test at sm(640) and md(768) with: (a) card expanded, (b) sort dropdown open, (c) multiple filters active, (d) pagination on large page numbers.

### Pitfall 5: VALIDATION.md Gets Out of Sync
**What goes wrong:** VALIDATION.md references requirements, tests, or evidence that no longer match the actual implementation.
**Why it happens:** The VALIDATION.md is created once without verification against current code.
**How to avoid:** Create VALIDATION.md by reading the existing VERIFICATION.md for each phase. Verify each claim against current code and test files.

## Code Examples

### ScoreBreakdownBar Component Pattern

```tsx
// Source: Derived from D-01 through D-05 decisions + project Tailwind patterns
// Existing pattern: bg-gray-900/ border / rounded-2xl card container

interface ScoreBreakdownBarProps {
  scoreConflito: number;
  altaExposicao: boolean;
  relationshipType: boolean | null;
  cnaeConflito?: boolean; // if backend exposes it; otherwise derived
}

export function ScoreBreakdownBar({
  scoreConflito,
  altaExposicao,
  relationshipType,
  cnaeConflito: cnaeOverride,
}: ScoreBreakdownBarProps) {
  // Derive individual factors
  const capitalScore = altaExposicao ? 50 : 0;
  const cpfScore = relationshipType === false ? 20 : 0;
  const cnaeScore = scoreConflito - capitalScore - cpfScore;

  if (scoreConflito === 0) {
    return (
      <p className="text-xs text-gray-500 italic">Sem fatores de conflito</p>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Segmented bar — CSS only */}
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-800">
        <div
          className={`h-full transition-all ${
            capitalScore > 0 ? "bg-emerald-500" : "bg-gray-700/50"
          }`}
          style={{ width: "50%" }}
        />
        <div
          className={`h-full transition-all ${
            cnaeScore > 0 ? "bg-amber-500" : "bg-gray-700/50"
          }`}
          style={{ width: "30%" }}
        />
        <div
          className={`h-full transition-all ${
            cpfScore > 0 ? "bg-blue-500" : "bg-gray-700/50"
          }`}
          style={{ width: "20%" }}
        />
      </div>
      {/* Legend */}
      <div className="flex text-[10px] text-gray-400 gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Capital (50pts)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-amber-500" /> CNAE (30pts)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-500" /> CPF (20pts)
        </span>
      </div>
    </div>
  );
}
```

### CnaeLabel Component Pattern

```tsx
// Source: D-06 through D-08 decisions + existing ConflictBadge color patterns

const CONFLICT_CNAE_CLASSES = ["41204", "70204", "73190", "86101"];

interface CnaeLabelProps {
  cnaePrincipal: string | null;
  cnaeDescricao: string | null;
}

export function CnaeLabel({ cnaePrincipal, cnaeDescricao }: CnaeLabelProps) {
  if (!cnaePrincipal) return null;

  const cnaeClass = cnaePrincipal.slice(0, 5);
  const isConflict = CONFLICT_CNAE_CLASSES.includes(cnaeClass);

  return (
    <div className="flex items-center gap-1.5">
      {cnaeDescricao && (
        <span className={`text-xs ${isConflict ? "text-amber-300" : "text-gray-300"}`}>
          {cnaeDescricao}
        </span>
      )}
      <span className={`font-mono text-xs ${isConflict ? "text-amber-400" : "text-gray-500"}`}>
        {cnaePrincipal}
      </span>
    </div>
  );
}
```

### Disclaimer Tooltip Pattern (extending ConflictBadge)

```tsx
// Source: D-11, D-12 decisions + existing Tooltip component
// The existing ConflictBadge has a `score !== undefined` path (line 25-29)

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Inside ConflictBadge, when score is shown:
{
  (score !== undefined) && (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="ml-1 inline-flex"
          aria-label="Sobre os scores"
        >
          <Info className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        Os scores são indicadores algorítmicos baseados em dados públicos
        da Receita Federal e não constituem determinação legal de conflito
        de interesses.
      </TooltipContent>
    </Tooltip>
  )
}
```

### Disclaimer Banner Pattern

```tsx
// Source: D-11, D-12
// Placement: in FiscalizacaoDashboard.tsx, below <QsaFreshnessBanner>
// (around line 115, between the FreshnessBanner and the loading check)

import { Info } from "lucide-react";

// Insert after freshness banner, before the main content:
{!loading && (
  <div className="flex items-start gap-2 rounded-lg bg-blue-950/20 border border-blue-800/40 p-3 mb-6">
    <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
    <p className="text-xs text-blue-300 leading-relaxed">
      Os scores são indicadores algorítmicos baseados em dados públicos
      da Receita Federal e não constituem determinação legal de conflito
      de interesses.
    </p>
  </div>
)}
```

### Docker Healthcheck Pattern

```yaml
# Source: FastAPI official Docker docs + Better Stack guide
# Backend already has GET / returning {"status": "ok"}

services:
  backend:
    # ... existing config ...
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:3001/')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

  frontend:
    # ... existing config ...
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
```

### VALIDATION.md Structure (matching VERIFICATION.md)

```markdown
---
phase: 01-foundation
phase_name: Foundation
milestone: v1.0
validation_date: "2026-06-15"
status: VALIDATED
---

# Phase 1: Foundation — Validation

## Requirements Summary
...

## Requirement-by-Requirement Mapping
| REQ-ID | Description | Status | Validation Evidence | Automated Test | Validated |
|--------|-------------|--------|---------------------|----------------|-----------|
| ING-01 | Download/process ZIPs | ✅ | test 2 passes | test_qsa_ingest.py | ✅ |

## Validation Evidence
...
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tooltip | Custom CSS hover | `@/components/ui/tooltip.tsx` (radix-ui) | Already exists, accessible, project standard |
| Disclaimer banner | Dismiss button + LocalStorage | Static banner | D-11 doesn't require persistence; keep it simple |
| Docker healthcheck | Custom endpoint | Existing `GET /` route | Backend already returns `{"status": "ok"}` |

**Key insight:** Every component or pattern needed for this phase already exists in the project. The work is composing and extending — not inventing.

## Runtime State Inventory

> Phase 6 is polish/compliance, not rename/refactor. No string or identifier changes. Not applicable.

**Stored data:** None — score bar factors derive from existing API fields. No new data stored.
**Live service config:** None — all changes are frontend components and Docker config.
**OS-registered state:** None — no OS-level changes.
**Secrets/env vars:** None — no new environment variables.
**Build artifacts:** None — no new packages, no renaming.

## Common Pitfalls

### Pitfall 1: Score Bar Factor Miscalculation
**What goes wrong:** CNAE factor derived incorrectly for the 50-score ambiguous case (alta only vs CNAE+CPF).
**Why it happens:** 50 pts from capital alone and 50 pts from CNAE+CPF produce the same `score_conflito` value but different barrier visualization.
**How to avoid:** Always compute from known booleans first (`alta_exposicao`, `relationship_type`), then derive CNAE as remainder. See Pattern 1 derivation table.
**Warning signs:** A relationship with both CNAE conflict and CPF match shows only capital bar segment filled when it should show CNAE+CPF.

### Pitfall 2: Docker Healthcheck Fails Without curl
**What goes wrong:** `python:3.13-slim` and `node:20-alpine` don't have `curl`.
**Why it happens:** The standard `test: ["CMD", "curl", "-f", "..."]` pattern assumes curl is available.
**How to avoid:** Use `python -c "import urllib.request; urllib.request.urlopen(...)"` for backend (stdlib) and `wget --spider` for frontend (included in Alpine). Verify commands exist before deploying.

### Pitfall 3: VALIDATION.md Duplicates VERIFICATION.md
**What goes wrong:** VALIDATION.md becomes a copy-paste of VERIFICATION.md with no new content.
**Why it happens:** The boundary between "verification" and "validation" is unclear — VERIFICATION.md already maps requirements to test evidence.
**How to avoid:** Structure VALIDATION.md as a **requirements traceability matrix** with the focus on **validation outcomes** (user acceptance criteria satisfied, known limitations accepted) rather than implementation evidence. The VALIDATION.md should answer "does the delivered system meet the requirements from a user perspective?" while VERIFICATION.md answers "was the implementation correct?"

### Pitfall 4: Click-Through Events on Expanded Card
**What goes wrong:** The info icon tooltip in ConflictBadge (inside the expanded card row) triggers card collapse on click.
**Why it happens:** The card body has `onClick={handleToggle}` on the outer div. Any click inside bubbles up.
**How to avoid:** Use `e.stopPropagation()` on the tooltip trigger button click handler, and/or move the `onClick` from the card-level div to a dedicated toggle area.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Plain score number | Segmented bar with breakdown | Phase 6 | Users see WHY a score is what it is |
| CNAE raw code only | Description + code with conflict highlighting | Phase 6 | Non-expert users can understand CNAE |
| No disclaimer | Two-tier banner + info icon | Phase 6 | Legal/transparency compliance |
| No Docker healthchecks | Healthchecks on both services | Phase 6 | Production-grade container orchestration |

**Deprecated/outdated:**
- The simple colored score text (`text-green-400` / `text-amber-400` / `text-red-400`) in QsaRelationshipCard.tsx:121-127 — replaced by ScoreBreakdownBar

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `wget --spider` is available in `node:20-alpine` by default | Docker Healthchecks | Low — `wget` is in BusyBox which Alpine uses; if missing, install `curl` in Dockerfile or use `node -e` to check |
| A2 | The score derivation formula (50+30+20) is unchanged since Phase 3 | Score Bar | Low — formula is fundamental to scoring model; if changed, bar logic must be updated in lockstep |
| A3 | All existing Tailwind breakpoints (sm/md/lg) are sufficient for responsive audit | Mobile Responsive | Low — D-10 explicitly says no custom breakpoints needed |
| A4 | The `score_conflito` field is always the sum of individual factors | Score Bar | Medium — verified against backend code in `relacao_service.py:125-132`; if the formula changes, the client-side derivation breaks silently |

## Open Questions

1. **Should `cnae_conflito` be added to the backend API response?**
   - What we know: Client-side derivation works for the bar but requires duplicating CNAE class check logic. The backend already computes `cnae_conflito` in `gerar_relacoes_deputado()` but doesn't expose it in `get_relacoes_com_detalhes()`.
   - What's unclear: Whether the added complexity of a backend change is worth the elegance gain.
   - **Recommendation:** Either approach works. Implementation discretion — if client-side detection is used, centralize the conflict-class array in a shared constant. If backend change is preferred, add to `get_relacoes_com_detalhes()` response dict (minimal change, 3-5 lines).

2. **Should CNAE labels also appear in QsaInlineSection (deputy profile)?**
   - What we know: QsaInlineSection currently shows company name, CNPJ, capital, and badge row — but not CNAE info.
   - What's unclear: QSA-13 targets "all QSA pages" vs. only the card expanded section.
   - **Recommendation:** For consistency, add CNAE labels to QsaInlineSection relationship rows. This aligns with the "Polish" mandate of the phase and ensures deputy profile page shows the same detail as the card.

3. **Is the disclaimer banner dismissable or always visible?**
   - What we know: D-11 says "page-level banner" but doesn't specify dismissability.
   - What's unclear: A permanent banner takes screen space; a dismissable one requires LocalStorage state.
   - **Recommendation:** Start non-dismissable (static banner, compact one-line design). If it feels intrusive during implementation, add a dismiss button with LocalStorage persistence.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Docker | DOCS-04 | ✓ | Docker 27+ | — |
| docker-compose | DOCS-04 | ✓ (Compose V2) | — | — |
| Node.js | Frontend dev | ✓ | 20+ | — |
| Python 3 | Backend dev | ✓ | 3.13 | — |
| Python `urllib` | Backend healthcheck | ✓ (stdlib) | — | Install curl in Dockerfile |
| `wget` (Alpine) | Frontend healthcheck | ✓ (BusyBox) | — | Install curl or use `node -e` |

**Missing dependencies with no fallback:** None — all required tools are available.

**Missing dependencies with fallback:** None — all primary tools work.

## Validation Architecture

> workflow.nyquist_validation is enabled (absent in config, default enabled).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest (Python backend) + Next.js build (frontend) |
| Config file | Backend: `Backend/conftest.py`, `Backend/pytest.ini` (implied) |
| Quick run command | `pytest Backend/tests/ -x -q` |
| Full suite command | `pytest Backend/tests/ -v` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QSA-12 | Score breakdown bar renders correct segments | Unit (Frontend) | `npm test` — check if test framework exists | ❌ Wave 0 — verify test tooling |
| QSA-13 | CNAE labels show description + conflict color | Unit (Frontend) | `npm test` — ditto | ❌ Wave 0 |
| QSA-14 | Responsive layout at sm/md breakpoints | Manual (visual) | Manual browser resize check | N/A |
| DOCS-01 | VALIDATION.md files exist with requirements matrix | Documentation | `Test-Path` each file | ❌ Wave 0 |
| DOCS-03 | Disclaimer banner renders on page | Manual | Visual check | N/A |
| DOCS-04 | Docker compose builds and healthchecks pass | Integration | `docker-compose up --build` | ✅ docker-compose.yml exists |

### Sampling Rate
- **Per task commit:** `pytest Backend/tests/ -x -q` (if backend changes); `npm run build` (if frontend changes)
- **Per wave merge:** Full `pytest` suite + `docker-compose up --build` smoke test
- **Phase gate:** All VALIDATION.md files exist + Docker build succeeds + responsive visual check

### Wave 0 Gaps
- [ ] Verify if frontend has a test runner configured (no jest/vitest config detected in package.json) — Phase 6 is polish, not test framework setup. Manual UAT may suffice.

## Security Domain

> Security enforcement is enabled (default). Phase 6 introduces no new security-sensitive code — all changes are CSS layout, tooltip text, documentation files, and Docker healthcheck configuration.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | no | No new user input |
| V6 Cryptography | no | No new data at rest or in transit |
| V10 Docker/Infrastructure | yes | Docker healthchecks prevent serving from unhealthy containers |

### Docker Security Considerations
| Pattern | Standard Mitigation |
|---------|---------------------|
| Healthcheck with network call | Healthcheck uses HTTP to localhost only — no external network required |
| Container restart policy | Already `restart: unless-stopped` — removes dependency on Docker daemon auto-restart |
| Non-root user | Neither Dockerfile currently adds a non-root user — not in scope for this phase but worth noting for future |

## Sources

### Primary (HIGH confidence)
- [Context7: FastAPI Docker deployment docs] — Healthcheck patterns (`/health` endpoint, `python -c urllib` alternative)
- [Official FastAPI docs: fastapi.tiangolo.com/deployment/docker/] — Verified `python -c` healthcheck works without curl
- [Codebase: `Backend/app/main.py:51`] — Existing `GET /` health endpoint returns `{"status": "ok"}`
- [Codebase: `Backend/app/services/relacao_service.py:125-132`] — Verified scoring formula (50+30+20)
- [Codebase: `Frontend/services/api.ts:240-257`] — `RelacaoDetalhada` type has all fields needed for score derivation
- [Codebase: `Frontend/components/ui/tooltip.tsx`] — Radix-ui tooltip available as shadcn component
- [Codebase: `Frontend/components/ui/NavbarWithSearch.tsx:82-86`] — DOCS-02 already fulfilled

### Secondary (MEDIUM confidence)
- [WebSearch: Better Stack Community — FastAPI Docker Best Practices] — Healthcheck configuration verified against multiple sources
- [Codebase: `.planning/phases/01-foundation/01-VERIFICATION.md`] — VERIFICATION.md format established as template for VALIDATION.md

### Tertiary (LOW confidence)
- None — all claims in this research were verified against the codebase, Context7, or official docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — No new packages needed; all tools verified in codebase
- Architecture: HIGH — Score factor derivation verified against backend source; component patterns confirmed in codebase
- Pitfalls: HIGH — Edge cases identified by reading scoring logic; Docker healthcheck pitfalls from official docs

**Research date:** 2026-06-15
**Valid until:** 2026-08-15 (stable — no fast-moving dependencies in scope)

## Dependencies & Sequencing

### Dependency Graph

```
                    ┌──────────────┐
                    │ DOCS-02 CHECK │ (already done — 5 min verification)
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌──────────────┐
│ UI Polish     │  │ Compliance    │  │ Docker        │
│ Workstream A  │  │ Workstream B  │  │ Workstream C  │
└───────┬───────┘  └───────┬───────┘  └──────┬───────┘
        │                  │                  │
  ┌─────┴────┐        ┌────┴────┐       ┌────┴────┐
  │ QSA-12   │        │ DOCS-01 │       │ DOCS-04 │
  │ ScoreBar │        │VALIDATION│       │Healthcks│
  └────┬─────┘        └─────────┘       └─────────┘
       │
  ┌────┴────┐
  │ QSA-13  │
  │ CNAE    │
  └────┬────┘
       │
  ┌────┴────┐
  │ DOCS-03 │
  │Discaimr │
  └────┬────┘
       │
  ┌────┴────┐
  │ QSA-14  │
  │Responsv│
  └─────────┘
```

### Recommended Execution Order

**Wave 1 (parallel — no dependencies):**
1. **DOCS-01 (VALIDATION.md):** Create 3 files following VERIFICATION.md pattern. No code changes; pure documentation. Fastest deliverable.
2. **DOCS-04 (Docker healthchecks):** Add healthcheck blocks to docker-compose.yml. No build changes needed; config-only.
3. **DOCS-02 verification:** 5-minute check — nav link confirmed at line 82 of NavbarWithSearch.tsx. Document as complete.

**Wave 2 (sequential — shared files):**
4. **QSA-12 (ScoreBreakdownBar) + QSA-13 (CNAE labels):** Both modify `QsaRelationshipCard.tsx` expanded section. Create `ScoreBreakdownBar.tsx` and `CnaeLabel.tsx` components. Replace existing score display. Add CNAE labels. (These touch the same code area — do together.)

**Wave 3 (depends on Wave 2):**
5. **DOCS-03 (Disclaimer):** Add `DisclaimerBanner.tsx` to `FiscalizacaoDashboard.tsx`. Add info icon with Tooltip to `ConflictBadge.tsx`. (Info icon location in ConflictBadge depends on where score is shown — already established.)

**Wave 4 (cross-cutting):**
6. **QSA-14 (Mobile responsive):** After all UI components are in their final state, audit each page/component at sm(640) and md(768). Fix any overflow, spacing, or layout issues.

### What Can Go Wrong with Sequencing
- If QSA-12 and QSA-13 are done in separate tasks without coordination, the expanded section layout may need reworking twice. **Always implement them together.**
- DOCS-03 info icon requires modifying ConflictBadge.tsx — if someone else is also touching that file, coordinate.
- QSA-14 should be LAST because it needs all other UI changes to be in place first.
