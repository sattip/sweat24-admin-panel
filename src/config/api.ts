// API Configuration for SWEAT24 Admin Panel
console.log('Environment API URL:', import.meta.env.VITE_API_URL);
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
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
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};

// Helper function for API requests with error handling
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
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
    console.log('Making API request to:', url);
    const response = await fetch(url, config);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      // If unauthorized, redirect to login
      if (response.status === 401) {
        localStorage.removeItem('auth-token');
        window.location.href = '/login';
        throw new Error('Unauthorized - please login again');
      }
      
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    if (!responseText) {
      throw new Error('Empty response from server');
    }
    
    const data = JSON.parse(responseText);
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};