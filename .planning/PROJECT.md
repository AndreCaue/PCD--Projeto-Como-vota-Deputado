# Fiscalização de Parlamentares (FdP)

## What This Is

Visualização de votações de deputados brasileiros com dados públicos da API da Câmara dos Deputados, expandido com módulo QSA para cruzar dados de Deputados Federais com o cadastro de empresas da Receita Federal. O projeto permite aos cidadãos acompanhar como seus representantes estão votando, visualizar relações deputado-empresa, e identificar potenciais conflitos de interesse através de dados oficiais e verificáveis.

## Core Value

Transparência pública sobre a atividade parlamentar, permitindo que cidadãos fiscalizem seus representantes com base em dados oficiais e verificáveis.

## Requirements

### Validated

- ✓ Ingestão automática dos dados CNPJ da Receita Federal — v1.0
- ✓ Cruzamento CPF exato + fuzzy nome do cônjuge — v1.0
- ✓ Endpoints FastAPI para consulta das relações deputado-empresa — v1.0
- ✓ Detecção de conflitos de interesse (CNAE) e exposição financeira (>1M) — v1.0
- ✓ Freshness tracking e indicadores de atualização dos dados — v1.0
- ✓ Dockerfile + docker-compose.yml para deploy consistente — v1.0
- ✓ Full QSA dashboard page /fiscalizacao with relationship cards, conflict flags, freshness indicators — v1.1
- ✓ VERIFICATION.md for all 6 phases (Nyquist compliance) — v1.1
- ✓ VALIDATION.md for all 3 v1.0 phases (Nyquist compliance) — v1.1
- ✓ Score breakdown visualization (50/30/20 CSS bar) and CNAE labels — v1.1
- ✓ Mobile responsive layout for QSA pages — v1.1
- ✓ Score interpretation disclaimers on all score displays — v1.1
- ✓ Docker healthchecks on both services — v1.1

### Active

- [ ] Company-to-deputado reverse lookup page
- [ ] Network graph visualization of QSA relationships
- [ ] Historical trend view of QSA changes
- [ ] Bulk CSV export of QSA data

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->
- Integração com sistemas de voto eletrônico em tempo real — Requer infraestrutura governamental indisponível
- Análise preditiva de comportamento parlamentar — Fora do escopo de transparência básica
- Aplicativo mobile nativo — Foco inicial na experiência web responsiva
- Frontend UI para dados QSA/conflict — Não implementado no v1.0 (backend-only — shipped v1.1)
- Real-time data refresh / push notifications — QSA data is batch-updated; websocket infra overkill
- Automated conflict alerts / email subscriptions — Requires auth system and email infra
- Auth-based user system — Not in scope for transparency tool; all data is public

## Context

**v1.1 shipped 2026-06-15.**
- Backend: FastAPI + SQLite + SQLAlchemy — 86+ tests passing
- Frontend: Next.js + TypeScript with complete QSA visualization dashboard
- Módulo QSA completo: ingestão, matching, detecção de conflitos, freshness tracking, dashboard /fiscalizacao
- 47/47 requirements satisfied across v1.0 (23) and v1.1 (24)
- Nyquist compliance: VERIFICATION.md for all 6 phases, VALIDATION.md for all 3 v1.0 phases
- All v1.0 tech debt resolved: datetime.utcnow(), dead code, port 8000 fallback

## Constraints

- **[Performance]**: Processamento eficiente de grandes volumes de dados CNPJ (milhões de registros) — Limita recursos de processamento em ambiente de desenvolvimento
- **[Offline]**: Funcionamento 100% offline após ingestão inicial — Evita dependência de conexão contínua com APIs externas
- **[Atualização Semanal]**: Scripts projetados para execução agendada semanal — Manter dados relativamente atuais sem sobrecarga diária
- **[Simplicidade]**: Código limpo e fácil de manter — Facilita contribuições e reduz bugs

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Usar SQLAlchemy como ORM | Integração com estrutura existente do projeto | ✓ Good |
| Processar arquivos ZIP diretamente | Evitar extração desnecessária em disco | ✓ Good |
| Utilizar rapidfuzz para matching difuso | Biblioteca leve e eficiente para fuzzy matching | ✓ Good |
| Estruturar em micro-services lógicos | Manter baixo acoplamento entre componentes | ✓ Good |
| Boolean relationship_type (False=CPF, True=nome_match) | Simples, queryável | ✓ Good |
| Idempotent DDL migration via PRAGMA guards | Re-executável sem erros | ✓ Good |
| Incremental upsert via on_conflict_do_update | ORM-safe, injection-free | ✓ Good |
| 3-factor scoring: capital(50) + CNAE(30) + CPF(20) | Modelo graduado simples | ✓ Good |
| Inline freshness in API responses | Sem endpoint separado | ✓ Good |
| Axios `api` baseURL `http://localhost:3001` | Consistent with next.config.js style | ✓ Good |
| QSA hooks use string-based params | Avoid `anos_ceap[]` bracket notation mismatch | ✓ Good |
| All QSA API consumers through qsaService | Single shared `api` axios instance | ✓ Good |
| CSS-only 50/30/20 segmented score bar | No JS/chart library dependency | ✓ Good |
| CONFLICT_CNAE_CLASSES centralized in CnaeLabel.tsx | Module-level const for maintainability | ✓ Good |
| Disclaimer banner static (non-dismissable) | Per D-11/D-12 constraint | ✓ Good |
| VERIFICATION.md sourced from MILESTONE-AUDIT.md | Avoids unnecessary code re-execution | ✓ Good |

## Current State

**v1.1 — Frontend QSA + Cleanup — Shipped 2026-06-15**

The QSA integration module now has a complete frontend visualization layer. Users can browse deputy-company relationships, filter by conflict status/exposure/spouse match, view score breakdowns, and see CNAE category labels. All accumulated tech debt from v1.0 is resolved, and all 6 phases have Nyquist compliance artifacts.

**Key metrics:**
- 4 phases shipped (7 total), 13 plans, 24 requirements
- 72 commits, 86 files changed, +10,940 LOC
- QSA dashboard: 7 display components, 4 API enhancements, mobile responsive
- All v1.0 blockers resolved

## Next Milestone Goals

- Company-to-deputado reverse lookup page
- Network graph visualization of QSA relationships
- Historical trend view of QSA changes
- Bulk CSV export of QSA data

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

*Last updated: 2026-06-15 after v1.1 milestone completion*
