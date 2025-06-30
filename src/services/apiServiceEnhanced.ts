// Enhanced API Service with Error Handling and Retry Logic
import { apiRequest, API_CONFIG } from '../config/api';
import { withRetry, RetryConfig } from '../utils/errorHandler';
import { offlineCapableRequest } from '../utils/networkStatus';
import type { 
  User, 
  Package, 
  Booking, 
  Instructor, 
  Class as GymClass,
  PaymentInstallment,
  CashRegisterEntry,
  BusinessExpense,
  UserPackage,
  Settings,
  Assessment,
  BodyMeasurement,
  EnduranceTest,
  StrengthLog
} from '../data/mockData';

// Default retry configuration for different types of operations
const DEFAULT_RETRY_CONFIGS: Record<string, RetryConfig> = {
  read: {
    maxAttempts: 3,
    delay: 1000,
    backoff: true,
  },
  write: {
    maxAttempts: 2,
    delay: 2000,
    backoff: true,
    shouldRetry: (error: any) => {
      // Don't retry on validation errors
      return error?.status !== 422 && error?.status !== 400;
    },
  },
  delete: {
    maxAttempts: 2,
    delay: 1500,
    backoff: false,
  },
};

// Enhanced API wrapper with retry and offline support
export function createEnhancedApi<T>(
  apiFunction: () => Promise<T>,
  options?: {
    retryConfig?: RetryConfig;
    offlineConfig?: {
      cacheKey?: string;
      cacheDuration?: number;
      queueIfOffline?: boolean;
      fallback?: () => T;
    };
  }
) {
  return async (): Promise<T> => {
    if (options?.offlineConfig) {
      return offlineCapableRequest(
        () => withRetry(apiFunction, options.retryConfig),
        options.offlineConfig
      );
    }
    
    return withRetry(apiFunction, options?.retryConfig);
  };
}

// Enhanced Users API with retry and offline support
export const enhancedUsersApi = {
  getAll: (params?: { search?: string; status?: string; page?: number }) =>
    createEnhancedApi(
      () => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.page) queryParams.append('page', params.page.toString());
        
        const endpoint = `${API_CONFIG.ENDPOINTS.USERS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return apiRequest(endpoint);
      },
      {
        retryConfig: DEFAULT_RETRY_CONFIGS.read,
        offlineConfig: {
          cacheKey: `users-${JSON.stringify(params)}`,
          cacheDuration: 5 * 60 * 1000, // 5 minutes
        },
      }
    )(),

  getById: (id: string): Promise<User> =>
    createEnhancedApi(
      () => apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/${id}`),
      {
        retryConfig: DEFAULT_RETRY_CONFIGS.read,
        offlineConfig: {
          cacheKey: `user-${id}`,
          cacheDuration: 10 * 60 * 1000, // 10 minutes
        },
      }
    )(),

  create: (userData: Partial<User>): Promise<User> =>
    createEnhancedApi(
      () => apiRequest(API_CONFIG.ENDPOINTS.USERS, {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
      {
        retryConfig: DEFAULT_RETRY_CONFIGS.write,
        offlineConfig: {
          queueIfOffline: true,
        },
      }
    )(),

  update: (id: string, userData: Partial<User>): Promise<User> =>
    createEnhancedApi(
      () => apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      }),
      {
        retryConfig: DEFAULT_RETRY_CONFIGS.write,
        offlineConfig: {
          queueIfOffline: true,
        },
      }
    )(),

  delete: (id: string): Promise<{ message: string }> =>
    createEnhancedApi(
      () => apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, {
        method: 'DELETE',
      }),
      {
        retryConfig: DEFAULT_RETRY_CONFIGS.delete,
      }
    )(),

  // Batch operations with error handling
  batchUpdate: async (updates: Array<{ id: string; data: Partial<User> }>) => {
    const results = await Promise.allSettled(
      updates.map(({ id, data }) => enhancedUsersApi.update(id, data))
    );
    
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    
    return {
      successful,
      failed,
      results: results.map((r, i) => ({
        id: updates[i].id,
        success: r.status === 'fulfilled',
        error: r.status === 'rejected' ? r.reason : null,
      })),
    };
  },
};

