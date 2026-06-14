# Phase 5: QSA Dashboard Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-14
**Phase:** 5-QSA Dashboard Core
**Areas discussed:** Page layout, Relationship card design, Filter and sort UX, Conflict badge and visual flags

---

## Page Layout and Information Hierarchy

| Option | Description | Selected |
|--------|-------------|----------|
| Summary-first layout | Stats cards top, then filter bar, then results | ✓ |
| Filter-first layout | Filter bar top, stats update dynamically | |

| Option | Description | Selected |
|--------|-------------|----------|
| Card grid | Responsive grid (1/2/3 col), matches app pattern | ✓ |
| Table/list | Full-width rows, breaks from existing card pattern | |

| Option | Description | Selected |
|--------|-------------|----------|
| Four stat cards | Total, Conflict, Exposure, Spouse — all equal | |
| Three + highlight | Total, Conflict, Exposure as cards; Spouse as smaller chip | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Expandable section | Collapsible card on deputy profile | ✓ |
| Always-visible compact list | Small inline list on profile | |

**User's choice:** Summary-first + Card grid + Three+highlight cards + Expandable section
**Notes:** User prefers standard dashboard hierarchy with lighter spouse indicator.

---

## Relationship Card Design

| Option | Description | Selected |
|--------|-------------|----------|
| Name + CNPJ + badge + capital | Minimal default, expand for details | ✓ |
| Full preview | All fields visible without expanding | |

| Option | Description | Selected |
|--------|-------------|----------|
| Score breakdown + CNAE + spouse | Compact expanded view | ✓ |
| Full company details | Partners, address, percentage | |

| Option | Description | Selected |
|--------|-------------|----------|
| Simple number + color | Score displayed as colored number | ✓ |
| Mini segmented bar | 50/30/20 visual bar upfront | |

| Option | Description | Selected |
|--------|-------------|----------|
| Click-to-expand | Toggle details on card | ✓ |
| Link to detail page | Navigate to separate route | |

**User's choice:** Default-minimal + Compact expand + Simple score badge + Click-to-expand
**Notes:** Score breakdown visualization deferred to Phase 6 (QSA-12).

---

## Filter and Sort UX

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle chip buttons | Pill buttons for filter states | ✓ |
| Dropdown select | Single dropdown for filters | |

| Option | Description | Selected |
|--------|-------------|----------|
| Sort dropdown | Dropdown: Score/Capital/Name | ✓ |
| Clickable headers | Column sort — doesn't fit card pattern | |

| Option | Description | Selected |
|--------|-------------|----------|
| Page numbers | Standard pagination at bottom | ✓ |
| Load more button | Endless-load pattern | |

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-apply | Results update immediately | ✓ |
| Apply button | User clicks to apply filters | |

**User's choice:** Toggle chips + Sort dropdown + Page numbers + Auto-apply
**Notes:** —

---

## Conflict Badge and Visual Flags

| Option | Description | Selected |
|--------|-------------|----------|
| Red/green dot + text label | Dot + "Conflito"/"Sem conflito" | ✓ |
| Full colored badge | Solid colored pill | |

| Option | Description | Selected |
|--------|-------------|----------|
| Combined badge row | Small badges at card top: CPF/Nome + spouse | ✓ |
| Inline text indicators | Text labels within card body | |

| Option | Description | Selected |
|--------|-------------|----------|
| Amber highlight on capital | Orange color + warning icon on value | ✓ |
| Full card border highlight | Colored left border accent | |

| Option | Description | Selected |
|--------|-------------|----------|
| Score breakdown tooltip | "Pontuação: 75/100 — Capital (50) + CNAE (30) + CPF (20)" | ✓ |
| Simple explanation | Short text like "Conflito de interesse detectado" | |

**User's choice:** Dot+text badge + Combined badge row + Amber capital highlight + Score breakdown tooltip
**Notes:** —

---

## the agent's Discretion

- Component structure, file organization, and detailed styling choices within the established patterns
- Empty state and error state (QSA-11) copy and retry behavior — implement standard pattern
- Mobile breakpoint specifics for card grid columns
- Exact tooltip HTML structure and positioning
- Navlink label and position in NavbarWithSearch

## Deferred Ideas

None.
