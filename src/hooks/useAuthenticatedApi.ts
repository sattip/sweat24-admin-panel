import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError, AuthError } from '@/config/api';
import { useToast } from '@/components/ui/use-toast';

export function useAuthenticatedApi() {
  const { refreshToken, logout } = useAuth();
  const { toast } = useToast();

  const makeAuthenticatedRequest = useCallback(async <T = any>(
    requestFn: () => Promise<T>,
    options?: {
      showErrorToast?: boolean;
      retryOnAuthError?: boolean;
    }
  ): Promise<T> => {
    const { showErrorToast = true, retryOnAuthError = true } = options || {};

    try {
      // Make the initial request
      return await requestFn();
    } catch (error) {
      // Handle auth errors
      if (error instanceof AuthError && error.status === 401 && retryOnAuthError) {
        try {
          // Try to refresh the token
          await refreshToken();
          
          // Retry the original request
          return await requestFn();
        } catch (refreshError) {
          // Refresh failed, logout the user
          await logout();
          
          if (showErrorToast) {
            toast({
              title: "Σφάλμα πιστοποίησης",
              description: "Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.",
              variant: "destructive",
            });
          }
          
          throw refreshError;
        }
      }
      
      // Handle other API errors
      if (error instanceof ApiError && showErrorToast) {
        let title = "Σφάλμα";
        let description = error.message;
        
        switch (error.status) {
          case 403:
            title = "Δεν επιτρέπεται η πρόσβαση";
            description = "Δεν έχετε τα απαραίτητα δικαιώματα για αυτή την ενέργεια.";
            break;
          case 404:
            title = "Δεν βρέθηκε";
            description = "Το αντικείμενο που ζητήσατε δεν βρέθηκε.";
            break;
          case 422:
            title = "Σφάλμα επικύρωσης";
            description = error.data?.message || "Παρακαλώ ελέγξτε τα δεδομένα σας.";
            break;
          case 500:
          case 502:
          case 503:
            title = "Σφάλμα διακομιστή";
            description = "Παρουσιάστηκε πρόβλημα στον διακομιστή. Παρακαλώ δοκιμάστε ξανά.";
            break;
          case 0:
            title = "Σφάλμα δικτύου";
            description = error.message || "Παρακαλώ ελέγξτε τη σύνδεσή σας στο διαδίκτυο.";
            break;
        }
        
        toast({
          title,
          description,
          variant: "destructive",
        });
      }
      
      throw error;
    }
  }, [refreshToken, logout, toast]);

  // Wrapper methods for common HTTP operations
  const authenticatedApi = {
    get: useCallback(<T = any>(endpoint: string, options?: RequestInit) => 
      makeAuthenticatedRequest(() => api.get<T>(endpoint, options)), 
    [makeAuthenticatedRequest]),
    
    post: useCallback(<T = any>(endpoint: string, data?: any, options?: RequestInit) => 
      makeAuthenticatedRequest(() => api.post<T>(endpoint, data, options)), 
    [makeAuthenticatedRequest]),
    
    put: useCallback(<T = any>(endpoint: string, data?: any, options?: RequestInit) => 
      makeAuthenticatedRequest(() => api.put<T>(endpoint, data, options)), 
    [makeAuthenticatedRequest]),
    
    patch: useCallback(<T = any>(endpoint: string, data?: any, options?: RequestInit) => 
      makeAuthenticatedRequest(() => api.patch<T>(endpoint, data, options)), 
    [makeAuthenticatedRequest]),
    
    delete: useCallback(<T = any>(endpoint: string, options?: RequestInit) => 
      makeAuthenticatedRequest(() => api.delete<T>(endpoint, options)), 
    [makeAuthenticatedRequest]),
  };

  return {
    api: authenticatedApi,
    makeAuthenticatedRequest,
  };
}

// Type-safe API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    current_page?: number;
    total?: number;
    per_page?: number;
    last_page?: number;
  };
}

// Type-safe paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}