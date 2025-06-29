# SWEAT24 Admin Panel Test Suite

This directory contains the comprehensive test suite for the SWEAT24 Admin Panel, covering unit tests, integration tests, and error handling scenarios.

## Test Structure

```
tests/
├── services/           # Unit tests for API services
│   ├── api.test.ts    # Core API configuration tests
│   └── apiService.test.ts # API service function tests
├── integration/        # Integration tests for user flows
│   ├── auth.integration.test.ts        # Authentication flow tests
│   ├── user-management.integration.test.ts # User CRUD operations
│   └── booking.integration.test.ts     # Booking management tests
├── contexts/           # Context tests
│   └── AuthContext.test.tsx # Authentication context tests
├── utils/              # Test utilities and helpers
│   ├── test-utils.ts   # Common test utilities
│   ├── mock-data.ts    # Mock data for tests
│   └── auth-test-utils.ts # Authentication test helpers
├── error-handling.test.ts # Error handling scenarios
├── setup.ts            # Test setup and configuration
└── README.md           # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test auth.integration.test
```

### Run tests matching pattern
```bash
npm test -- --grep "login"
```

## Test Categories

### 1. Unit Tests

#### API Service Tests (`services/`)
- Tests for all API service functions
- Request parameter validation
- Response handling
- Error scenarios

Example:
```typescript
describe('usersApi', () => {
  it('should get all users', async () => {
    // Test implementation
  });
});
```

### 2. Integration Tests

#### Authentication Flow (`auth.integration.test.ts`)
- Login with valid/invalid credentials
- Logout functionality
- Token refresh
- Session persistence
- Protected route access

#### User Management (`user-management.integration.test.ts`)
- List users with pagination
- Search and filter users
- Create new users
- Update existing users
- Delete users
- Form validation

#### Booking Management (`booking.integration.test.ts`)
- List bookings with filters
- Create new bookings
- Check-in functionality
- Cancel bookings
- Booking statistics

### 3. Error Handling Tests

#### Network Errors
- Connection failures
- Timeout errors
- Retry mechanisms

#### API Errors
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 422 Validation Error
- 500 Server Error

#### Form Errors
- Client-side validation
- Server-side validation
- Error display and clearing

## Test Utilities

### Mock Data (`utils/mock-data.ts`)
Provides consistent mock data for:
- Users
- Packages
- Bookings
- Classes
- Instructors
- Payment installments
- Cash register entries
- Business expenses
- Settings
- Assessments

### Test Utils (`utils/test-utils.ts`)
Helper functions for:
- Custom render with providers
- Mock fetch responses
- Mock localStorage
- Async utilities

### Auth Test Utils (`utils/auth-test-utils.ts`)
Specialized helpers for:
- Mock auth context
- Login/logout simulation
- Token refresh testing
- Session management

## Writing Tests

### Basic Test Structure
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender, mockFetch } from '../utils/test-utils';

describe('Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    // Arrange
    mockFetch([/* mock responses */]);
    
    // Act
    customRender(<Component />, { isAuthenticated: true });
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });
});
```

### Mocking API Calls
```typescript
mockFetch([
  {
    url: '/api/users',
    response: createMockResponse(mockUsers),
  },
  {
    url: '/api/users/1',
    response: createMockErrorResponse('Not found', 404),
  },
]);
```

### Testing User Interactions
```typescript
const user = userEvent.setup();

// Click button
await user.click(screen.getByRole('button', { name: /submit/i }));

// Type in input
await user.type(screen.getByLabelText(/email/i), 'test@example.com');

// Select option
await user.selectOptions(screen.getByRole('combobox'), 'option-value');
```

### Testing Async Operations
```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Mock External Dependencies**: Use mock functions for API calls, localStorage, etc.
3. **Test User Perspective**: Test from the user's perspective, not implementation details
4. **Meaningful Assertions**: Use specific assertions that clearly indicate what's being tested
5. **Error Scenarios**: Always test both success and error paths
6. **Accessibility**: Use accessible queries (getByRole, getByLabelText) when possible
7. **Async Handling**: Always wait for async operations to complete
8. **Cleanup**: Clean up after tests (clear mocks, restore timers, etc.)

## Coverage Goals

- **Overall Coverage**: Aim for >80% code coverage
- **Critical Paths**: 100% coverage for authentication and data mutations
- **Error Handling**: All error scenarios should be tested
- **Edge Cases**: Test boundary conditions and edge cases

## Debugging Tests

### Debug Output
```typescript
// Print element tree
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));

// Log all queries
screen.logTestingPlaygroundURL();
```

### Run Single Test
```typescript
it.only('should run only this test', () => {
  // Test implementation
});
```

### Skip Test
```typescript
it.skip('should skip this test', () => {
  // Test implementation
});
```

## Continuous Integration

Tests are automatically run in CI/CD pipeline:
- On every push to feature branches
- On pull requests to main branch
- Before deployment to production

Failed tests will block merging and deployment.