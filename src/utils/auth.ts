// Authentication utility functions

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    // Validate token format
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > exp;
  } catch (error) {
    return true; // Assume expired if we can't parse
  }
}

/**
 * Get the remaining time until token expiration in milliseconds
 */
export function getTokenTimeRemaining(token: string): number {
  try {
    // Validate token format
    const parts = token.split('.');
    if (parts.length !== 3) {
      return 0;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Math.max(0, exp - Date.now());
  } catch (error) {
    return 0;
  }
}

/**
 * Extract user information from JWT token
 */
export function getUserFromToken(token: string): any {
  try {
    // Validate token format
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    return {
      id: payload.sub || payload.user_id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      // Add any other fields your JWT contains
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: any, role: string): boolean {
  if (!user) return false;
  return user.role === role || user.roles?.includes(role);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: any, roles: string[]): boolean {
  if (!user) return false;
  return roles.some(role => hasRole(user, role));
}

/**
 * Format authentication error messages for display
 */
export function formatAuthError(error: any): string {
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    // Map common error messages to user-friendly ones
    const errorMap: Record<string, string> = {
      'Network Error': 'Σφάλμα δικτύου. Ελέγξτε τη σύνδεσή σας.',
      'Request failed with status code 401': 'Μη έγκυρα διαπιστευτήρια.',
      'Request failed with status code 403': 'Δεν έχετε δικαίωμα πρόσβασης.',
      'Request failed with status code 404': 'Ο πόρος δεν βρέθηκε.',
      'Request failed with status code 500': 'Σφάλμα διακομιστή. Δοκιμάστε ξανά.',
    };
    
    return errorMap[error.message] || error.message;
  }
  
  return 'Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.';
}

/**
 * Save authentication state to session storage for tab syncing
 */
export function syncAuthState(token: string | null, user: any | null) {
  if (token && user) {
    sessionStorage.setItem('auth-sync', JSON.stringify({ token, user, timestamp: Date.now() }));
  } else {
    sessionStorage.removeItem('auth-sync');
  }
}

/**
 * Listen for auth state changes across tabs
 */
export function onAuthStateChange(callback: (token: string | null, user: any | null) => void) {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'auth-sync' && e.newValue) {
      try {
        const { token, user } = JSON.parse(e.newValue);
        callback(token, user);
      } catch (error) {
        // Error syncing auth state
      }
    } else if (e.key === 'auth-sync' && !e.newValue) {
      callback(null, null);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}

/**
 * Clear all authentication data
 */
export function clearAuthData() {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('auth-user');
  localStorage.removeItem('auth-timestamp');
  sessionStorage.removeItem('auth-sync');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα κεφαλαίο γράμμα');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα πεζό γράμμα');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Ο κωδικός πρέπει να περιέχει τουλάχιστον έναν αριθμό');
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Ο κωδικός πρέπει να περιέχει τουλάχιστον έναν ειδικό χαρακτήρα (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}