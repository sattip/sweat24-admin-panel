import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { vi } from 'vitest';

// Mock authenticated user
export const mockUser = {
  id: 1,
  name: 'Test Admin',
  email: 'admin@test.com',
  role: 'admin',
  membership_type: 'admin',
  created_at: '2024-01-01T00:00:00Z',
};

// Mock API response helpers
export const createMockResponse = <T>(data: T, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  } as Response);
};

export const createMockErrorResponse = (message: string, status = 400) => {
  return Promise.resolve({
    ok: false,
    status,
    json: async () => ({ message, error: message }),
    text: async () => JSON.stringify({ message, error: message }),
    headers: new Headers({
      'content-type': 'application/json',
    }),
  } as Response);
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  isAuthenticated?: boolean;
}

export const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { initialRoute = '/', isAuthenticated = false, ...renderOptions } = options || {};

  // Set up authenticated state if needed
  if (isAuthenticated) {
    localStorage.setItem('auth-token', 'mock-token');
    localStorage.setItem('auth-user', JSON.stringify(mockUser));
    localStorage.setItem('auth-timestamp', new Date().toISOString());
  }

  // Set initial route
  window.history.pushState({}, 'Test page', initialRoute);

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// Mock fetch helper
export const mockFetch = (responses: Array<{ url: string | RegExp; response: Response | (() => Response) }>) => {
  const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
    const matchedResponse = responses.find(r => {
      if (typeof r.url === 'string') {
        return url.includes(r.url);
      }
      return r.url.test(url);
    });

    if (matchedResponse) {
      return typeof matchedResponse.response === 'function' 
        ? matchedResponse.response() 
        : matchedResponse.response;
    }

    // Default 404 response
    return createMockErrorResponse('Not found', 404);
  });

  global.fetch = fetchMock;
  return fetchMock;
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock localStorage
export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
};

// Export everything from @testing-library/react
export * from '@testing-library/react';
export { vi };