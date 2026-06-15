---
plan: 05-04
phase: 05-qsa-dashboard-core
status: complete
commits:
  - 56d2144 (QsaInlineSection component)
  - 7f0f186 (deputy profile integration + nav link)
tasks:
  - task: "Build QsaInlineSection component"
    status: done
    files: [Frontend/components/fiscalizacao/QsaInlineSection.tsx, Frontend/components/fiscalizacao/index.tsx]
  - task: "Integrate QsaInlineSection into deputy profile + add nav link"
    status: done
    files:
      - Frontend/app/deputados/[id]/page.tsx
      - Frontend/components/ui/NavbarWithSearch.tsx
---

## Summary

Added QSA inline section to deputy profile pages:
- QsaInlineSection: expandable/collapsible section with lazy-loaded relationships
- Shows "Relações QSA" heading with Building2 icon, click to expand
- Loads data via `qsaService.relacoes()` on first expand, cached for subsequent toggles
- Each relationship row shows: razao_social, CNPJ (formatted), capital (BRL), all 4 badges
- Loading skeleton (3 rows), error state with retry, empty state

Integrated into `deputados/[id]/page.tsx` below the patrimony section.

Added "Fiscalização" nav link between Grafo and Dashboard in NavbarWithSearch.

## Deviations

None.

## Issues Encountered

None.