// Enhanced Dashboard API with aggressive caching
export const enhancedDashboardApi = {
  getStats: () =>
    createEnhancedApi(
      () => apiRequest(API_CONFIG.ENDPOINTS.DASHBOARD_STATS),
      {
        retryConfig: {
          ...DEFAULT_RETRY_CONFIGS.read,
          maxAttempts: 5, // More retries for critical dashboard data
        },
        offlineConfig: {
          cacheKey: 'dashboard-stats',
          cacheDuration: 2 * 60 * 1000, // 2 minutes
          fallback: () => ({
            total_members: 0,
            active_members: 0,
            total_revenue: 0,
            monthly_revenue: 0,
            pending_payments: 0,
            overdue_payments: 0,
          }),
        },
      }
    )(),
};

// Enhanced Bookings API with optimistic updates
export const enhancedBookingsApi = {
  getAll: (params?: { date?: string; status?: string; instructor?: string }) =>
    createEnhancedApi(
      () => {
        const queryParams = new URLSearchParams();
        if (params?.date) queryParams.append('date', params.date);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.instructor) queryParams.append('instructor', params.instructor);
        
        const endpoint = `${API_CONFIG.ENDPOINTS.BOOKINGS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return apiRequest(endpoint);
      },
      {
        retryConfig: DEFAULT_RETRY_CONFIGS.read,
        offlineConfig: {
          cacheKey: `bookings-${JSON.stringify(params)}`,
          cacheDuration: 3 * 60 * 1000, // 3 minutes
        },
      }
    )(),

  checkIn: (id: string): Promise<Booking> =>
    createEnhancedApi(
      () => apiRequest(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${id}/check-in`, {
        method: 'POST',
      }),
      {
        retryConfig: {
          ...DEFAULT_RETRY_CONFIGS.write,
          maxAttempts: 1, // Don't retry check-ins to avoid duplicates
        },
        offlineConfig: {
          queueIfOffline: true,
        },
      }
    )(),
};

// Enhanced Payment API with strict error handling
export const enhancedPaymentApi = {
  processPayment: (paymentData: any) =>
    createEnhancedApi(
      () => apiRequest('/payments/process', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }),
      {
        retryConfig: {
          maxAttempts: 1, // Never retry payment processing
          shouldRetry: () => false,
        },
      }
    )(),

  getPaymentHistory: (userId: string) =>
    createEnhancedApi(
      () => apiRequest(`/payments/history/${userId}`),
      {
        retryConfig: DEFAULT_RETRY_CONFIGS.read,
        offlineConfig: {
          cacheKey: `payment-history-${userId}`,
          cacheDuration: 10 * 60 * 1000, // 10 minutes
        },
      }
    )(),
};

// Prefetch critical data for offline support
export async function prefetchCriticalData() {
  const prefetchTasks = [
    { key: 'dashboard-stats', request: enhancedDashboardApi.getStats },
    { key: 'active-users', request: () => enhancedUsersApi.getAll({ status: 'active' }) },
    { key: 'today-bookings', request: () => enhancedBookingsApi.getAll({ date: new Date().toISOString().split('T')[0] }) },
  ];

  const results = await Promise.allSettled(
    prefetchTasks.map(async ({ key, request }) => {
      try {
        await request();
        return { key, success: true };
      } catch (error) {
        return { key, success: false, error };
      }
    })
  );

  return results;
}

// Export all enhanced APIs
export const enhancedApi = {
  users: enhancedUsersApi,
  dashboard: enhancedDashboardApi,
  bookings: enhancedBookingsApi,
  payments: enhancedPaymentApi,
  // Add other enhanced APIs as needed
};