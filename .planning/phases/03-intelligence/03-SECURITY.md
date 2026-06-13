---
phase: 03
slug: 03-intelligence
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-13
---

# Phase 03 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| SQL execution in schema migration | Raw SQL executed via conn.execute(text(...)) for DDL operations | Schema metadata (table/column names — no user data) |
| CSV data from Receita Federal | External, semi-trusted data source — CNAE fields parsed in bulk | CNAE codes, industry descriptions (public data) |
| Config seed value | Hardcoded default list of CNAE class codes | String literal, no user input |
| Config value -> CNAE class matching | String from Config table parsed into set for conflict matching | Config key-value pairs (admin-controlled) |
| CNAE code -> 5-digit class extraction | String slice of cnae_principal field | First 5 chars of CNAE code |
| HTTP query params -> API endpoint | Untrusted client input enters filtered queries | Boolean query params (conflito_interesse, tem_conflito) |
| API response -> client | Public conflict data returned to any caller | Derived conflict flags and scores |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-03-01 | Tampering | `migrate_schema.py` raw SQL | mitigate | All ALTER TABLE commands use PRAGMA table_info guards (`inspector.get_columns()`) to prevent errors on re-run. No user-supplied data enters these statements. | closed |
| T-03-02 | Information Disclosure | CNAE data (industry classification) | accept | CNAE codes are public data from Receita Federal QSA dataset — no business-confidential information. | closed |
| T-03-03 | Tampering | New model default values | mitigate | `conflito_interesse` defaults to False, `score_conflito` defaults to 0 — safe defaults prevent false positives during transition. | closed |
| T-03-04 | Tampering | CSV `cnae_secundaria` field (semicolon-split) | mitigate | Split on semicolon only — no eval or dynamic execution. Each code is a plain string stored in DB. No injection vector. | closed |
| T-03-05 | Denial of Service | Large secondary CNAE lists per empresa | mitigate | Each empresa typically has 1-10 secondary CNAE codes. Chunked processing (10k rows) bounds the total number of inserts. | closed |
| T-03-06 | Tampering | Config seed raw SQL | mitigate | INSERT INTO config uses hardcoded string literal — no user input. Behind SELECT check gate for idempotency. | closed |
| T-03-07 | Tampering | Config `conflito_cnae_classes` string -> set | mitigate | Split on comma and strip whitespace only. Non-numeric entries are harmless (simply won't match any CNAE). | closed |
| T-03-08 | Tampering | `cnae_principal[:5]` — short string slicing | mitigate | If cnae_principal is shorter than 5 chars, `[:5]` returns whatever exists. This is safe — it just won't match any conflict class. | closed |
| T-03-09 | Tampering | Score computation overflow | mitigate | Max score is 50+30+20=100, stored as Integer. Cannot overflow within Python's int range. | closed |
| T-03-10 | Information Disclosure | Conflict score reveals relationship sensitivity | accept | All data is derived from public QSA records. CNAE codes and capital social are public information. | closed |
| T-03-11 | Denial of Service | `GET /deputados/empresas` conflito_interesse filter | mitigate | Filter is a simple boolean WHERE clause on an indexed column (`idx_relacoes_conflito_interesse`). No performance impact. | closed |
| T-03-12 | Tampering | `conflito_interesse` bool query param | mitigate | FastAPI validates `true`/`false` strings. Invalid values return 422. | closed |
| T-03-13 | Information Disclosure | Conflict data in responses | accept | All derived from public QSA records. No private or sensitive information. | closed |
| T-03-SC | Tampering | package installs | mitigate | No new packages added in Phase 3. All dependencies already in requirements.txt. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-01 | T-03-02 | CNAE codes are public data from Receita Federal QSA dataset — no business-confidential information. | Phase design | 2026-06-13 |
| AR-03-02 | T-03-10 | All data is derived from public QSA records. CNAE codes and capital social are public information already exposed in other endpoints. | Phase design | 2026-06-13 |
| AR-03-03 | T-03-13 | All conflict data derived from public QSA records. No private or sensitive information is exposed beyond what is already public. | Phase design | 2026-06-13 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By | Verdict |
|------------|---------------|--------|------|--------|---------|
| 2026-06-13 | 14 | 14 | 0 | gsd-security-auditor | SECURED |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-13
