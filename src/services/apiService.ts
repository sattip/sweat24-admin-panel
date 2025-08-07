import { apiRequest, API_CONFIG } from '../config/api';
import type { 
  User, 
  Package, 
  Booking, 
  Instructor, 
  Class as GymClass,
  PaymentInstallment,
  CashRegisterEntry,
  BusinessExpense,
  UserPackage 
} from '../data/mockData';
import type { FullUserProfile, FullUserProfileResponse } from '../types/userProfile';

// Users API
export const usersApi = {
  getAll: async (params?: { search?: string; status?: string; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    // Request all users without pagination for the admin panel
    queryParams.append('no_pagination', 'true');
    
    const endpoint = `${API_CONFIG.ENDPOINTS.USERS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string): Promise<User> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  },

  getFullProfile: async (id: string): Promise<FullUserProfile> => {
    try {
      const response = await apiRequest(`/api/admin/users/${id}/full-profile`);
      
      // Normalize the response - handle both direct data and wrapped response
      if (response && typeof response === 'object') {
        // If response has a 'data' property, use it, otherwise use the response directly
        const profileData = response.data || response;
        return profileData as FullUserProfile;
      }
      
      throw new Error('Invalid response format from full profile API');
    } catch (error) {
      console.error(`Error fetching full profile for user ${id}:`, error);
      throw error;
    }
  },

  create: async (userData: Partial<User>): Promise<User> => {
    return apiRequest(API_CONFIG.ENDPOINTS.USERS, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id: string, userData: Partial<User>): Promise<User> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, {
      method: 'DELETE',
    });
  },

  approve: async (id: string): Promise<{ message: string; user?: User }> => {
    return apiRequest(`/api/v1/admin/users/${id}/approve`, {
      method: 'POST',
    });
  },

  reject: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/api/v1/admin/users/${id}/reject`, {
      method: 'POST',
    });
  },
};

// Packages API
export const packagesApi = {
  getAll: async (): Promise<Package[]> => {
    return apiRequest(API_CONFIG.ENDPOINTS.PACKAGES);
  },

  getById: async (id: string): Promise<Package> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.PACKAGES}/${id}`);
  },

  create: async (packageData: Partial<Package>): Promise<Package> => {
    return apiRequest(API_CONFIG.ENDPOINTS.PACKAGES, {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  },

  update: async (id: string, packageData: Partial<Package>): Promise<Package> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.PACKAGES}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.PACKAGES}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Bookings API
export const bookingsApi = {
  getAll: async (params?: { date?: string; status?: string; instructor?: string }): Promise<Booking[]> => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.instructor) queryParams.append('instructor', params.instructor);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.BOOKINGS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log('🔗 BookingsApi.getAll: Calling endpoint:', endpoint);
    const result = await apiRequest(endpoint);
    console.log('📦 BookingsApi.getAll: Received result:', result);
    return result;
  },

  getById: async (id: string): Promise<Booking> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${id}`);
  },

  create: async (bookingData: Partial<Booking>): Promise<Booking> => {
    return apiRequest(API_CONFIG.ENDPOINTS.BOOKINGS, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  update: async (id: string, bookingData: Partial<Booking>): Promise<Booking> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${id}`, {
      method: 'DELETE',
    });
  },

  checkIn: async (id: string): Promise<Booking> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.BOOKINGS}/${id}/check-in`, {
      method: 'POST',
    });
  },
};

// Instructors API
export const instructorsApi = {
  getAll: async (): Promise<Instructor[]> => {
    return apiRequest(API_CONFIG.ENDPOINTS.INSTRUCTORS);
  },

  getById: async (id: string): Promise<Instructor> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.INSTRUCTORS}/${id}`);
  },

  create: async (instructorData: Partial<Instructor>): Promise<Instructor> => {
    return apiRequest(API_CONFIG.ENDPOINTS.INSTRUCTORS, {
      method: 'POST',
      body: JSON.stringify(instructorData),
    });
  },

  update: async (id: string, instructorData: Partial<Instructor>): Promise<Instructor> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.INSTRUCTORS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(instructorData),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.INSTRUCTORS}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Classes API
export const classesApi = {
  getAll: async (params?: { date?: string; instructor?: string }): Promise<GymClass[]> => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.instructor) queryParams.append('instructor', params.instructor);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.CLASSES}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string): Promise<GymClass> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.CLASSES}/${id}`);
  },

  create: async (classData: Partial<GymClass>): Promise<GymClass> => {
    return apiRequest(API_CONFIG.ENDPOINTS.CLASSES, {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  },

  update: async (id: string, classData: Partial<GymClass>): Promise<GymClass> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.CLASSES}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.CLASSES}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Payment Installments API
export const paymentInstallmentsApi = {
  getAll: async (params?: { status?: string; customer?: string }): Promise<PaymentInstallment[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customer) queryParams.append('customer', params.customer);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.PAYMENT_INSTALLMENTS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string): Promise<PaymentInstallment> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.PAYMENT_INSTALLMENTS}/${id}`);
  },

  create: async (installmentData: Partial<PaymentInstallment>): Promise<PaymentInstallment> => {
    return apiRequest(API_CONFIG.ENDPOINTS.PAYMENT_INSTALLMENTS, {
      method: 'POST',
      body: JSON.stringify(installmentData),
    });
  },

  update: async (id: string, installmentData: Partial<PaymentInstallment>): Promise<PaymentInstallment> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.PAYMENT_INSTALLMENTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(installmentData),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.PAYMENT_INSTALLMENTS}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cash Register API
export const cashRegisterApi = {
  getAll: async (params?: { type?: string; date_from?: string; date_to?: string }): Promise<CashRegisterEntry[]> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.CASH_REGISTER}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string): Promise<CashRegisterEntry> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.CASH_REGISTER}/${id}`);
  },

  create: async (entryData: Partial<CashRegisterEntry>): Promise<CashRegisterEntry> => {
    return apiRequest(API_CONFIG.ENDPOINTS.CASH_REGISTER, {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  },

  update: async (id: string, entryData: Partial<CashRegisterEntry>): Promise<CashRegisterEntry> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.CASH_REGISTER}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.CASH_REGISTER}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Business Expenses API
