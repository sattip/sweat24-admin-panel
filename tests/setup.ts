import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8001',
    MODE: 'test'
  },
  writable: true
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
class IntersectionObserver {
  observe = () => null;
  disconnect = () => null;
  unobserve = () => null;
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

// Setup MSW server for mocking API calls
export const server = setupServer(
  // Default handlers - can be overridden in individual tests
  http.post('http://localhost:8001/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.email === 'admin@sweat24.gr' && body.password === 'password') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'admin@sweat24.gr',
          name: 'Admin User',
          role: 'admin'
        }
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),
  
  http.post('http://localhost:8001/api/v1/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),
  
  http.get('http://localhost:8001/api/v1/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader && authHeader.includes('Bearer')) {
      return HttpResponse.json({
        id: '1',
        email: 'admin@sweat24.gr',
        name: 'Admin User',
        role: 'admin'
      });
    }
    
    return HttpResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }),
  
  http.get('http://localhost:8001/api/v1/users', () => {
    return HttpResponse.json({
      data: [],
      total: 0,
      page: 1,
      per_page: 20
    });
  }),
  
  http.get('http://localhost:8001/api/v1/dashboard/stats', () => {
    return HttpResponse.json({
      total_members: 150,
      active_members: 120,
      monthly_revenue: 15000,
      pending_payments: 5,
      overdue_payments: 2
    });
  }),
  
  http.get('http://localhost:8001/api/v1/auth/verify', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader && authHeader.includes('Bearer')) {
      return HttpResponse.json({
        user: {
          id: '1',
          email: 'admin@sweat24.gr',
          name: 'Admin User',
          role: 'admin'
        },
        valid: true
      });
    }
    
    return HttpResponse.json(
      { message: 'Unauthorized', valid: false },
      { status: 401 }
    );
  }),
  
  http.get('http://localhost:8001/api/v1/classes', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'Morning Yoga',
          instructor_id: '1',
          max_participants: 20,
          current_participants: 15,
          start_time: '09:00',
          end_time: '10:00',
          date: '2024-03-15'
        }
      ],
      total: 1
    });
  }),
  
  http.get('http://localhost:8001/api/v1/bookings', () => {
    return HttpResponse.json({
      data: [],
      total: 0
    });
  }),
  
  // Catch all other requests
  http.get('*', ({ request }) => {
    console.log('Unhandled GET request:', request.url);
    return HttpResponse.json([]);
  }),
  
  http.post('*', ({ request }) => {
    console.log('Unhandled POST request:', request.url);
    return HttpResponse.json({ success: true });
  }),
  
  http.put('*', ({ request }) => {
    console.log('Unhandled PUT request:', request.url);
    return HttpResponse.json({ success: true });
  }),
  
  http.delete('*', ({ request }) => {
    console.log('Unhandled DELETE request:', request.url);
    return HttpResponse.json({ success: true });
  })
);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());