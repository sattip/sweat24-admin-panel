import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  usersApi,
  packagesApi,
  bookingsApi,
  instructorsApi,
  classesApi,
  paymentInstallmentsApi,
  cashRegisterApi,
  businessExpensesApi,
  dashboardApi,
  userPackagesApi,
  settingsApi,
  assessmentsApi,
} from '@/services/apiService';
import * as apiConfig from '@/config/api';
import {
  mockUsers,
  mockPackages,
  mockBookings,
  mockInstructors,
  mockClasses,
  mockPaymentInstallments,
  mockCashRegisterEntries,
  mockBusinessExpenses,
  mockUserPackages,
  mockSettings,
  mockAssessments,
  createPaginatedResponse,
} from '../utils/mock-data';

// Mock the apiRequest function
vi.mock('@/config/api', async () => {
  const actual = await vi.importActual('@/config/api');
  return {
    ...actual,
    apiRequest: vi.fn(),
  };
});

describe('API Service Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usersApi', () => {
    it('should get all users', async () => {
      const mockResponse = createPaginatedResponse(mockUsers);
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await usersApi.getAll();

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockResponse);
    });

    it('should get users with search params', async () => {
      const mockResponse = createPaginatedResponse(mockUsers.slice(0, 1));
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const params = { search: 'john', status: 'active', page: 1 };
      const result = await usersApi.getAll(params);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith(
        '/users?search=john&status=active&page=1'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get user by id', async () => {
      const mockUser = mockUsers[0];
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockUser);

      const result = await usersApi.getById('1');

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockUser);
    });

    it('should create user', async () => {
      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        phone: '+1234567890',
        membership_type: 'Basic',
      };
      const mockResponse = { id: '4', ...newUser, status: 'active' };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await usersApi.create(newUser);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update user', async () => {
      const updates = { name: 'Updated Name' };
      const mockResponse = { ...mockUsers[0], ...updates };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await usersApi.update('1', updates);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/users/1', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should delete user', async () => {
      const mockResponse = { message: 'User deleted successfully' };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await usersApi.delete('1');

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/users/1', {
        method: 'DELETE',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('packagesApi', () => {
    it('should get all packages', async () => {
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockPackages);

      const result = await packagesApi.getAll();

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/packages');
      expect(result).toEqual(mockPackages);
    });

    it('should create package', async () => {
      const newPackage = {
        name: 'New Package',
        price: 199.99,
        duration: 30,
        class_credits: 20,
      };
      const mockResponse = { id: '4', ...newPackage, status: 'active' };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await packagesApi.create(newPackage);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/packages', {
        method: 'POST',
        body: JSON.stringify(newPackage),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('bookingsApi', () => {
    it('should get all bookings', async () => {
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockBookings);

      const result = await bookingsApi.getAll();

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/bookings');
      expect(result).toEqual(mockBookings);
    });

    it('should get bookings with filters', async () => {
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockBookings);

      const params = {
        date: '2024-06-29',
        status: 'confirmed',
        instructor: '1',
      };
      const result = await bookingsApi.getAll(params);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith(
        '/bookings?date=2024-06-29&status=confirmed&instructor=1'
      );
      expect(result).toEqual(mockBookings);
    });

    it('should check in booking', async () => {
      const mockResponse = { ...mockBookings[0], checked_in: true };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await bookingsApi.checkIn('1');

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/bookings/1/check-in', {
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('classesApi', () => {
    it('should get all classes', async () => {
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockClasses);

      const result = await classesApi.getAll();

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/classes');
      expect(result).toEqual(mockClasses);
    });

    it('should get classes with filters', async () => {
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockClasses);

      const params = { date: '2024-06-29', instructor: '1' };
      const result = await classesApi.getAll(params);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith(
        '/classes?date=2024-06-29&instructor=1'
      );
      expect(result).toEqual(mockClasses);
    });
  });

  describe('paymentInstallmentsApi', () => {
    it('should get payment installments with filters', async () => {
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockPaymentInstallments);

      const params = { status: 'active', customer: '1' };
      const result = await paymentInstallmentsApi.getAll(params);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith(
        '/payment-installments?status=active&customer=1'
      );
      expect(result).toEqual(mockPaymentInstallments);
    });
  });

  describe('cashRegisterApi', () => {
    it('should get cash register entries with date range', async () => {
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockCashRegisterEntries);

      const params = {
        type: 'income',
        date_from: '2024-06-01',
        date_to: '2024-06-30',
      };
      const result = await cashRegisterApi.getAll(params);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith(
        '/cash-register?type=income&date_from=2024-06-01&date_to=2024-06-30'
      );
      expect(result).toEqual(mockCashRegisterEntries);
    });
  });

  describe('businessExpensesApi', () => {
    it('should get business expenses with filters', async () => {
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockBusinessExpenses);

      const params = {
        category: 'equipment',
        approved: true,
        date_from: '2024-06-01',
        date_to: '2024-06-30',
      };
      const result = await businessExpensesApi.getAll(params);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith(
        '/business-expenses?category=equipment&approved=true&date_from=2024-06-01&date_to=2024-06-30'
      );
      expect(result).toEqual(mockBusinessExpenses);
    });
  });

  describe('dashboardApi', () => {
    it('should get dashboard stats', async () => {
      const mockStats = {
        total_members: 150,
        active_members: 120,
        total_revenue: 15000,
        monthly_revenue: 5000,
        pending_payments: 10,
        overdue_payments: 3,
      };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockStats);

      const result = await dashboardApi.getStats();

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/dashboard/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('userPackagesApi', () => {
    it('should get user packages for specific user', async () => {
      const userPackages = mockUserPackages.filter(up => up.user_id === '1');
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(userPackages);

      const result = await userPackagesApi.getAll('1');

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/user-packages?user_id=1');
      expect(result).toEqual(userPackages);
    });

    it('should assign package to user', async () => {
      const mockResponse = {
        id: '3',
        user_id: '2',
        package_id: '1',
        purchase_date: '2024-06-29',
        expiry_date: '2024-07-29',
        credits_total: -1,
        credits_used: 0,
        status: 'active',
      };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await userPackagesApi.assignPackage('2', '1');

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/user-packages/assign', {
        method: 'POST',
        body: JSON.stringify({ user_id: '2', package_id: '1' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should extend package', async () => {
      const mockResponse = { ...mockUserPackages[0], expiry_date: '2024-08-01' };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await userPackagesApi.extendPackage('1', 30);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/user-packages/1/extend', {
        method: 'POST',
        body: JSON.stringify({ days: 30 }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should pause package', async () => {
      const mockResponse = { ...mockUserPackages[0], status: 'paused' };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await userPackagesApi.pausePackage('1');

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/user-packages/1/pause', {
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should resume package', async () => {
      const mockResponse = { ...mockUserPackages[0], status: 'active' };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await userPackagesApi.resumePackage('1');

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/user-packages/1/resume', {
        method: 'POST',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('settingsApi', () => {
    it('should get settings', async () => {
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockSettings);

      const result = await settingsApi.get();

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/settings');
      expect(result).toEqual(mockSettings);
    });

    it('should update gym settings', async () => {
      const gymUpdates = { name: 'SWEAT24 Fitness Plus' };
      const mockResponse = {
        ...mockSettings,
        gym: { ...mockSettings.gym, ...gymUpdates },
      };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await settingsApi.updateGym(gymUpdates);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/settings/gym', {
        method: 'PATCH',
        body: JSON.stringify(gymUpdates),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update system settings', async () => {
      const systemUpdates = { sessionTimeout: 60 };
      const mockResponse = {
        ...mockSettings,
        system: { ...mockSettings.system, ...systemUpdates },
      };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await settingsApi.updateSystem(systemUpdates);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/settings/system', {
        method: 'PATCH',
        body: JSON.stringify(systemUpdates),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('assessmentsApi', () => {
    it('should get assessments with filters', async () => {
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockAssessments);

      const params = {
        clientId: '1',
        type: 'body_measurement',
        date_from: '2024-06-01',
        date_to: '2024-06-30',
      };
      const result = await assessmentsApi.getAll(params);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith(
        '/assessments?client_id=1&type=body_measurement&date_from=2024-06-01&date_to=2024-06-30'
      );
      expect(result).toEqual(mockAssessments);
    });

    it('should get assessments by client', async () => {
      const clientAssessments = mockAssessments.filter(a => a.clientId === '1');
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(clientAssessments);

      const result = await assessmentsApi.getByClient('1');

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/assessments/client/1');
      expect(result).toEqual(clientAssessments);
    });

    it('should create body measurement', async () => {
      const bodyMeasurement = mockAssessments[0];
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(bodyMeasurement);

      const result = await assessmentsApi.createBodyMeasurement(bodyMeasurement);

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/assessments/body', {
        method: 'POST',
        body: JSON.stringify(bodyMeasurement),
      });
      expect(result).toEqual(bodyMeasurement);
    });

    it('should get assessment stats', async () => {
      const mockStats = {
        totalAssessments: 10,
        latestBMI: 24.5,
        trend: 'improving' as const,
        lastAssessmentDate: '2024-06-29',
      };
      vi.mocked(apiConfig.apiRequest).mockResolvedValueOnce(mockStats);

      const result = await assessmentsApi.getStats('1');

      expect(apiConfig.apiRequest).toHaveBeenCalledWith('/assessments/stats/1');
      expect(result).toEqual(mockStats);
    });
  });
});