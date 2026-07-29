# Testing

## Test layers

- Unit tests validate results, configuration safety, log redaction, and isolated UI semantics.
- End-to-end tests validate that the application shell builds and renders in a browser.
- Accessibility checks begin with the checklist in `tests/accessibility/` and become automated as
  interactive workflows are introduced.
- Repository and provider contract tests will be added alongside later concrete adapters.

Vitest uses a browser-like test environment for component tests. Playwright starts the production
application locally for end-to-end execution.

## Data policy

Tests use invented fixtures only. Every synthetic identifier and label must be visibly synthetic.
Fixtures may not contain real place records, emergency contact data, licensed images, or plausible
publication claims. Production configuration rejects the synthetic-data feature flag.

## Quality gates

Before merging foundation changes:

1. Install from the lockfile.
2. Run TypeScript type checking.
3. Run ESLint.
4. Run unit tests.
5. Build the production bundle.
6. Run Playwright end-to-end tests when browser tooling is available.

CI enforces the first five gates on pushes to `main` and pull requests.
