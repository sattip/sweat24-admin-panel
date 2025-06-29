import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiRequest, ApiError, AuthError, getApiUrl } from '@/config/api';
import { 
  createMockResponse, 
  createMockErrorResponse, 
  mockLocalStorage 
} from '../utils/test-utils';

describe('API Configuration', () => {
  const mockStorage = mockLocalStorage();
  
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });
    
    // Clear all mocks
    vi.clearAllMocks();
    mockStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getApiUrl', () => {
    it('should build correct API URL', () => {
      const endpoint = '/users';
      const expectedUrl = 'http://localhost:8001/api/v1/users';
      expect(getApiUrl(endpoint)).toBe(expectedUrl);
    });

    it('should handle endpoints without leading slash', () => {
      const endpoint = 'users';
      const expectedUrl = 'http://localhost:8001/api/v1/users';
      expect(getApiUrl(endpoint)).toBe(expectedUrl);
    });
  });

  describe('apiRequest', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test User' };
      global.fetch = vi.fn().mockResolvedValueOnce(createMockResponse(mockData));

      const result = await apiRequest('/users/1');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8001/api/v1/users/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('should include auth token in headers when available', async () => {
      const mockToken = 'test-token-123';
      mockStorage.setItem('auth-token', mockToken);
      
      global.fetch = vi.fn().mockResolvedValueOnce(createMockResponse({}));

      await apiRequest('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should handle POST request with body', async () => {
      const mockData = { name: 'New User', email: 'test@example.com' };
      const mockResponse = { id: 1, ...mockData };
      
      global.fetch = vi.fn().mockResolvedValueOnce(createMockResponse(mockResponse));

      const result = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(mockData),
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockData),
        })
      );
    });

    it('should handle 401 Unauthorized error', async () => {
      mockStorage.setItem('auth-token', 'expired-token');
      mockStorage.setItem('auth-user', JSON.stringify({ id: 1 }));
      
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockErrorResponse('Unauthorized', 401)
      );

      // Mock window.location
      delete (window as any).location;
      window.location = { href: '', pathname: '/dashboard' } as Location;

      await expect(apiRequest('/users')).rejects.toThrow(AuthError);
      
      // Should clear auth data
      expect(mockStorage.removeItem).toHaveBeenCalledWith('auth-token');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('auth-user');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('auth-timestamp');
      
      // Should redirect to login
      expect(window.location.href).toBe('/login');
    });

    it('should not redirect when already on login page', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockErrorResponse('Unauthorized', 401)
      );

      // Mock window.location
      delete (window as any).location;
      window.location = { href: '/login', pathname: '/login' } as Location;

      await expect(apiRequest('/users')).rejects.toThrow(AuthError);
      
      // Should not change location
      expect(window.location.href).toBe('/login');
    });

    it('should handle 403 Forbidden error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockErrorResponse('Access forbidden', 403)
      );

      await expect(apiRequest('/users')).rejects.toThrow(
        expect.objectContaining({
          message: 'Access forbidden',
          status: 403,
        })
      );
    });

    it('should handle 404 Not Found error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockErrorResponse('Resource not found', 404)
      );

      await expect(apiRequest('/users/999')).rejects.toThrow(
        expect.objectContaining({
          message: 'Resource not found',
          status: 404,
        })
      );
    });

    it('should handle 422 Validation error', async () => {
      const validationErrors = {
        message: 'Validation error',
        errors: {
          email: ['Email is required'],
          name: ['Name must be at least 3 characters'],
        },
      };
      
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockErrorResponse(JSON.stringify(validationErrors), 422)
      );

      await expect(apiRequest('/users')).rejects.toThrow(ApiError);
    });

    it('should handle 500 Server error', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce(
        createMockErrorResponse('Internal server error', 500)
      );

      await expect(apiRequest('/users')).rejects.toThrow(
        expect.objectContaining({
          message: 'Internal server error',
          status: 500,
        })
      );
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      await expect(apiRequest('/users')).rejects.toThrow(
        expect.objectContaining({
          message: 'Network error - please check your connection',
          status: 0,
        })
      );
    });

    it('should handle timeout errors', async () => {
      // Create a fetch that never resolves
      global.fetch = vi.fn().mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      // Temporarily reduce timeout for testing
      const originalTimeout = 10000;
      vi.useFakeTimers();

      const requestPromise = apiRequest('/users');
      
      // Fast-forward past the timeout
      vi.advanceTimersByTime(originalTimeout + 1000);

      await expect(requestPromise).rejects.toThrow(
        expect.objectContaining({
          message: 'Request timeout - please try again',
          status: 0,
        })
      );

      vi.useRealTimers();
    });

    it('should handle 204 No Content response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Headers(),
      } as Response);

      const result = await apiRequest('/users/1', { method: 'DELETE' });
      expect(result).toBeNull();
    });

    it('should handle non-JSON response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => { throw new Error('Invalid JSON'); },
        text: async () => 'Plain text response',
        headers: new Headers({
          'content-type': 'text/plain',
        }),
      } as Response);

      await expect(apiRequest('/users')).rejects.toThrow(
        expect.objectContaining({
          message: 'Invalid response format from server',
        })
      );
    });

    it('should parse JSON from text response', async () => {
      const mockData = { id: 1, name: 'Test' };
      
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => { throw new Error('Not JSON content-type'); },
        text: async () => JSON.stringify(mockData),
        headers: new Headers({
          'content-type': 'text/plain',
        }),
      } as Response);

      const result = await apiRequest('/users/1');
      expect(result).toEqual(mockData);
    });
  });
});