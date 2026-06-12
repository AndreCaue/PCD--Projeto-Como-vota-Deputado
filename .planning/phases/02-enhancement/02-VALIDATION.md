---
phase: 02
slug: enhancement
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-12
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
| 02-01-01 | 01 | 1 | CONF-03 | — | Validate capital_social parsed correctly | unit | New test needed | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | CONF-04 | — | via_conjuge=True for nome_match rels | unit | New test needed | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | MAT-02 | — | Confidence tiers 100/85/60/0 | unit | `pytest tests/test_qsa_matching.py -x -k "confidence"` | ✅ | ⬜ pending |
| 02-02-01 | 02 | 1 | INF-02 | — | Incremental upsert doesn't duplicate rows | integration | New test needed | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | DQ-01 | — | qsa_metadata tracks last_import_at | integration | New test needed | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | API-02 | — | GET /deputados/empresas pagination | integration | New test needed | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | API-04 | — | Freshness flags in responses | integration | New test needed | ❌ W0 | ⬜ pending |
| 02-03-03 | 03 | 2 | INF-04 | — | Indices created after migration | unit | New test needed | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 2 | DQ-04 | — | Staleness flag true >45 days | integration | New test needed | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `tests/test_qsa_flags.py` — alta_exposicao, via_conjuge flag tests
- [ ] `tests/test_api_endpoints.py` — GET /deputados/empresas, GET /qsa/freshness tests
- [ ] `tests/test_incremental_qsa.py` — Incremental upsert idempotency tests
- [ ] `tests/test_freshness.py` — qsa_metadata, staleness tests
- [ ] `tests/conftest.py` — new fixtures: sample_qsa_metadata, sample_empresa_with_capital

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Auto-startup freshness check triggers incremental update | INF-02 | Requires server startup cycle | Start server, check logs for `asyncio.create_task` execution |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
