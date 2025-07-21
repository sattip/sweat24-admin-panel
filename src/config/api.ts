// API Configuration for SWEAT24 Admin Panel
console.log('Environment API URL:', import.meta.env.VITE_API_URL);
export const API_CONFIG = {
  BASE_URL: 'https://sweat93laravel.obs.com.gr',
  API_VERSION: '/api/v1',
  
  // Endpoints
  ENDPOINTS: {
    USERS: '/users',
    PACKAGES: '/packages', 
    BOOKINGS: '/bookings',
    INSTRUCTORS: '/instructors',
    CLASSES: '/classes',
    PAYMENT_INSTALLMENTS: '/payment-installments',
    CASH_REGISTER: '/cash-register',
    BUSINESS_EXPENSES: '/business-expenses',
    DASHBOARD_STATS: '/dashboard/stats',
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
  // If endpoint already starts with /api, don't add API_VERSION
  if (endpoint.startsWith('/api')) {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};

// Helper function for API requests with error handling
export const apiRequest = async <T = unknown>(
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

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // If unauthorized, redirect to login
      if (response.status === 401) {
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
        throw new Error('Unauthorized - please login again');
      }
      
      // For validation errors, try to get the error details
      if (response.status === 422) {
        const errorData = await response.json();
        const error = new Error(`Validation failed: ${response.status}`) as Error & {
          response: { data: unknown; status: number };
        };
        error.response = { data: errorData, status: response.status };
        throw error;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: unknown) {
    console.error('API request failed:', error);
    // If it's already a structured error with response data, keep it
    if (error && typeof error === 'object' && 'response' in error) {
      throw error;
    }
    throw error;
  }
};