export const businessExpensesApi = {
  getAll: async (params?: { category?: string; approved?: boolean; date_from?: string; date_to?: string }): Promise<BusinessExpense[]> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.approved !== undefined) queryParams.append('approved', params.approved.toString());
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.BUSINESS_EXPENSES}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string): Promise<BusinessExpense> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.BUSINESS_EXPENSES}/${id}`);
  },

  create: async (expenseData: Partial<BusinessExpense>): Promise<BusinessExpense> => {
    return apiRequest(API_CONFIG.ENDPOINTS.BUSINESS_EXPENSES, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  update: async (id: string, expenseData: Partial<BusinessExpense>): Promise<BusinessExpense> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.BUSINESS_EXPENSES}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.BUSINESS_EXPENSES}/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<{
    total_members: number;
    active_members: number;
    total_revenue: number;
    monthly_revenue: number;
    pending_payments: number;
    overdue_payments: number;
  }> => {
    return apiRequest(API_CONFIG.ENDPOINTS.DASHBOARD_STATS);
  },
  
  getBookingTypes: async (): Promise<{
    regular: number;
    trial: number;
    loyalty_gift: number;
    referral_gift: number;
    personal_training: number;
    ems: number;
    pilates: number;
    other: number;
  }> => {
    return apiRequest('/api/v1/admin/statistics/booking-types');
  },
  
  getAll: async (): Promise<{
    recentActivity?: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
      icon?: string;
    }>;
    stats?: {
      total_members?: number;
      active_members?: number;
      total_revenue?: number;
      monthly_revenue?: number;
    };
  }> => {
    return apiRequest('/api/v1/dashboard/activities');
  },
};

// Notification API
export const notificationApi = {
  getAll: async (params?: { per_page?: number; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const endpoint = `/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  getUserNotifications: async (params?: { per_page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    
    const endpoint = `/notifications/user${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  getStatistics: async () => {
    return apiRequest('/notifications/statistics');
  },

  markAsRead: async (notificationId: number) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'POST',
    });
  },
};

export const bookingRequestsApi = {
  getAll: async (): Promise<{
    data?: Array<{
      id: string;
      user_id: string;
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
      type: 'ems' | 'personal';
      preferred_dates?: string[];
      preferred_times?: string[];
      message?: string;
      status: 'pending' | 'confirmed' | 'rejected';
      rejection_reason?: string;
      created_at: string;
      user?: User;
    }>;
  }> => {
    console.log('🔍 Fetching booking requests from:', '/api/v1/admin/booking-requests');
    console.log('🔑 Auth token exists:', !!localStorage.getItem('auth-token'));
    
    // Debug alert to ensure we reach this point
    if (!window.bookingRequestsApiCalled) {
      window.bookingRequestsApiCalled = true;
      console.warn('🚨 BOOKING REQUESTS API CALLED - Check network tab!');
    }
    
    return apiRequest('/api/v1/admin/booking-requests');
  },

  confirm: async (id: string, data: { date: string; time: string; instructor_id?: string }): Promise<{ message: string; booking?: any }> => {
    console.log('✅ Confirming booking request:', id, data);
    return apiRequest(`/api/v1/admin/booking-requests/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  reject: async (id: string, data: { reason: string }): Promise<{ message: string }> => {
    console.log('❌ Rejecting booking request:', id, data);
    return apiRequest(`/api/v1/admin/booking-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Chat API
export const chatApi = {
  getConversations: async (status?: string) => {
    const endpoint = `/admin/chat/conversations${status ? `?status=${status}` : ''}`;
    return apiRequest(endpoint);
  },

  sendMessage: async (conversationId: number, content: string) => {
    return apiRequest('/admin/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        content: content
      })
    });
  },

  markAsRead: async (conversationId: number) => {
    return apiRequest(`/admin/chat/conversations/${conversationId}/read`, {
      method: 'PUT'
    });
  },

  updateStatus: async (conversationId: number, status: string) => {
    return apiRequest(`/admin/chat/conversations/${conversationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
};

// Generic API service for backward compatibility
export const apiService = {
  get: async (endpoint: string, options?: { params?: Record<string, unknown> }) => {
    let url = endpoint;
    if (options?.params) {
      const queryParams = new URLSearchParams();
      Object.keys(options.params).forEach(key => {
        queryParams.append(key, options.params[key].toString());
      });
      url += (url.includes('?') ? '&' : '?') + queryParams.toString();
    }
    const response = await apiRequest(url);
    return { data: response };
  },

  post: async (endpoint: string, data?: unknown) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: async (endpoint: string, data?: unknown) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: async (endpoint: string) => {
    return apiRequest(endpoint, {
      method: 'DELETE',
    });
  },
};