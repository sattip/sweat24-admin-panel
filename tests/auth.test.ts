import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

describe('Authentication Tests', () => {
  let authToken: string | null = null;

  beforeEach(() => {
    // Clear any existing auth data
    localStorage.clear();
    authToken = null;
  });

  afterEach(() => {
    // Clean up after tests
    localStorage.clear();
  });

  describe('Login Functionality', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@sweat24.gr',
          password: 'password',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe('admin@sweat24.gr');
      expect(data.user.role).toBe('admin');
      
      authToken = data.token;
    });

    it('should fail with invalid password', async () => {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@sweat24.gr',
          password: 'wrongpassword',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('message');
    });

    it('should fail with non-existent email', async () => {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'notexist@sweat24.gr',
          password: 'password',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      // Test missing email
      let response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'password',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(422);

      // Test missing password
      response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@sweat24.gr',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(422);
    });
  });

  describe('Token Verification', () => {
    beforeEach(async () => {
      // Login first to get a token
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@sweat24.gr',
          password: 'password',
        }),
      });
      const data = await response.json();
      authToken = data.token;
    });

    it('should verify valid token', async () => {
      const response = await fetch(`${API_URL}/api/v1/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe('admin@sweat24.gr');
    });

    it('should reject invalid token', async () => {
      const response = await fetch(`${API_URL}/api/v1/auth/verify`, {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should reject missing token', async () => {
      const response = await fetch(`${API_URL}/api/v1/auth/verify`);

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(async () => {
      // Login first
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@sweat24.gr',
          password: 'password',
        }),
      });
      const data = await response.json();
      authToken = data.token;
    });

    it('should successfully logout', async () => {
      const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      
      // Verify token is no longer valid
      const verifyResponse = await fetch(`${API_URL}/api/v1/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      expect(verifyResponse.ok).toBe(false);
    });
  });
});

describe('Protected Routes', () => {
  let authToken: string;

  beforeEach(async () => {
    // Login to get auth token
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sweat24.gr',
        password: 'password',
      }),
    });
    const data = await response.json();
    authToken = data.token;
  });

  it('should access protected routes with valid token', async () => {
    const endpoints = [
      '/api/v1/users',
      '/api/v1/classes',
      '/api/v1/packages',
      '/api/v1/instructors',
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('data');
    }
  });

  it('should reject protected routes without token', async () => {
    const endpoints = [
      '/api/v1/users',
      '/api/v1/classes',
      '/api/v1/packages',
      '/api/v1/instructors',
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${API_URL}${endpoint}`);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    }
  });
});