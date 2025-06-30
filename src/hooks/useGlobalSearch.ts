import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '@/services/apiService';
import { debounce } from '@/utils/debounce';
import type { User, Class as GymClass, Booking } from '@/data/mockData';

export type SearchResult = 
  | (User & { type: 'user' })
  | (GymClass & { type: 'class' })
  | (Booking & { type: 'booking' });

export interface SearchState {
  isLoading: boolean;
  results: {
    users: Array<User & { type: 'user' }>;
    classes: Array<GymClass & { type: 'class' }>;
    bookings: Array<Booking & { type: 'booking' }>;
  };
  error: string | null;
  query: string;
}

export function useGlobalSearch() {
  const navigate = useNavigate();
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    results: {
      users: [],
      classes: [],
      bookings: []
    },
    error: null,
    query: ''
  });

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setSearchState(prev => ({
          ...prev,
          results: { users: [], classes: [], bookings: [] },
          isLoading: false,
          error: null
        }));
        return;
      }

      setSearchState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const results = await searchApi.globalSearch(query);
        setSearchState(prev => ({
          ...prev,
          results,
          isLoading: false,
          error: null
        }));
      } catch (error) {
        console.error('Search error:', error);
        setSearchState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Σφάλμα κατά την αναζήτηση. Παρακαλώ δοκιμάστε ξανά.',
          results: { users: [], classes: [], bookings: [] }
        }));
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearch = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }));
    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setSearchState(prev => ({
        ...prev,
        results: { users: [], classes: [], bookings: [] },
        isLoading: false,
        error: null
      }));
    }
  }, [debouncedSearch]);

  // Clear search results
  const clearSearch = useCallback(() => {
    debouncedSearch.cancel();
    setSearchState({
      isLoading: false,
      results: { users: [], classes: [], bookings: [] },
      error: null,
      query: ''
    });
  }, [debouncedSearch]);

  // Navigate to search result
  const navigateToResult = useCallback((result: SearchResult) => {
    clearSearch();
    
    switch (result.type) {
      case 'user':
        navigate(`/users/${result.id}`);
        break;
      case 'class':
        navigate(`/classes?highlight=${result.id}`);
        break;
      case 'booking':
        navigate(`/bookings?highlight=${result.id}`);
        break;
    }
  }, [navigate, clearSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    searchState,
    handleSearch,
    clearSearch,
    navigateToResult
  };
}