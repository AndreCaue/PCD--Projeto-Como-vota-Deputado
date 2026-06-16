---
phase: 6
slug: polish-compliance
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-15
---

# Phase 6 — Polish & Compliance Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| component→DOM | New components (ScoreBreakdownBar, CnaeLabel) render score/CNAE data as DOM elements | No user input, no XSS vector |
| client→DOM | Disclaimer banner renders static disclaimer text | No user input |
| container→localhost | Docker healthchecks make HTTP requests to localhost only | No external network |
| host→container volume | QSA SQLite data persisted via named volume | SQLite file I/O |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-06-01-01 | Tampering | ScoreBreakdownBar | accept | Bar renders from existing API response fields — no new data path or user input. Score factor derivation is client-side only; backend formula changes may show incorrect segments but this is a correctness issue, not a security issue. | closed |
| T-06-02-01 | Tampering | DisclaimerBanner | accept | Static component with hardcoded text — no user-modifiable content. | closed |
| T-06-03-01 | Tampering | docker-compose.yml healthcheck | mitigate | Healthcheck uses Python stdlib `urllib` (no `curl` in slim image) and Alpine `wget` (BusyBox default) — reducing attack surface. Both checks target localhost only. | closed |
| T-06-03-02 | Denial of Service | Healthcheck interval | accept | 30s interval with 3 retries prevents healthcheck storm. `start_period: 15s` gives container initialization time. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01 | T-06-01-01 | Score breakdown is client-side derived from existing boolean flags. If backend scoring formula changes, the bar may render inaccurate segments — but this affects correctness, not security. Accept as a design constraint. | plan author | 2026-06-15 |
| AR-02 | T-06-02-01 | Disclaimer banner is hardcoded static text. No mechanism for dynamic updates without a code deploy. Accept as a design constraint for v1.1. | plan author | 2026-06-15 |
| AR-03 | T-06-03-02 | Healthcheck storm is inherently rate-limited by 30s interval and 3-retry cap. Accept as sufficiently bounded for a two-service deployment. | plan author | 2026-06-15 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-15 | 4 | 4 | 0 | gsd-secure-phase (automated) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-15
