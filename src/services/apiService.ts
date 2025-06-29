import { apiRequest, API_CONFIG } from '../config/api';
import { mockGlobalSearch } from './mockSearchService';
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

// Users API
export const usersApi = {
  getAll: async (params?: { search?: string; status?: string; page?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const endpoint = `${API_CONFIG.ENDPOINTS.USERS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string): Promise<User> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
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
    return apiRequest(endpoint);
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
};

// User Packages API
export const userPackagesApi = {
  getAll: async (userId?: string): Promise<UserPackage[]> => {
    const endpoint = userId 
      ? `${API_CONFIG.ENDPOINTS.USER_PACKAGES}?user_id=${userId}`
      : API_CONFIG.ENDPOINTS.USER_PACKAGES;
    return apiRequest(endpoint);
  },

  getById: async (id: string): Promise<UserPackage> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USER_PACKAGES}/${id}`);
  },

  create: async (userPackageData: Partial<UserPackage>): Promise<UserPackage> => {
    return apiRequest(API_CONFIG.ENDPOINTS.USER_PACKAGES, {
      method: 'POST',
      body: JSON.stringify(userPackageData),
    });
  },

  update: async (id: string, userPackageData: Partial<UserPackage>): Promise<UserPackage> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USER_PACKAGES}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userPackageData),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USER_PACKAGES}/${id}`, {
      method: 'DELETE',
    });
  },

  assignPackage: async (userId: string, packageId: string): Promise<UserPackage> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USER_PACKAGES}/assign`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, package_id: packageId }),
    });
  },

  extendPackage: async (id: string, days: number): Promise<UserPackage> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USER_PACKAGES}/${id}/extend`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  },

  pausePackage: async (id: string): Promise<UserPackage> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USER_PACKAGES}/${id}/pause`, {
      method: 'POST',
    });
  },

  resumePackage: async (id: string): Promise<UserPackage> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.USER_PACKAGES}/${id}/resume`, {
      method: 'POST',
    });
  },
};

// Settings API
export const settingsApi = {
  get: async (): Promise<Settings> => {
    return apiRequest(API_CONFIG.ENDPOINTS.SETTINGS);
  },

  update: async (settings: Partial<Settings>): Promise<Settings> => {
    return apiRequest(API_CONFIG.ENDPOINTS.SETTINGS, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  updateGym: async (gymSettings: Partial<Settings['gym']>): Promise<Settings> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.SETTINGS}/gym`, {
      method: 'PATCH',
      body: JSON.stringify(gymSettings),
    });
  },

  updateSystem: async (systemSettings: Partial<Settings['system']>): Promise<Settings> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.SETTINGS}/system`, {
      method: 'PATCH',
      body: JSON.stringify(systemSettings),
    });
  },

  updatePricing: async (pricingSettings: Partial<Settings['pricing']>): Promise<Settings> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.SETTINGS}/pricing`, {
      method: 'PATCH',
      body: JSON.stringify(pricingSettings),
    });
  },
};

// Assessments API
export const assessmentsApi = {
  getAll: async (params?: { clientId?: string; type?: string; date_from?: string; date_to?: string }): Promise<Assessment[]> => {
    const queryParams = new URLSearchParams();
    if (params?.clientId) queryParams.append('client_id', params.clientId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.ASSESSMENTS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string): Promise<Assessment> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ASSESSMENTS}/${id}`);
  },

  getByClient: async (clientId: string): Promise<Assessment[]> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ASSESSMENTS}/client/${clientId}`);
  },

  createBodyMeasurement: async (data: BodyMeasurement): Promise<Assessment> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ASSESSMENTS}/body`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createEnduranceTest: async (data: EnduranceTest): Promise<Assessment> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ASSESSMENTS}/endurance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createStrengthLog: async (data: StrengthLog): Promise<Assessment> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ASSESSMENTS}/strength`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Assessment>): Promise<Assessment> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ASSESSMENTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ASSESSMENTS}/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (clientId: string): Promise<{
    totalAssessments: number;
    latestBMI: number;
    trend: 'improving' | 'stable' | 'declining';
    lastAssessmentDate: string;
  }> => {
    return apiRequest(`${API_CONFIG.ENDPOINTS.ASSESSMENTS}/stats/${clientId}`);
  },
};

// Global Search API
export const searchApi = {
  globalSearch: async (query: string): Promise<{
    users: Array<User & { type: 'user' }>;
    classes: Array<GymClass & { type: 'class' }>;
    bookings: Array<Booking & { type: 'booking' }>;
  }> => {
    // TODO: Replace mockGlobalSearch with actual API call when backend search endpoint is ready
    // const queryParams = new URLSearchParams({ q: query });
    // return apiRequest(`${API_CONFIG.ENDPOINTS.SEARCH}?${queryParams.toString()}`);
    
    // TEMPORARY: Using mock implementation until backend search endpoint is available
    return mockGlobalSearch(query);
  },
};