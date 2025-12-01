# Authentication Test Suite

This directory contains comprehensive tests for the authentication system.

## Test Files

### E2E Tests (`test/auth.e2e-spec.ts`)
End-to-end tests that verify the complete authentication flow through HTTP endpoints.

**Coverage:**
- User registration with validation
- Email verification flow
- Login/logout functionality
- JWT authentication and protected routes
- Token refresh mechanism
- Password reset flow
- Password change functionality
- Rate limiting enforcement

**Running E2E Tests:**
```bash
npm run test:e2e
```

### Unit Tests (`src/auth/auth.service.spec.ts`)
Unit tests for the AuthService business logic with mocked dependencies.

**Coverage:**
- Registration logic
- Email verification
- Login with password validation
- Token generation
- Password reset
- Password change
- Error handling

**Running Unit Tests:**
```bash
npm test auth.service.spec.ts
```

## Test Environment Setup

The tests use a separate test database configuration. Make sure your `.env` file has the correct `DATABASE_URL` before running tests.

### Prerequisites

1. **PostgreSQL Running**: Ensure PostgreSQL is running
   ```bash
   sudo systemctl status postgresql
   ```

2. **Test Database**: Tests will clean up after themselves, but it's recommended to use a separate test database

## Running All Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

## Test Structure

Each test suite follows this pattern:

1. **Setup**: Initialize test module and mock dependencies
2. **Happy Path**: Test successful operations
3. **Error Cases**: Test validation and error handling
4. **Edge Cases**: Test boundary conditions
5. **Cleanup**: Clean up test data

## Key Test Scenarios

### Registration
- ✅ Successful registration
- ✅ Weak password rejection
- ✅ Invalid email rejection
- ✅ Duplicate email rejection

### Email Verification
- ✅ Valid token verification
- ✅ Invalid token rejection
- ✅ Expired token rejection

### Login
- ✅ Successful login with verified account
- ✅ Unverified email rejection
- ✅ Wrong password rejection
- ✅ Non-existent email rejection
- ✅ JWT token generation
- ✅ Refresh token cookie setting

### Protected Routes
- ✅ Access with valid token
- ✅ Rejection without token
- ✅ Rejection with invalid token

### Token Refresh
- ✅ Successful token refresh
- ✅ Invalid refresh token rejection

### Password Reset
- ✅ Reset token generation
- ✅ Password reset with valid token
- ✅ Invalid token rejection
- ✅ Password change confirmation email

### Password Change
- ✅ Change with correct current password
- ✅ Wrong current password rejection
- ✅ Unauthorized request rejection

### Security
- ✅ Rate limiting enforcement
- ✅ CORS configuration
- ✅ Cookie security (httpOnly, sameSite)

## Mocking Strategy

Unit tests mock:
- **DatabaseService**: Database operations
- **EmailService**: Email sending
- **JwtService**: Token generation
- **SessionsService**: Login tracking
- **ConfigService**: Environment configuration
- **bcrypt**: Password hashing

E2E tests use:
- **Real database**: For integration testing
- **Real validation**: For request validation
- **Real middleware**: For security testing

## Continuous Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    npm install
    npm run test:cov
    npm run test:e2e
```

## Debugging Tests

To debug a specific test:

```bash
# Run specific test file
npm test -- auth.service.spec.ts

# Run specific test suite
npm test -- --testNamePattern="register"

# Run with verbose output
npm test -- --verbose
```

## Coverage Reports

Generate and view coverage reports:

```bash
npm run test:cov
# Open coverage/lcov-report/index.html in browser
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Mocking**: Mock external dependencies
4. **Async**: Properly handle async operations
5. **Clear Names**: Use descriptive test names
6. **AAA Pattern**: Arrange, Act, Assert

## Adding New Tests

When adding new authentication features:

1. Add unit tests in `auth.service.spec.ts`
2. Add e2e tests in `auth.e2e-spec.ts`
3. Update this README with new scenarios
4. Ensure > 80% code coverage
