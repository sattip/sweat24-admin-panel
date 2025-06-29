import { describe, it, expect, beforeEach } from 'vitest';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

describe('Booking Functionality Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testClassId: string;
  let testBookingId: string;

  beforeEach(async () => {
    // Login as admin
    const loginResponse = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sweat24.gr',
        password: 'password',
      }),
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;

    // Get a test user
    const usersResponse = await fetch(`${API_URL}/api/v1/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    const usersData = await usersResponse.json();
    testUserId = usersData.data[0]?.id || '1';

    // Get a test class
    const classesResponse = await fetch(`${API_URL}/api/v1/classes`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    const classesData = await classesResponse.json();
    testClassId = classesData.data[0]?.id || '1';
  });

  describe('Booking Creation', () => {
    it('should create a new booking', async () => {
      const response = await fetch(`${API_URL}/api/v1/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: testUserId,
          class_id: testClassId,
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('id');
      expect(data.data.user_id).toBe(testUserId);
      expect(data.data.class_id).toBe(testClassId);
      expect(data.data.status).toBe('confirmed');
      
      testBookingId = data.data.id;
    });

    it('should prevent double booking', async () => {
      // Create first booking
      await fetch(`${API_URL}/api/v1/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: testUserId,
          class_id: testClassId,
        }),
      });

      // Try to create duplicate booking
      const response = await fetch(`${API_URL}/api/v1/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: testUserId,
          class_id: testClassId,
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(422);
    });

    it('should respect class capacity', async () => {
      // This test assumes class capacity is being enforced
      // Would need to create a class with capacity 1 and try to book 2 users
    });
  });

  describe('Check-in Process', () => {
    beforeEach(async () => {
      // Create a booking first
      const bookingResponse = await fetch(`${API_URL}/api/v1/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: testUserId,
          class_id: testClassId,
        }),
      });
      const bookingData = await bookingResponse.json();
      testBookingId = bookingData.data.id;
    });

    it('should check-in a booking', async () => {
      const response = await fetch(`${API_URL}/api/v1/bookings/${testBookingId}/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data.data.status).toBe('checked_in');
      expect(data.data.checked_in_at).toBeTruthy();
    });

    it('should prevent duplicate check-in', async () => {
      // First check-in
      await fetch(`${API_URL}/api/v1/bookings/${testBookingId}/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // Try to check-in again
      const response = await fetch(`${API_URL}/api/v1/bookings/${testBookingId}/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(422);
    });
  });

  describe('Cancellation Process', () => {
    beforeEach(async () => {
      // Create a booking first
      const bookingResponse = await fetch(`${API_URL}/api/v1/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: testUserId,
          class_id: testClassId,
        }),
      });
      const bookingData = await bookingResponse.json();
      testBookingId = bookingData.data.id;
    });

    it('should cancel a booking', async () => {
      const response = await fetch(`${API_URL}/api/v1/bookings/${testBookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      
      // Verify booking is cancelled
      const getResponse = await fetch(`${API_URL}/api/v1/bookings/${testBookingId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (getResponse.ok) {
        const data = await getResponse.json();
        expect(data.data.status).toBe('cancelled');
      }
    });

    it('should not allow cancellation of checked-in booking', async () => {
      // First check-in the booking
      await fetch(`${API_URL}/api/v1/bookings/${testBookingId}/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      // Try to cancel
      const response = await fetch(`${API_URL}/api/v1/bookings/${testBookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(422);
    });
  });

  describe('Booking List and Filters', () => {
    it('should list all bookings', async () => {
      const response = await fetch(`${API_URL}/api/v1/bookings`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter bookings by status', async () => {
      const response = await fetch(`${API_URL}/api/v1/bookings?status=confirmed`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('data');
      data.data.forEach((booking: any) => {
        expect(booking.status).toBe('confirmed');
      });
    });

    it('should filter bookings by user', async () => {
      const response = await fetch(`${API_URL}/api/v1/bookings?user_id=${testUserId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('data');
      data.data.forEach((booking: any) => {
        expect(booking.user_id).toBe(testUserId);
      });
    });

    it('should filter bookings by class', async () => {
      const response = await fetch(`${API_URL}/api/v1/bookings?class_id=${testClassId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('data');
      data.data.forEach((booking: any) => {
        expect(booking.class_id).toBe(testClassId);
      });
    });
  });
});