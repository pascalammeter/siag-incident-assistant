# Testing Guide

## Run Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm test -- --watch

# With coverage report
npm test -- --coverage
```

## Test Structure

Tests use **Vitest** with jsdom for React components. Test files are located alongside source:
- `src/**/*.test.ts` or `src/**/*.test.tsx`
- Tests use supertest for API routes, vitest for mocking

## Test Categories

### API Tests (`tests/api/`)
- Health check endpoint
- Incident CRUD operations
- Export endpoints (PDF, JSON)
- Authentication (X-API-Key validation)
- Error handling

### Component Tests (`tests/components/`)
- Incident list rendering
- Wizard step interactions
- Form validation with react-hook-form
- Dark mode toggle

### Security Tests (`tests/security/`)
- API key middleware
- CORS validation
- Input sanitization

## Coverage Requirements

Target thresholds (enforced in CI):
- **Lines:** 75%
- **Functions:** 75%
- **Branches:** 70%
- **Statements:** 75%

## CI/CD Testing

GitHub Actions runs tests on every push:
1. Install dependencies
2. Run linting (ESLint)
3. Execute test suite with coverage
4. Upload to Codecov

**Required secrets:** `DATABASE_URL_CI`, `API_KEY_CI`

## Debugging Failing Tests

```bash
# Run a single test file
npm test -- tests/api/health.test.ts

# Run tests matching pattern
npm test -- --grep "incident"

# Debug with Node inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

Check `.github/workflows/ci.yml` for the full CI pipeline.
