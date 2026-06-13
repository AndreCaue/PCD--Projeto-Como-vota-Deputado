---
phase: 02
slug: enhancement
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-12
updated: 2026-06-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 7.x |
| **Config file** | `Backend/conftest.py` |
| **Quick run command** | `cd Backend && pytest tests/ -x -q` |
| **Full suite command** | `cd Backend && pytest tests/ -v` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** `cd Backend && pytest tests/ -x -q`
- **After every plan wave:** `cd Backend && pytest tests/ -v`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | CONF-03 | — | alta_exposicao flag when capital_social > threshold | unit | `pytest tests/test_qsa_flags.py -x -k "alta_exposicao"` | ✅ | ✅ covered |
| 02-01-02 | 01 | 1 | CONF-04 | — | via_conjuge=True for nome_match rels | unit | `pytest tests/test_qsa_flags.py -x -k "via_conjuge"` | ✅ | ✅ covered |
| 02-01-03 | 01 | 1 | MAT-02 | — | Confidence tiers 100/85/60/0 | unit | `pytest tests/test_qsa_matching.py -x -k "confidence_tier"` | ✅ | ✅ covered |
| 02-02-01 | 02 | 1 | INF-02 | — | Incremental upsert doesn't duplicate rows | integration | `pytest tests/test_qsa_ingest.py -x -k "upsert or capital_parsing"` | ✅ | ✅ covered |
| 02-02-02 | 02 | 1 | DQ-01 | — | qsa_metadata tracks import metadata | integration | `pytest tests/test_qsa_ingest.py -x -k "metadata_creation"` | ✅ | ✅ covered |
| 02-03-01 | 03 | 2 | API-02 | — | GET /deputados/empresas pagination | integration | `pytest tests/test_api_deputados.py -x -k "empresas"` | ✅ | ✅ covered |
| 02-03-02 | 03 | 2 | API-04 | — | Freshness flags in responses | integration | `pytest tests/test_api_deputados.py -x -k "freshness"` | ✅ | ✅ covered |
| 02-03-03 | 03 | 2 | INF-04 | — | Indices created after migration | unit | `pytest tests/test_database.py -x -k "indices"` | ✅ | ✅ covered |
| 02-04-01 | 04 | 2 | DQ-04 | — | Staleness flag true >45 days | integration | `pytest tests/test_api_deputados.py -x -k "dados_antigos"` | ✅ | ✅ covered |

---

## Wave 0 Requirements

- [x] `tests/test_qsa_flags.py` — alta_exposicao, via_conjuge flag tests (8 tests)
- [x] `tests/test_api_deputados.py` — GET /deputados/empresas, GET /qsa/freshness tests (8 tests)
- [x] `tests/test_qsa_ingest.py` — Incremental upsert idempotency + metadata tests (2 new tests)
- [x] `tests/test_database.py` — Database index verification (1 new test)
- [x] `tests/test_qsa_matching.py` — Confidence tier-specific tests (3 new tests)
- [x] `tests/conftest.py` — new fixtures: sample_qsa_metadata, sample_empresa_with_capital

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Auto-startup freshness check triggers incremental update | INF-02 | Requires server startup cycle | Start server, check logs for `asyncio.create_task` execution |

---

## Validation Audit 2026-06-12

| Metric | Count |
|--------|-------|
| Gaps found | 7 |
| Resolved | 6 |
| Escalated | 1 |
| Total tests | 74 (60 existing + 14 new) |
| Test suite | `cd Backend && pytest tests/ -x -q` — green |

## Validation Audit 2026-06-13

| Metric | Count |
|--------|-------|
| Gaps found | 1 (remaining escalated: DQ-01) |
| Resolved | 1 |
| Escalated | 0 |
| Total tests | 86 (all Phase 2 + Phase 1) |
| Test suite | `cd Backend && pytest tests/ -x -q` — green |

---

**Resolved 2026-06-13:** Added `return total` to `processar_csv_socios()` in `import_qsa.py:101`. DQ-01 metadata test (`test_importar_qsa_metadata_creation`) now passes naturally without monkeypatch.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (7/7 automated)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ Phase 2 Nyquist-compliant — all 9 tasks have automated verification. DQ-01 escalation resolved 2026-06-13.
