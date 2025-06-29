import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender, mockFetch, createMockErrorResponse } from './utils/test-utils';
import App from '@/App';
import UsersPage from '@/pages/UsersPage';
import { ApiError, AuthError } from '@/config/api';

describe('Error Handling Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Network Errors', () => {
    it('should handle network failure gracefully', async () => {
      // Mock network failure
      mockFetch([
        {
          url: /\/users$/,
          response: () => Promise.reject(new TypeError('Failed to fetch')),
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Should show network error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
        expect(screen.getByText(/please check your connection/i)).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should retry failed requests', async () => {
      const user = userEvent.setup();
      
      let attemptCount = 0;
      
      // Mock network failure then success
      mockFetch([
        {
          url: /\/users$/,
          response: () => {
            attemptCount++;
            if (attemptCount === 1) {
              return Promise.reject(new TypeError('Failed to fetch'));
            }
            return createMockResponse({ data: [] });
          },
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
        expect(screen.getByText(/users/i)).toBeInTheDocument();
      });
    });

    it('should handle timeout errors', async () => {
      vi.useFakeTimers();
      
      // Mock request that never completes
      mockFetch([
        {
          url: /\/users$/,
          response: () => new Promise(() => {}), // Never resolves
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Fast-forward past timeout
      vi.advanceTimersByTime(11000); // 11 seconds (past 10s timeout)

      // Should show timeout error
      await waitFor(() => {
        expect(screen.getByText(/request timeout/i)).toBeInTheDocument();
        expect(screen.getByText(/please try again/i)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('API Errors', () => {
    it('should handle 404 Not Found errors', async () => {
      mockFetch([
        {
          url: /\/users\/999$/,
          response: createMockErrorResponse('User not found', 404),
        },
      ]);

      // Simulate navigating to a non-existent user profile
      customRender(<App />, { isAuthenticated: true, initialRoute: '/users/999' });

      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).toBeInTheDocument();
        expect(screen.getByText(/404/i)).toBeInTheDocument();
      });

      // Should show back button
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('should handle 500 Server errors', async () => {
      mockFetch([
        {
          url: /\/users$/,
          response: createMockErrorResponse('Internal server error', 500),
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
        expect(screen.getByText(/please try again later/i)).toBeInTheDocument();
      });
    });

    it('should handle 403 Forbidden errors', async () => {
      mockFetch([
        {
          url: /\/users$/,
          response: createMockErrorResponse('Access forbidden', 403),
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      await waitFor(() => {
        expect(screen.getByText(/access forbidden/i)).toBeInTheDocument();
        expect(screen.getByText(/insufficient permissions/i)).toBeInTheDocument();
      });
    });

    it('should handle validation errors (422)', async () => {
      const user = userEvent.setup();
      
      mockFetch([
        {
          url: /\/users$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'POST')) {
              return createMockErrorResponse(
                JSON.stringify({
                  message: 'Validation failed',
                  errors: {
                    email: ['Email is invalid', 'Email already exists'],
                    name: ['Name is too short'],
                  },
                }),
                422
              );
            }
            return createMockResponse({ data: [] });
          },
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Open create user modal
      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      // Submit invalid data
      const submitButton = screen.getByRole('button', { name: /create user/i });
      await user.click(submitButton);

      // Should show all validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is invalid/i)).toBeInTheDocument();
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
        expect(screen.getByText(/name is too short/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Errors', () => {
    it('should handle expired token during API call', async () => {
      // Start authenticated
      localStorage.setItem('auth-token', 'expired-token');
      localStorage.setItem('auth-user', JSON.stringify({ id: 1, name: 'Test User' }));
      
      mockFetch([
        {
          url: /\/users$/,
          response: createMockErrorResponse('Token expired', 401),
        },
      ]);

      customRender(<App />, { initialRoute: '/users' });

      // Should redirect to login
      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
      });

      // Should clear auth data
      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(localStorage.getItem('auth-user')).toBeNull();
    });

    it('should not redirect on 401 when already on login page', async () => {
      mockFetch([
        {
          url: /\/auth\/login$/,
          response: createMockErrorResponse('Invalid credentials', 401),
        },
      ]);

      customRender(<App />, { initialRoute: '/login' });

      const user = userEvent.setup();
      
      // Try to login
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'wrong@test.com');
      await user.type(passwordInput, 'wrongpass');
      await user.click(loginButton);

      // Should stay on login page and show error
      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Boundaries', () => {
    it('should catch and display React errors gracefully', async () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Create a component that will throw an error
      const BrokenComponent = () => {
        throw new Error('Component crashed!');
      };

      // Wrap in error boundary
      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        const [hasError, setHasError] = React.useState(false);

        React.useEffect(() => {
          const handleError = () => setHasError(true);
          window.addEventListener('error', handleError);
          return () => window.removeEventListener('error', handleError);
        }, []);

        if (hasError) {
          return (
            <div>
              <h1>Something went wrong</h1>
              <p>We apologize for the inconvenience. Please refresh the page.</p>
              <button onClick={() => window.location.reload()}>Refresh Page</button>
            </div>
          );
        }

        return <>{children}</>;
      };

      try {
        customRender(
          <ErrorBoundary>
            <BrokenComponent />
          </ErrorBoundary>
        );
      } catch (error) {
        // Component will throw, but error boundary should catch it
      }

      // Should show error UI
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        expect(screen.getByText(/please refresh the page/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Form Error Handling', () => {
    it('should clear errors when user corrects input', async () => {
      const user = userEvent.setup();
      
      customRender(<UsersPage />, { isAuthenticated: true });

      // Open create user modal
      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      // Submit empty form to trigger validation
      const submitButton = screen.getByRole('button', { name: /create user/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Start typing in name field
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'John');

      // Name error should clear
      await waitFor(() => {
        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
      });

      // Email error should still be present
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('should show inline validation for email format', async () => {
      const user = userEvent.setup();
      
      customRender(<UsersPage />, { isAuthenticated: true });

      // Open create user modal
      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      // Type invalid email
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'notanemail');
      
      // Blur to trigger validation
      await user.tab();

      // Should show format error
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });

      // Correct the email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@email.com');
      await user.tab();

      // Error should clear
      await waitFor(() => {
        expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner during data fetch', async () => {
      // Mock slow response
      mockFetch([
        {
          url: /\/users$/,
          response: () => new Promise(resolve => 
            setTimeout(() => resolve(createMockResponse({ data: [] })), 100)
          ),
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Should show loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });

    it('should disable form during submission', async () => {
      const user = userEvent.setup();
      
      // Mock slow create response
      mockFetch([
        {
          url: /\/users$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'POST')) {
              return new Promise(resolve => 
                setTimeout(() => resolve(createMockResponse({ id: '1', name: 'New User' })), 100)
              );
            }
            return createMockResponse({ data: [] });
          },
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Open create user modal
      const addButton = screen.getByRole('button', { name: /add new user/i });
      await user.click(addButton);

      // Fill minimal required fields
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      
      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'new@example.com');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create user/i });
      await user.click(submitButton);

      // Button should be disabled and show loading state
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/creating/i)).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Toast Notifications', () => {
    it('should show success toast for successful operations', async () => {
      const user = userEvent.setup();
      
      mockFetch([
        {
          url: /\/users$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'DELETE')) {
              return createMockResponse({ message: 'User deleted successfully' });
            }
            return createMockResponse({ data: [{ id: '1', name: 'Test User' }] });
          },
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Wait for user to load
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Delete user
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Should show success toast
      await waitFor(() => {
        const toast = screen.getByRole('status');
        expect(toast).toHaveTextContent(/user deleted successfully/i);
      });
    });

    it('should show error toast for failed operations', async () => {
      const user = userEvent.setup();
      
      mockFetch([
        {
          url: /\/users$/,
          response: () => {
            if (global.fetch.mock.calls.find(call => call[1]?.method === 'DELETE')) {
              return createMockErrorResponse('Cannot delete user with active bookings', 400);
            }
            return createMockResponse({ data: [{ id: '1', name: 'Test User' }] });
          },
        },
      ]);

      customRender(<UsersPage />, { isAuthenticated: true });

      // Wait for user to load
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Try to delete user
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Should show error toast
      await waitFor(() => {
        const toast = screen.getByRole('alert');
        expect(toast).toHaveTextContent(/cannot delete user with active bookings/i);
      });
    });
  });
});