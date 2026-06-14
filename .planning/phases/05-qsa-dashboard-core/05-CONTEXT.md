# Phase 5: QSA Dashboard Core - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the QSA frontend dashboard: a `/fiscalizacao` page showing paginated deputy-company relationships with conflict indicators, filter/sort controls, summary stats cards, and a QSA inline section on deputy profile pages. Leverages the `qsaService` built in Phase 4 and existing backend endpoints.
</domain>

<decisions>
## Implementation Decisions

### Page Layout and Information Hierarchy
- **D-01:** Summary-first layout — QsaSummaryCards at top, filter bar below, then relationship card grid
- **D-02:** Card grid display — responsive grid (1 col mobile, 2 col tablet, 3 col desktop) using existing Card pattern (bg-gray-900, border, rounded-2xl)
- **D-03:** Summary cards: 3 stat cards (Total, Conflict count, High exposure count) + 1 smaller highlight chip for Spouse-linked count
- **D-04:** QSA inline on deputy profile (QSA-10) — expandable/collapsible section below patrimony

### Relationship Card Design
- **D-05:** Default card view: Company name, CNPJ, conflict badge, capital value only
- **D-06:** Expandable details: Score breakdown, CNAE code, spouse match info
- **D-07:** Conflict score: simple number (0-100) with color coding (green/amber/red). Full 50/30/20 segmented bar deferred to Phase 6 (QSA-12)
- **D-08:** Interaction: click-to-expand toggle on card (no separate detail page)

### Filter and Sort UX
- **D-09:** Toggle chip buttons for filters — row of pills: All | Conflict | High Exposure | Spouse (shadcn Button variants)
- **D-10:** Sort by dropdown — Score (highest), Capital (highest), Name (A-Z)
- **D-11:** Page number pagination at list bottom
- **D-12:** Auto-apply on filter/sort change — no explicit Apply button needed

### Conflict Badge and Visual Flags
- **D-13:** Conflict badge: red/green dot + text label ("Conflito" / "Sem conflito"). Tooltip shows score breakdown summary
- **D-14:** MatchTypeBadge (QSA-05) + SpouseDisclosure (QSA-07): combined badge row at card top — CPF (green) / Nome (amber) + spouse icon
- **D-15:** Financial Exposure highlight: orange/amber color on capital value with warning icon when `alta_exposicao` is true
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and Roadmap
- `.planning/ROADMAP.md` §Phase 5 — Goal, success criteria, and dependency context
- `.planning/REQUIREMENTS.md` — QSA-01 through QSA-11 full definitions

### Prior Phase Decisions
- `.planning/phases/04-cleanup-foundation/04-CONTEXT.md` — QSA service layer (qsaService in api.ts), axios migration, port fix

### Existing Code
- `Frontend/services/api.ts` — qsaService defined at lines 222-272 with all endpoints pre-built (listar, freshness, relacoes, empresas, atualizar)
- `Frontend/hooks/useFiscalizacao.ts` — Existing QSA hooks migrated to axios in Phase 4
- `Frontend/components/fiscalizacao/FiscalizacaoSection.tsx` — Existing orchestrator component with Card layout, year selector
- `Frontend/components/fiscalizacao/RiscoScore.tsx` — Animated canvas gauge (0-100) with 4 risk tiers — reference pattern for score display
- `Frontend/components/ui/` — shadcn/ui primitives: Button, Input, Skeleton, Dialog, Popover, Command
- `Frontend/app/deputados/[id]/page.tsx` — Deputy profile page — target for QSA inline section (QSA-10)
- `Frontend/components/ui/NavbarWithSearch.tsx` — Navigation — needs `/fiscalizacao` link added
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `qsaService` in `api.ts` — All QSA endpoints ready (listar, freshness, relacoes, empresas, atualizar)
- `components/ui/button.tsx` — Toggle chip filters can use outline/ghost variants with active state
- `components/ui/skeleton.tsx` — Skeleton loading for card grid
- `lucide-react` — Icons for stats cards, conflict flags, badges (e.g., AlertTriangle, Building2, Users, DollarSign)
- `framer-motion` — Available for card mount animations if desired
- `cn()` utility — clsx + tailwind-merge for conditional classes

### Established Patterns
- **Page structure:** `"use client"`, `useCallback` + `useEffect` data fetching, `{data, loading, error}` pattern
- **Card styling:** `bg-gray-900 border border-gray-800 rounded-2xl p-6`
- **Domain components:** Organized in `components/<domain>/` with barrel `index.ts`
- **Dark mode only:** `bg-gray-950 text-gray-100` body

### Integration Points
- `app/fiscalizacao/page.tsx` — New route for the QSA dashboard (create)
- `app/deputados/[id]/page.tsx` — Add QSA inline section below patrimony section
- `components/ui/NavbarWithSearch.tsx` — Add `/fiscalizacao` nav link
- `services/api.ts` — qsaService already wired; no changes needed

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for component implementation details.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 5-QSA Dashboard Core*
*Context gathered: 2026-06-14*
