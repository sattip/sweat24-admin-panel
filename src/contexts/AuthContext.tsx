import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/config/api';

interface User {
  id: number;
  name: string;
  email: string;
  membership_type?: string;
  role?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Token refresh interval (in milliseconds) - refresh every 30 minutes
const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!user && !!token;

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Save auth data to localStorage and state
  const saveAuthData = useCallback((authToken: string, userData: User) => {
    localStorage.setItem('auth-token', authToken);
    localStorage.setItem('auth-user', JSON.stringify(userData));
    localStorage.setItem('auth-timestamp', new Date().toISOString());
    setToken(authToken);
    setUser(userData);
    setError(null);
  }, []);

  // Clear auth data from localStorage and state
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-timestamp');
    setToken(null);
    setUser(null);
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    const currentToken = localStorage.getItem('auth-token');
    if (!currentToken) {
      throw new Error('No token to refresh');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      if (data.token && data.user) {
        saveAuthData(data.token, data.user);
        return;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout the user
      clearAuthData();
      navigate('/login');
      throw error;
    }
  }, [saveAuthData, clearAuthData, navigate]);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const savedToken = localStorage.getItem('auth-token');
      const savedUser = localStorage.getItem('auth-user');
      const authTimestamp = localStorage.getItem('auth-timestamp');

      if (savedToken && savedUser) {
        try {
          // Check if token is older than 24 hours
          if (authTimestamp) {
            const tokenAge = new Date().getTime() - new Date(authTimestamp).getTime();
            if (tokenAge > 24 * 60 * 60 * 1000) {
              // Token is older than 24 hours, try to refresh
              try {
                await refreshToken();
                setIsLoading(false);
                return;
              } catch {
                clearAuthData();
                setIsLoading(false);
                return;
              }
            }
          }

          // Verify token with backend
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/v1/auth/me`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setUser(data.user);
              setToken(savedToken);
              // Update stored user data with fresh data from server
              localStorage.setItem('auth-user', JSON.stringify(data.user));
            } else {
              // Use saved user data if server doesn't return user
              setUser(JSON.parse(savedUser));
              setToken(savedToken);
            }
          } else if (response.status === 401) {
            // Token is invalid, try to refresh
            try {
              await refreshToken();
            } catch {
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          clearAuthData();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [clearAuthData, refreshToken]);

  // Set up token refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      const intervalId = setInterval(() => {
        refreshToken().catch(console.error);
      }, TOKEN_REFRESH_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, refreshToken]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.token || !data.user) {
        const errorMessage = 'Invalid login response from server';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Save token and user data
      saveAuthData(data.token, data.user);
      
      // Navigate to dashboard after successful login
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (!error.message) {
        setError('Network error. Please check your connection.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      if (token) {
        // Try to logout from backend
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if backend logout fails
    } finally {
      // Always clear local state
      clearAuthData();
      setIsLoading(false);
      navigate('/login');
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};