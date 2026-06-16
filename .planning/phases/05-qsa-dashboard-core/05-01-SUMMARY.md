---
plan: 05-01
phase: 05-qsa-dashboard-core
status: complete
commits:
  - 830b2cf (backend: sort params + spouse filter + aggregates)
  - 9c72e51 (frontend: DeputadoEmpresa type update)
tasks:
  - task: "Add sort params + aggregate counts to GET /deputados/empresas"
    status: done
    files: [Backend/app/api/deputados.py]
  - task: "Update DeputadoEmpresa interface in Frontend"
    status: done
    files: [Frontend/services/api.ts]
requirements-completed: [QSA-01, QSA-08, QSA-09]
verification: 05-VERIFICATION.md
---

## Summary

Enhanced `GET /deputados/empresas` with:
- `sort_by` param (score/capital/nome) with `sort_order` (asc/desc)
- `tem_conjuge` spouse filter param
- `total_alta_exposicao` and `total_conjuge` aggregate fields in response
- Validation: sort_by whitelist check returns 422 for invalid values

Updated `DeputadoEmpresa` interface with `total_alta_exposicao?: number` and `total_conjuge?: number`.

## Deviations

None.

## Issues Encountered

- `Relacao` model does not have `capital_social` column — it's on `Empresa`. Added outerjoin to `Empresa` and used `Empresa.capital_social` for capital sort.
