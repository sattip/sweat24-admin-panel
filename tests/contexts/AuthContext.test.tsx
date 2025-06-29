import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { createMockResponse, createMockErrorResponse, mockLocalStorage } from '../utils/test-utils';

// Wrapper component for hooks
const wrapper = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('AuthContext', () => {
  const mockStorage = mockLocalStorage();
  
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });
    
    // Mock fetch
    global.fetch = vi.fn();
    
    // Clear all mocks
    vi.clearAllMocks();
    mockStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state when not authenticated', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load auth state from localStorage', async () => {
      const storedUser = { id: 1, name: 'Stored User', email: 'stored@test.com' };
      const storedToken = 'stored-token';
      
      mockStorage.setItem('auth-token', storedToken);
      mockStorage.setItem('auth-user', JSON.stringify(storedUser));
      mockStorage.setItem('auth-timestamp', new Date().toISOString());

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(storedUser);
      expect(result.current.token).toBe(storedToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear expired session from localStorage', async () => {
      const expiredTimestamp = new Date();
      expiredTimestamp.setHours(expiredTimestamp.getHours() - 25); // 25 hours ago
      
      mockStorage.setItem('auth-token', 'expired-token');
      mockStorage.setItem('auth-user', JSON.stringify({ id: 1 }));
      mockStorage.setItem('auth-timestamp', expiredTimestamp.toISOString());

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      
      // Should have cleared localStorage
      expect(mockStorage.getItem('auth-token')).toBeNull();
      expect(mockStorage.getItem('auth-user')).toBeNull();
      expect(mockStorage.getItem('auth-timestamp')).toBeNull();
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const mockToken = 'test-token-123';
      
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockResponse({ token: mockToken, user: mockUser })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();

      // Should save to localStorage
      expect(mockStorage.getItem('auth-token')).toBe(mockToken);
      expect(mockStorage.getItem('auth-user')).toBe(JSON.stringify(mockUser));
      expect(mockStorage.getItem('auth-timestamp')).toBeTruthy();
    });

    it('should handle login failure', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockErrorResponse('Invalid credentials', 401)
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.login('wrong@example.com', 'wrongpassword');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');

      // Should not save to localStorage
      expect(mockStorage.getItem('auth-token')).toBeNull();
    });

    it('should clear previous error on successful login', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const mockToken = 'test-token-123';
      
      const { result } = renderHook(() => useAuth(), { wrapper });

      // First, create an error state
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockErrorResponse('Invalid credentials', 401)
      );

      await act(async () => {
        try {
          await result.current.login('wrong@example.com', 'wrongpassword');
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Invalid credentials');

      // Then, login successfully
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockResponse({ token: mockToken, user: mockUser })
      );

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Start with authenticated state
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const mockToken = 'test-token-123';
      
      mockStorage.setItem('auth-token', mockToken);
      mockStorage.setItem('auth-user', JSON.stringify(mockUser));
      mockStorage.setItem('auth-timestamp', new Date().toISOString());

      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockResponse({ message: 'Logged out successfully' })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      // Should clear localStorage
      expect(mockStorage.getItem('auth-token')).toBeNull();
      expect(mockStorage.getItem('auth-user')).toBeNull();
      expect(mockStorage.getItem('auth-timestamp')).toBeNull();
    });

    it('should clear auth state even if logout API fails', async () => {
      // Start with authenticated state
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const mockToken = 'test-token-123';
      
      mockStorage.setItem('auth-token', mockToken);
      mockStorage.setItem('auth-user', JSON.stringify(mockUser));
      mockStorage.setItem('auth-timestamp', new Date().toISOString());

      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Logout (will fail but should still clear local state)
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      // Should still clear localStorage
      expect(mockStorage.getItem('auth-token')).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      // Start with authenticated state
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const oldToken = 'old-token';
      const newToken = 'new-token';
      
      mockStorage.setItem('auth-token', oldToken);
      mockStorage.setItem('auth-user', JSON.stringify(mockUser));
      mockStorage.setItem('auth-timestamp', new Date().toISOString());

      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockResponse({ token: newToken, user: mockUser })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.token).toBe(oldToken);
      });

      // Refresh token
      await act(async () => {
        await result.current.refreshToken();
      });

      expect(result.current.token).toBe(newToken);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);

      // Should update localStorage
      expect(mockStorage.getItem('auth-token')).toBe(newToken);
    });

    it('should logout if token refresh fails', async () => {
      // Start with authenticated state
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const mockToken = 'test-token';
      
      mockStorage.setItem('auth-token', mockToken);
      mockStorage.setItem('auth-user', JSON.stringify(mockUser));
      mockStorage.setItem('auth-timestamp', new Date().toISOString());

      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockErrorResponse('Token expired', 401)
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Try to refresh token
      await act(async () => {
        try {
          await result.current.refreshToken();
        } catch (error) {
          // Expected to throw
        }
      });

      // Should be logged out
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);

      // Should clear localStorage
      expect(mockStorage.getItem('auth-token')).toBeNull();
    });

    it('should automatically refresh token at intervals', async () => {
      vi.useFakeTimers();
      
      // Start with authenticated state
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const oldToken = 'old-token';
      const newToken = 'new-token';
      
      mockStorage.setItem('auth-token', oldToken);
      mockStorage.setItem('auth-user', JSON.stringify(mockUser));
      mockStorage.setItem('auth-timestamp', new Date().toISOString());

      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ token: newToken, user: mockUser })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Fast-forward 30 minutes (token refresh interval)
      act(() => {
        vi.advanceTimersByTime(30 * 60 * 1000);
      });

      // Should have called refresh
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/refresh'),
          expect.any(Object)
        );
      });

      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should set error state on network failure', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'password123');
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Network error. Please check your connection.');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should clear error with clearError function', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockErrorResponse('Invalid credentials', 401)
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Create error
      await act(async () => {
        try {
          await result.current.login('wrong@example.com', 'wrongpassword');
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Invalid credentials');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});