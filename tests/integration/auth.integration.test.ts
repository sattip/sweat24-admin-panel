import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { customRender, mockFetch, createMockResponse, createMockErrorResponse } from '../utils/test-utils';
import { mockUser } from '../utils/test-utils';
import LoginPage from '@/pages/LoginPage';
import App from '@/App';

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const user = userEvent.setup();
      
      // Mock successful login response
      mockFetch([
        {
          url: '/auth/login',
          response: createMockResponse({
            token: 'test-auth-token',
            user: mockUser,
          }),
        },
      ]);

      customRender(<LoginPage />);

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorage.getItem('auth-token')).toBe('test-auth-token');
        expect(localStorage.getItem('auth-user')).toBe(JSON.stringify(mockUser));
      });
    });

    it('should show error with invalid credentials', async () => {
      const user = userEvent.setup();
      
      // Mock failed login response
      mockFetch([
        {
          url: '/auth/login',
          response: createMockErrorResponse('Invalid credentials', 401),
        },
      ]);

      customRender(<LoginPage />);

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'wrong@test.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Ensure no auth data is saved
      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(localStorage.getItem('auth-user')).toBeNull();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      
      customRender(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      // Try to submit with invalid email
      await user.type(emailInput, 'invalidemail');
      await user.click(loginButton);

      // Check for validation error
      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should require password', async () => {
      const user = userEvent.setup();
      
      customRender(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      // Try to submit without password
      await user.type(emailInput, 'admin@test.com');
      await user.click(loginButton);

      // Check for validation error
      const passwordInput = screen.getByLabelText(/password/i);
      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      mockFetch([
        {
          url: '/auth/login',
          response: () => Promise.reject(new TypeError('Failed to fetch')),
        },
      ]);

      customRender(<LoginPage />);

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Logout Flow', () => {
    it('should successfully logout', async () => {
      const user = userEvent.setup();
      
      // Mock logout response
      mockFetch([
        {
          url: '/auth/logout',
          response: createMockResponse({ message: 'Logged out successfully' }),
        },
      ]);

      // Render app as authenticated user
      customRender(<App />, { isAuthenticated: true, initialRoute: '/dashboard' });

      // Find and click logout button
      const userMenu = screen.getByRole('button', { name: new RegExp(mockUser.name, 'i') });
      await user.click(userMenu);

      const logoutButton = screen.getByRole('menuitem', { name: /log out/i });
      await user.click(logoutButton);

      // Wait for logout to complete
      await waitFor(() => {
        expect(localStorage.getItem('auth-token')).toBeNull();
        expect(localStorage.getItem('auth-user')).toBeNull();
        expect(window.location.pathname).toBe('/login');
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      customRender(<App />, { initialRoute: '/dashboard' });

      expect(window.location.pathname).toBe('/login');
    });

    it('should allow access to protected route when authenticated', async () => {
      // Mock dashboard stats API
      mockFetch([
        {
          url: '/dashboard/stats',
          response: createMockResponse({
            total_members: 150,
            active_members: 120,
            total_revenue: 15000,
            monthly_revenue: 5000,
            pending_payments: 10,
            overdue_payments: 3,
          }),
        },
      ]);

      customRender(<App />, { isAuthenticated: true, initialRoute: '/dashboard' });

      // Should stay on dashboard
      expect(window.location.pathname).toBe('/dashboard');

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token automatically', async () => {
      vi.useFakeTimers();
      
      // Mock refresh token response
      const refreshMock = mockFetch([
        {
          url: '/auth/refresh',
          response: createMockResponse({
            token: 'new-auth-token',
            user: mockUser,
          }),
        },
      ]);

      customRender(<App />, { isAuthenticated: true, initialRoute: '/dashboard' });

      // Fast-forward 30 minutes (token refresh interval)
      vi.advanceTimersByTime(30 * 60 * 1000);

      await waitFor(() => {
        expect(refreshMock).toHaveBeenCalledWith(
          expect.stringContaining('/auth/refresh'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-token',
            }),
          })
        );
      });

      // Check new token is saved
      await waitFor(() => {
        expect(localStorage.getItem('auth-token')).toBe('new-auth-token');
      });

      vi.useRealTimers();
    });

    it('should logout when token refresh fails', async () => {
      vi.useFakeTimers();
      
      // Mock failed refresh response
      mockFetch([
        {
          url: '/auth/refresh',
          response: createMockErrorResponse('Token expired', 401),
        },
      ]);

      customRender(<App />, { isAuthenticated: true, initialRoute: '/dashboard' });

      // Fast-forward 30 minutes
      vi.advanceTimersByTime(30 * 60 * 1000);

      // Wait for logout
      await waitFor(() => {
        expect(localStorage.getItem('auth-token')).toBeNull();
        expect(window.location.pathname).toBe('/login');
      });

      vi.useRealTimers();
    });
  });

  describe('Session Persistence', () => {
    it('should restore session from localStorage on app load', async () => {
      // Set up authenticated state in localStorage
      localStorage.setItem('auth-token', 'stored-token');
      localStorage.setItem('auth-user', JSON.stringify(mockUser));
      localStorage.setItem('auth-timestamp', new Date().toISOString());

      // Mock dashboard stats API
      mockFetch([
        {
          url: '/dashboard/stats',
          response: createMockResponse({
            total_members: 150,
            active_members: 120,
            total_revenue: 15000,
            monthly_revenue: 5000,
            pending_payments: 10,
            overdue_payments: 3,
          }),
        },
      ]);

      customRender(<App />, { initialRoute: '/dashboard' });

      // Should load dashboard directly
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(window.location.pathname).toBe('/dashboard');
      });
    });

    it('should clear expired session', async () => {
      // Set up expired session
      const expiredTimestamp = new Date();
      expiredTimestamp.setHours(expiredTimestamp.getHours() - 25); // 25 hours ago
      
      localStorage.setItem('auth-token', 'expired-token');
      localStorage.setItem('auth-user', JSON.stringify(mockUser));
      localStorage.setItem('auth-timestamp', expiredTimestamp.toISOString());

      customRender(<App />, { initialRoute: '/dashboard' });

      // Should redirect to login
      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
        expect(localStorage.getItem('auth-token')).toBeNull();
      });
    });
  });
});