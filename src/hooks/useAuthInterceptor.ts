import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// This hook sets up global auth interceptors
export function useAuthInterceptor() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Create a global handler for auth errors
    const handleAuthError = (event: CustomEvent) => {
      // Auth error intercepted - logging removed for production
      logout();
      navigate('/login');
    };

    // Listen for auth error events
    window.addEventListener('auth-error' as any, handleAuthError);

    return () => {
      window.removeEventListener('auth-error' as any, handleAuthError);
    };
  }, [logout, navigate]);

  // Check session validity periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const token = localStorage.getItem('auth-token');
      const timestamp = localStorage.getItem('auth-timestamp');
      
      if (!token || !timestamp) {
        logout();
        return;
      }

      // Check if token is older than 24 hours
      const tokenAge = new Date().getTime() - new Date(timestamp).getTime();
      if (tokenAge > 24 * 60 * 60 * 1000) {
        // Token expired due to age - logging removed for production
        logout();
      }
    };

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    // Also check on focus
    const handleFocus = () => checkSession();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, logout]);
}

// Helper to dispatch auth error events
export function dispatchAuthError(message: string) {
  window.dispatchEvent(new CustomEvent('auth-error', { detail: { message } }));
}