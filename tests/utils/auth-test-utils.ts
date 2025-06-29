import { vi } from 'vitest';
import { ReactElement } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock auth context value
export const createMockAuthContext = (overrides = {}) => ({
  user: {
    id: 1,
    name: 'Test Admin',
    email: 'admin@test.com',
    role: 'admin',
    membership_type: 'admin',
  },
  token: 'mock-auth-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  refreshToken: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
  ...overrides,
});

// Mock auth provider for testing
export const MockAuthProvider = ({ 
  children, 
  value = createMockAuthContext() 
}: { 
  children: React.ReactNode;
  value?: ReturnType<typeof createMockAuthContext>;
}) => {
  const mockUseAuth = () => value;
  
  // Override the useAuth hook
  vi.mock('@/contexts/AuthContext', async () => {
    const actual = await vi.importActual('@/contexts/AuthContext');
    return {
      ...actual,
      useAuth: mockUseAuth,
    };
  });

  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// Helper to test protected routes
export const testProtectedRoute = (
  Component: ReactElement,
  { 
    isAuthenticated = false,
    redirectPath = '/login' 
  } = {}
) => {
  const authValue = createMockAuthContext({ 
    isAuthenticated,
    user: isAuthenticated ? createMockAuthContext().user : null,
    token: isAuthenticated ? 'mock-token' : null,
  });

  return {
    authValue,
    expectRedirect: !isAuthenticated,
    redirectPath,
  };
};

// Helper to simulate authentication flow
export const simulateLogin = async (
  email: string,
  password: string,
  mockResponse: { success: boolean; data?: any; error?: string }
) => {
  const loginMock = vi.fn().mockImplementation(async (email: string, password: string) => {
    if (mockResponse.success) {
      // Simulate successful login
      localStorage.setItem('auth-token', mockResponse.data.token);
      localStorage.setItem('auth-user', JSON.stringify(mockResponse.data.user));
      localStorage.setItem('auth-timestamp', new Date().toISOString());
      return mockResponse.data;
    } else {
      // Simulate login failure
      throw new Error(mockResponse.error || 'Login failed');
    }
  });

  return loginMock;
};

// Helper to simulate logout
export const simulateLogout = () => {
  const logoutMock = vi.fn().mockImplementation(async () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-timestamp');
  });

  return logoutMock;
};

// Helper to test session persistence
export const setupStoredSession = (
  user = createMockAuthContext().user,
  token = 'stored-token',
  timestamp = new Date().toISOString()
) => {
  localStorage.setItem('auth-token', token);
  localStorage.setItem('auth-user', JSON.stringify(user));
  localStorage.setItem('auth-timestamp', timestamp);
};

// Helper to test expired sessions
export const setupExpiredSession = () => {
  const expiredTimestamp = new Date();
  expiredTimestamp.setHours(expiredTimestamp.getHours() - 25); // 25 hours ago
  
  setupStoredSession(
    createMockAuthContext().user,
    'expired-token',
    expiredTimestamp.toISOString()
  );
};

// Helper to test token refresh
export const mockTokenRefresh = (shouldSucceed = true) => {
  const refreshMock = vi.fn().mockImplementation(async () => {
    if (shouldSucceed) {
      const newToken = 'refreshed-token';
      const user = createMockAuthContext().user;
      
      localStorage.setItem('auth-token', newToken);
      localStorage.setItem('auth-user', JSON.stringify(user));
      localStorage.setItem('auth-timestamp', new Date().toISOString());
      
      return { token: newToken, user };
    } else {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-timestamp');
      throw new Error('Token refresh failed');
    }
  });

  return refreshMock;
};

// Helper to test role-based access
export const testRoleAccess = (
  userRole: string,
  requiredRoles: string[],
  expectedAccess: boolean
) => {
  const hasAccess = requiredRoles.includes(userRole);
  expect(hasAccess).toBe(expectedAccess);
  return hasAccess;
};

// Helper to mock auth API calls
export const mockAuthApi = {
  login: (email: string, password: string) => {
    if (email === 'admin@test.com' && password === 'password123') {
      return Promise.resolve({
        token: 'mock-auth-token',
        user: createMockAuthContext().user,
      });
    }
    return Promise.reject(new Error('Invalid credentials'));
  },
  
  logout: () => Promise.resolve({ message: 'Logged out successfully' }),
  
  refreshToken: (currentToken: string) => {
    if (currentToken === 'mock-auth-token') {
      return Promise.resolve({
        token: 'refreshed-auth-token',
        user: createMockAuthContext().user,
      });
    }
    return Promise.reject(new Error('Invalid token'));
  },
  
  getMe: (token: string) => {
    if (token === 'mock-auth-token' || token === 'refreshed-auth-token') {
      return Promise.resolve(createMockAuthContext().user);
    }
    return Promise.reject(new Error('Unauthorized'));
  },
};