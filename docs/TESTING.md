# STRATIX AI - Testing Framework

This document outlines the testing strategy and frameworks used in STRATIX AI.

## Testing Stack

- **Unit Tests**: Jest
- **Integration Tests**: Jest + Supertest (API)
- **E2E Tests**: Cypress (planned for Phase 2)
- **Test Coverage**: Minimum 80% for critical paths

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

## Test Structure

Tests are organized alongside the code they test:

```
src/
  modules/
    auth/
      auth.service.ts
      auth.service.spec.ts
      auth.controller.ts
      auth.controller.spec.ts
```

## Backend Testing (NestJS)

### Unit Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### Integration Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/signin (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Frontend Testing (Next.js)

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders a button', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Test Coverage Goals

| Module | Target Coverage |
|--------|-----------------|
| Auth | 90% |
| Projects | 85% |
| API Routes | 80% |
| Utilities | 75% |
| UI Components | 70% |

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment checks

## Best Practices

1. **Write tests first**: Use TDD when possible
2. **Keep tests isolated**: Each test should be independent
3. **Use descriptive names**: Test names should describe what is being tested
4. **Mock external dependencies**: Use Jest mocks for external services
5. **Test edge cases**: Include tests for error scenarios

## Debugging Tests

```bash
# Run tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in Chrome DevTools
```

## Future Plans

- E2E testing with Cypress
- Performance testing
- Load testing for API
- Visual regression testing
