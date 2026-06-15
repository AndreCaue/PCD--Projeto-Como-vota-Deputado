# Phase 6: Polish & Compliance - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-15
**Phase:** 06-Polish & Compliance
**Areas discussed:** Score breakdown bar, CNAE labels, Mobile responsive audit, Score disclaimer, VALIDATION.md format, Docker verification

---

## Score Breakdown Bar

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in expanded card | Inside expanded detail row of QsaRelationshipCard | ✓ |
| Tooltip on conflict badge | Shown on hover over ConflictBadge score number | |
| Both | Inline in expanded card AND as compact tooltip on badge | |
| **Legend: Capital (50pts) / CNAE (30pts) / CPF (20pts)** | Matches scoring formula from REQUIREMENTS.md | ✓ |
| Capital Social / CNAE / CPF | More natural Portuguese labels | |
| Capital / Atividade / CPF | Abbreviated for compact mobile display | |
| **Colors: Green / Amber / Blue** | Distinct, colorblind-friendly | ✓ |
| Teal / Orange / Purple | Alternative distinct palette | |
| Single gradient bar | Continuous gradient from green to red | |
| **Zero-score: compact placeholder** | "Sem fatores de conflito" text instead of bar | ✓ |
| Show full bar at 0 width | Always show bar dimensions | |
| Hide bar when score is 0 | Only show when score > 0 | |

**User's choice:** Inline in expanded card, Capital (50pts)/CNAE (30pts)/CPF (20pts) legend, Green/Amber/Blue colors, compact placeholder for zero scores
**Notes:** Standard approach, no special requirements

---

## CNAE Labels

| Option | Description | Selected |
|--------|-------------|----------|
| Replace raw code with descricao | Show Descricao label instead of raw CNAE code | |
| **Show both: label + code** | Descricao as primary, code in parentheses muted | ✓ |
| Add risk category badge | Group CNAEs into risk categories with colored badge | |
| **Conflict CNAEs: amber/red color** | Color the label when it matches conflict class | ✓ |
| Add conflict indicator icon | Show AlertTriangle icon next to conflict CNAE | |
| No special treatment | Conflict badge already indicates conflict | |

**User's choice:** Show both description and code, amber/red color for conflict-class CNAEs
**Notes:** No separate risk-category grouping needed beyond existing conflict class check

---

## Mobile Responsive Audit

| Option | Description | Selected |
|--------|-------------|----------|
| **Full responsive audit** | Check all QSA pages at <768px | ✓ |
| Targeted fixes only | Address known gaps only | |
| **Existing breakpoints enough** | sm(640)/md(768)/lg(1024) suffice | ✓ |
| Add xxs breakpoint | Custom ~375px for very small devices | |

**User's choice:** Full responsive audit, existing Tailwind breakpoints suffice
**Notes:** Audit fiscalizacao list, deputy profile inline section, filter bar, pagination, cards, score bar

---

## Score Disclaimer

| Option | Description | Selected |
|--------|-------------|----------|
| Page-level banner | Single banner at top of fiscalizacao page | |
| Per-card tooltip on score | Info icon on each score display | |
| **Both: page banner + per-card icon** | Page context + per-card detail | ✓ |
| **Standard transparency text** | Algorithmic indicator based on public data, not legal determination | ✓ |
| Shorter version | Score calculated automatically from Receita Federal data | |
| Custom text | User specifies exact text | |

**User's choice:** Both page banner and per-card icon, standard transparency text in Portuguese
**Notes:** Text: "Os scores são indicadores algorítmicos baseados em dados públicos da Receita Federal e não constituem determinação legal de conflito de interesses."

---

## VALIDATION.md Format

| Option | Description | Selected |
|--------|-------------|----------|
| **One file per phase** | Matching VERIFICATION.md structure | ✓ |
| Single combined file | One VALIDATION.md covering all phases | |
| **Requirements traceability matrix** | Map each requirement to its test(s) with evidence | ✓ |
| Manual validation checklist | Document manual verification steps | |

**User's choice:** One file per phase (01/02/03-VALIDATION.md), requirements traceability matrix format
**Notes:** Follow VERIFICATION.md structure pattern

---

## Docker Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Inspect and document | Check correctness, fix issues, no runtime test | |
| **Run end-to-end build test** | docker-compose up --build to verify | ✓ |
| Just base verification | Standard compose correctness | |
| Also add QSA data persistence | Volume mapping for database file | |
| **Also add healthcheck config** | Healthcheck endpoints for both services | ✓ |

**User's choice:** End-to-end build test, add healthcheck configuration to both services
**Notes:** Verify backend-frontend connectivity and data persistence

---

## the agent's Discretion

None — all areas discussed explicitly.

## Deferred Ideas

None — discussion stayed within phase scope.
