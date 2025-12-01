# Running Tests for Authentication System

## Quick Start - Run Tests Now! 🚀

```bash
cd backend

# Install test dependencies (if not already installed)
npm install

# Run all unit tests
npm test

# Run with watch mode (reruns on file changes)
npm run test:watch

# Generate coverage report
npm run test:cov
```

## Step-by-Step Guide for Beginners

### 1. **Unit Tests** (Test individual functions)

These test the authentication service methods in isolation.

```bash
# Run all tests
npm test

# Run only auth service tests
npm test auth.service.spec

# Run in watch mode (automatically reruns when you change files)
npm run test:watch
```

**What happens:**
- Jest (testing framework) runs all `*.spec.ts` files
- Tests mock the database and external services
- You'll see green checkmarks ✓ for passing tests
- Red X for failing tests

### 2. **E2E Tests** (Test complete user flows)

These test the entire authentication flow through HTTP requests.

**Before running E2E tests:**
- Make sure PostgreSQL is running: `sudo systemctl status postgresql`
- Make sure your `.env` file has correct `DATABASE_URL`

```bash
# Run e2e tests
npm run test:e2e

# This will:
# - Start the server
# - Make real HTTP requests
# - Clean up test data after
```

### 3. **Coverage Report** (See what code is tested)

```bash
npm run test:cov

# Opens a report showing:
# - Which lines of code are tested
# - Which lines are NOT tested
# - Overall coverage percentage

# View the HTML report:
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
```

## Understanding Test Output

When you run `npm test`, you'll see:

```
PASS  src/auth/auth.service.spec.ts
  AuthService
    register
      ✓ should register a new user successfully (25ms)
      ✓ should throw ConflictException if email already exists (10ms)
    login
      ✓ should login successfully with correct credentials (15ms)
      ✓ should throw UnauthorizedException with wrong password (8ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        3.456s
```

- **✓ (checkmark)** = Test passed!
- **✕ (X)** = Test failed
- Numbers like (25ms) = How long the test took

## Common Test Commands

```bash
# Run specific test file
npm test auth.service.spec.ts

# Run tests matching a pattern
npm test -- --testNamePattern="login"

# Run tests in specific folder
npm test src/auth

# Run tests with verbose output
npm test -- --verbose

# Update snapshots (if you have snapshot tests)
npm test -- --updateSnapshot
```

## Fixing the TypeScript Error

The JWT type error you're seeing is a **type definition mismatch** between packages - it doesn't affect runtime, but let's fix it:

**Option 1: Add type override (Quick fix)**

Add this to `tsconfig.json`:
```json
{
  "compilerOptions": {
    // ... existing config
    "skipLibCheck": true  // <-- Add this line
  }
}
```

**Option 2: Install compatible types**

```bash
npm install --save-dev @types/jsonwebtoken@^9.0.0
```

## Test File Locations

```
backend/
├── src/
│   └── auth/
│       └── auth.service.spec.ts      # Unit tests for AuthService
└── test/
    ├── auth.e2e-spec.ts               # E2E tests for auth endpoints
    ├── jest-e2e.json                  # E2E test configuration
    └── README.md                      # This file!
```

## What Each Test Type Does

### Unit Tests (`*.spec.ts`)
- **Fast** (milliseconds)
- Test one function at a time
- Mock database, email service, etc.
- Good for testing logic and error handling

Example: Testing that `register()` throws error for duplicate email

### E2E Tests (`*.e2e-spec.ts`)
- **Slower** (seconds)
- Test complete user flows
- Use real database
- Make real HTTP requests
- Good for testing integration

Example: Testing complete registration → verify email → login flow

## Debugging Failed Tests

If a test fails:

1. **Read the error message** - it tells you what went wrong
2. **Check the test name** - tells you which scenario failed
3. **Look at expected vs actual** - shows what was wrong

Example failed test:
```
● AuthService › login › should login successfully

  expect(received).toHaveProperty('accessToken')

  Received object does not have property 'accessToken'

    at Object.<anonymous> (auth.service.spec.ts:45:21)
```

This means the login didn't return an `accessToken` like it should.

## Running Tests in CI/CD

For GitHub Actions, GitLab CI, etc.:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
```

## Pro Tips

1. **Run tests before committing**
   ```bash
   npm test && git commit
   ```

2. **Use watch mode while developing**
   ```bash
   npm run test:watch
   ```

3. **Check coverage regularly**
   ```bash
   npm run test:cov
   ```
   Aim for > 80% coverage

4. **Name tests clearly**
   - Good: `should reject login with wrong password`
   - Bad: `test1`

5. **One assertion per test** (usually)
   Makes it easier to find what broke

## Need Help?

- **Jest docs**: https://jestjs.io/docs/getting-started
- **NestJS testing**: https://docs.nestjs.com/fundamentals/testing
- **Supertest (E2E)**: https://github.com/visionmedia/supertest

## Quick Troubleshooting

**Problem: `npm test` does nothing**
```bash
# Make sure jest is installed
npm install --save-dev @nestjs/testing jest ts-jest @types/jest
```

**Problem: E2E tests fail with database error**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

**Problem: Tests are slow**
```bash
# Run tests in parallel (faster)
npm test -- --maxWorkers=4

# Or run only changed tests
npm test -- --onlyChanged
```

## Example: Your First Test Run

```bash
# 1. Make sure you're in the backend directory
cd backend

# 2. Install dependencies (if you haven't)
npm install

# 3. Run the tests!
npm test

# You should see:
# PASS  src/auth/auth.service.spec.ts
# Test Suites: 1 passed
# Tests: 15 passed
# 🎉 All tests passed!
```

That's it! Now run `npm test` and see your authentication system fully tested! 🚀
