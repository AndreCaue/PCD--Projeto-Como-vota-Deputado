---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Frontend QSA + Cleanup
status: planning
last_updated: "2026-06-13T23:59:00.000Z"
last_activity: 2026-06-13
progress:
  total_phases: 3
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

## Previous Milestone: v1.0 — Integração com QSA da Receita Federal

- **Status**: ✅ Shipped 2026-06-13
- **Phases**: 3 (11 plans)
- **Requirements satisfied**: 23/23
- **Tests passing**: 86

## Current Position

**Phase**: 4 — Cleanup & Foundation (not started)
**Plan**: —
**Status**: Roadmap defined, awaiting approval
**Last activity**: 2026-06-13 — Roadmap created for v1.1 milestone

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-13)

**Core value:** Transparência pública sobre a atividade parlamentar, permitindo que cidadãos fiscalizem seus representantes com base em dados oficiais e verificáveis.
**Current focus:** Building QSA frontend visualization and fixing accumulated tech debt from v1.0.

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Milestone phases | 3 | Phases 4-6 |
| v1.1 requirements | 24 | 6 CLEANUP, 14 QSA, 4 DOCS |
| Coverage | 24/24 (100%) | All mapped to phases |
| Test count | 86 (v1.0) | Extending in v1.1 |

## Accumulated Context

### Tech Debt from v1.0 (to resolve in v1.1)

- [ ] DQ-01 bug: `processar_csv_socios()` missing `return total` — BLOCKER
- [ ] Hardcoded port 8000 in Frontend/api.ts — BLOCKER
- [ ] 6 files with `datetime.utcnow()` deprecation
- [ ] Dead code: `import_empresas.py`, `import_socios.py`, `importar_qsa_completo()`
- [ ] No VERIFICATION.md for phases 1-3
- [ ] No VALIDATION.md for Phase 3

### Key Decisions (v1.0 carry-forward)

- `relationship_type` Boolean on Relacao: `False=cpf_match`, `True=nome_match`
- 3-factor graduated conflict scoring: capital (50pts) + CNAE (30pts) + CPF (20pts)
- CNAE conflict classes seeded in Config: 41204, 70204, 73190, 86101
- Chunked CSV processing (10k rows) for memory efficiency with millions of CNPJs

### Phase Structure (v1.1)

| Phase | Goal | Reqs | Status |
|-------|------|------|--------|
| 4. Cleanup & Foundation | Fix blockers, tech debt, QSA service layer, VERIFICATION.md | 6 | Not started |
| 5. QSA Dashboard Core | /fiscalizacao page, cards, badges, filters, deputado profile section | 11 | Not started |
| 6. Polish & Compliance | Score viz, CNAE labels, mobile responsive, VALIDATION.md, Docker | 7 | Not started |

### Blockers

None currently — Phase 4 resolves all v1.0 blockers first.

### Open Todos

- [ ] Approve ROADMAP.md
- [ ] Plan Phase 4 (/gsd-plan-phase 4)
- [ ] Execute Phase 4
- [ ] Plan Phase 5
- [ ] Execute Phase 5
- [ ] Plan Phase 6
- [ ] Execute Phase 6
- [ ] Close v1.1 milestone

## Session Continuity

The current focus is establishing the v1.1 roadmap. Once approved, the next step is `/gsd-plan-phase 4` to break down Phase 4 into executable plans.
