// API Configuration for SWEAT24 Admin Panel

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  API_VERSION: '/api/v1',
  
  // Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
      REFRESH: '/auth/refresh',
    },
    // Resource endpoints
    USERS: '/users',
    PACKAGES: '/packages', 
    BOOKINGS: '/bookings',
    INSTRUCTORS: '/instructors',
    CLASSES: '/classes',
    PAYMENT_INSTALLMENTS: '/payment-installments',
    CASH_REGISTER: '/cash-register',
    BUSINESS_EXPENSES: '/business-expenses',
    DASHBOARD_STATS: '/dashboard/stats',
    USER_PACKAGES: '/user-packages',
    SEARCH: '/search',
    SETTINGS: '/settings',
    ASSESSMENTS: '/assessments',
  },
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Timeout in milliseconds
  TIMEOUT: 10000,
};

// Helper function to build full API URL
export const getApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with a forward slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${normalizedEndpoint}`;
};

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthError extends ApiError {
  constructor(message: string, status?: number) {
    super(message, status);
    this.name = 'AuthError';
  }
}

// Helper function for API requests with error handling
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = getApiUrl(endpoint);
  
  // Get auth token from localStorage
  const token = localStorage.getItem('auth-token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    // Making API request
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Response received
    
    // Handle different response statuses
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }
      } catch (e) {
        // Error parsing error response - logging removed for production
      }
      
      // Handle unauthorized (401) - token expired or invalid
      if (response.status === 401) {
        // Clear auth data
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
        localStorage.removeItem('auth-timestamp');
        
        // Only redirect if not already on login page and not calling auth endpoints
        if (!window.location.pathname.includes('/login') && 
            !endpoint.includes('/auth/')) {
          window.location.href = '/login';
        }
        
        throw new AuthError(errorMessage || 'Unauthorized - please login again', 401);
      }
      
      // Handle forbidden (403) - insufficient permissions
      if (response.status === 403) {
        throw new ApiError(errorMessage || 'Access forbidden - insufficient permissions', 403, errorData);
      }
      
      // Handle not found (404)
      if (response.status === 404) {
        throw new ApiError(errorMessage || 'Resource not found', 404, errorData);
      }
      
      // Handle server errors (5xx)
      if (response.status >= 500) {
        throw new ApiError(errorMessage || 'Server error - please try again later', response.status, errorData);
      }
      
      // Handle validation errors (422)
      if (response.status === 422) {
        throw new ApiError(errorMessage || 'Validation error', 422, errorData);
      }
      
      // Other errors
      throw new ApiError(errorMessage, response.status, errorData);
    }
    
    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return null as T;
    }
    
    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data as T;
    } else {
      const text = await response.text();
      if (!text) {
        return null as T;
      }
      // Try to parse as JSON anyway
      try {
        const data = JSON.parse(text);
        return data as T;
      } catch {
        throw new ApiError('Invalid response format from server', response.status);
      }
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Handle abort errors
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout - please try again', 0);
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError('Network error - please check your connection', 0);
    }
    
    // Re-throw our custom errors
    if (error instanceof ApiError || error instanceof AuthError) {
      throw error;
    }
    
    // Handle other errors
    // API request failed - logging removed for production
    throw new ApiError(error.message || 'An unexpected error occurred', 0);
  }
};

// Convenience methods for common HTTP methods
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: <T = any>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};