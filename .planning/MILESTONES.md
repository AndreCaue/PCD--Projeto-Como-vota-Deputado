# Milestones

## ✅ v1.0 — Integração com QSA da Receita Federal (SHIPPED 2026-06-13)

**Goal:** Implementar um módulo completo para cruzar dados de Deputados Federais com o QSA da Receita Federal (100% offline), incluindo ingestão automática, cruzamento por CPF e nome do cônjuge, endpoints API e infraestrutura Docker.

**Delivered:**
- Ingestão automática dos dados CNPJ da Receita Federal (Empresas.zip e Socios.zip)
- Criação de tabelas empresas e socios com índices adequados
- Cruzamento por CPF do deputado (exato) e por nome da esposa (fuzzy) usando rapidfuzz
- Endpoints FastAPI: GET /deputados/{deputado_id}/empresas, GET /deputados/empresas, POST /atualizar-qsa, GET /qsa/freshness
- Flags: conflito_interesse (CNAE-based), alta_exposicao (>1M), via_conjuge, score_conflito (50/30/20)
- Estrutura completa de pastas, Models do SQLAlchemy, Routers, Scripts de ingestão
- Dockerfile + docker-compose.yml

**Stats:** 3 phases, 11 plans, 23 requirements satisfied, 86 tests passing

**Accomplishments:**
1. Created complete QSA data ingestion pipeline (Empresas.zip/Socios.zip download, CSV processing, schema migration)
2. Implemented dual-strategy deputy-company matching (exact CPF + rapidfuzz fuzzy spouse name)
3. Built graduated conflict of interest detection with 50/30/20 scoring (capital/CNAE/relationship type)
4. Exposed 4 API endpoints with pagination, filtering, inline freshness, and conflict flags
5. Achieved 86/86 tests passing across all 3 phases with zero regressions
6. All 23 v1 requirements satisfied

**Known deferred items at close:** 0 (all gaps closed prior to archival)

**Archived:** milestones/v1.0-ROADMAP.md, milestones/v1.0-REQUIREMENTS.md
**Tag:** v1.0

## ✅ v1.1 — Frontend QSA + Cleanup (SHIPPED 2026-06-15)

**Goal:** Build QSA frontend visualization dashboard, fix accumulated tech debt from v1.0, and achieve Nyquist compliance across all phases.

**Delivered:**
- Full /fiscalizacao dashboard with relationship cards, conflict badges, filter/sort/pagination
- Score breakdown visualization (50/30/20 CSS bar) and human-readable CNAE labels
- QSA inline section on deputy profile pages with expand/collapse and lazy loading
- All v1.0 blockers resolved: port 8000→3001, datetime.utcnow→timezone-aware, dead code removed
- Nyquist compliance: VERIFICATION.md for all 6 phases, VALIDATION.md for all 3 v1.0 phases
- Docker healthchecks, mobile responsive, score disclaimers

**Stats:** 4 phases, 13 plans, 24 requirements satisfied, 72 commits

**Accomplishments:**
1. Created QSA service layer (qsaService, axios migration) and fixed all v1.0 blockers
2. Built complete /fiscalizacao page with Suspense boundary, relationship cards, and URL-driven filter/sort/pagination
3. Implemented 7 display components (ConflictBadge, MatchTypeBadge, ExposureIndicator, SpouseDisclosure, FreshnessBanner, EmptyState, ErrorState)
4. Added score breakdown visualization (CSS 50/30/20 segmented bar) and conflict-class CNAE labels
5. Integrated QSA relationships into deputy profile pages with lazy loading
6. Achieved 24/24 v1.1 requirements satisfied with full traceability

**Known deferred items at close:** 4 (see milestone archive for details)
- GrafoCanvas.tsx:635 TypeScript error blocks npm run build
- 05-VALIDATION.md still in draft
- Docker build not end-to-end tested
- Phase 4 lacks VALIDATION.md

**Archived:** milestones/v1.1-ROADMAP.md, milestones/v1.1-REQUIREMENTS.md
