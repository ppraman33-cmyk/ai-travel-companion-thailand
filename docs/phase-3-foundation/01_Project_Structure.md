# Project Structure

| Path                       | Responsibility                                                     |
| -------------------------- | ------------------------------------------------------------------ |
| `app/`                     | Next.js route shell and global presentation entry points           |
| `components/ui/`           | Framework-facing, reusable presentation components                 |
| `application/`             | Use-case service contracts and application boundaries              |
| `domain/models/`           | Provider- and framework-independent domain types                   |
| `domain/repositories/`     | Persistence contracts owned by the domain                          |
| `infrastructure/`          | Replaceable technical adapters and future persistence boundaries   |
| `providers/`               | Replaceable third-party capability contracts and future adapters   |
| `config/`                  | Validated environment, feature flags, and provider selection types |
| `shared/`                  | Cross-layer errors, results, logging contracts, and validation     |
| `middleware/`              | Security-header configuration                                      |
| `styles/`                  | Provisional design tokens                                          |
| `tests/`                   | Unit, end-to-end, accessibility, and synthetic fixture foundations |
| `docs/phase-3-foundation/` | Phase 3A implementation documentation                              |

## Import discipline

The `@/` alias resolves from the project root. Imports should target the narrowest public contract.
No barrel may hide a dependency from UI to infrastructure. Repository and service implementations
will live outside UI paths and will be provided through explicit composition.

## Reserved areas

The existing `backend/`, `frontend/`, `mobile/`, `admin/`, `database/`, and `api/` directories remain
reserved by earlier planning. Phase 3A does not populate them with competing frameworks or
placeholder application implementations.
