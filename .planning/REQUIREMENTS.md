# Requirements: Fiscalização de Parlamentares (FdP)

**Defined:** 2026-06-13
**Core Value:** Transparência pública sobre a atividade parlamentar, permitindo que cidadãos fiscalizem seus representantes com base em dados oficiais e verificáveis.

## v1.1 Requirements

Requirements for v1.1 (Frontend QSA + Cleanup). Maps to roadmap phases 4-6.

### Cleanup & Foundation

- [ ] **CLEANUP-01**: Fix `processar_csv_socios()` missing `return total` in Backend — DQ-01 blocker bug
- [ ] **CLEANUP-02**: Change Frontend/api.ts fallback port from 8000 to 3001
- [ ] **CLEANUP-03**: Replace all `datetime.utcnow()` with `datetime.now(timezone.utc)` across backend
- [ ] **CLEANUP-04**: Remove dead code (import_empresas.py, import_socios.py, unused import_qsa_completo references)
- [ ] **CLEANUP-05**: Create QSA service layer in Frontend/services/api.ts (qsaService with all endpoints)
- [ ] **CLEANUP-06**: Add VERIFICATION.md for all 3 v1.0 phases (Nyquist compliance)

### QSA Dashboard Core

- [ ] **QSA-01**: Build `/fiscalizacao` route with full relationship list and pagination
- [ ] **QSA-02**: QsaRelationshipCard — display company info, CNPJ, CNAE, capital social with expandable details
- [ ] **QSA-03**: Conflict of Interest badge (red/green) per relationship with tooltip explaining score
- [ ] **QSA-04**: Financial Exposure indicator — highlight `alta_exposicao` relationships, show capital values
- [ ] **QSA-05**: MatchTypeBadge — show CPF (green) vs Nome (amber) match type with tooltip
- [ ] **QSA-06**: FreshnessBanner — show data staleness at page top (green/amber/red)
- [ ] **QSA-07**: SpouseDisclosure — distinct indicator when `via_conjuge` with info tooltip
- [ ] **QSA-08**: QsaSummaryCards — aggregate stats (total, conflito, exposicao, conjuge)
- [ ] **QSA-09**: QsaFilterBar — filter by conflict, exposure, spouse; sort by score/capital/name
- [ ] **QSA-10**: Add QSA inline section to existing deputado profile page
- [ ] **QSA-11**: Empty state ("Nenhuma relação encontrada") and error state ("Erro ao carregar") with retry
- [ ] **QSA-12**: Score breakdown visualization — CSS-only 50/30/20 segmented bar with legend
- [ ] **QSA-13**: CNAE category labels — map raw CNAE codes to human-readable risk categories
- [ ] **QSA-14**: Mobile responsive layout for QSA pages

### Compliance & Polish

- [ ] **DOCS-01**: Create VALIDATION.md for all 3 v1.0 phases (Nyquist compliance)
- [ ] **DOCS-02**: Add nav link to `/fiscalizacao` in shared navigation
- [ ] **DOCS-03**: Add score interpretation disclaimer on all score displays
- [ ] **DOCS-04**: Ensure Docker compose wires backend service correctly

## v2 Requirements

Deferred to future release.

### Features

- **QSA-XX**: Company-to-deputado reverse lookup page
- **QSA-XX**: Network graph visualization of QSA relationships
- **QSA-XX**: Historical trend view of QSA changes
- **QSA-XX**: Bulk CSV export of QSA data

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time data refresh / push notifications | QSA data is inherently batch-updated from Receita Federal; websocket infra is overkill |
| Interactive network graph | High complexity, separate page scope; defer to v1.2+ |
| Automated conflict alerts / email subscriptions | Requires auth system and email infra; on-page indicators suffice |
| Full CNPJ detail page (tax info, subsidiaries) | Project focuses on parliamentarian-business links, not full company intelligence |
| Auth-based user system | Not in scope for transparency tool; all data is public |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLEANUP-01 | Phase 4 | Pending |
| CLEANUP-02 | Phase 4 | Pending |
| CLEANUP-03 | Phase 4 | Pending |
| CLEANUP-04 | Phase 4 | Pending |
| CLEANUP-05 | Phase 4 | Pending |
| CLEANUP-06 | Phase 4 | Pending |
| QSA-01 | Phase 5 | Pending |
| QSA-02 | Phase 5 | Pending |
| QSA-03 | Phase 5 | Pending |
| QSA-04 | Phase 5 | Pending |
| QSA-05 | Phase 5 | Pending |
| QSA-06 | Phase 5 | Pending |
| QSA-07 | Phase 5 | Pending |
| QSA-08 | Phase 5 | Pending |
| QSA-09 | Phase 5 | Pending |
| QSA-10 | Phase 5 | Pending |
| QSA-11 | Phase 5 | Pending |
| QSA-12 | Phase 6 | Pending |
| QSA-13 | Phase 6 | Pending |
| QSA-14 | Phase 6 | Pending |
| DOCS-01 | Phase 6 | Pending |
| DOCS-02 | Phase 6 | Pending |
| DOCS-03 | Phase 6 | Pending |
| DOCS-04 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-13*
*Last updated: 2026-06-13 after v1.1 milestone definition*
