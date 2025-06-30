// Custom hook for API requests with retry logic and error handling
import { useState, useCallback, useRef, useEffect } from "react";
import { withRetry, showErrorNotification, isRetryableError } from "@/utils/errorHandler";
import { networkStatus, offlineCapableRequest } from "@/utils/networkStatus";
import { useToast } from "@/hooks/use-toast";

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  retryConfig?: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
  };
  offlineConfig?: {
    fallback?: () => T;
    queueIfOffline?: boolean;
    cacheKey?: string;
    cacheDuration?: number;
  };
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export interface UseApiState<T> {
  data: T | null;
  error: any | null;
  isLoading: boolean;
  isRetrying: boolean;
}

export function useApiWithRetry<T = any, P = any>(
  apiFunction: (params?: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isRetrying: false,
  });

  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(
    async (params?: P) => {
      // Cancel any pending request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const wrappedApiFunction = async () => {
          // Check if component is still mounted
          if (!mountedRef.current) {
            throw new Error("Component unmounted");
          }

          return apiFunction(params);
        };

        let data: T;

        // Use offline-capable request if configured
        if (options.offlineConfig) {
          data = await offlineCapableRequest(
            () => withRetry(wrappedApiFunction, options.retryConfig),
            options.offlineConfig
          );
        } else {
          data = await withRetry(wrappedApiFunction, options.retryConfig);
        }

        // Check if component is still mounted before updating state
        if (!mountedRef.current) return;

        setState({
          data,
          error: null,
          isLoading: false,
          isRetrying: false,
        });

        // Show success toast if configured
        if (options.showSuccessToast) {
          toast({
            title: "Success",
            description: options.successMessage || "Operation completed successfully",
            variant: "default",
          });
        }

        // Call success callback
        options.onSuccess?.(data);

        return data;
      } catch (error: any) {
        // Ignore if component unmounted or request was aborted
        if (!mountedRef.current || error.name === "AbortError") return;

        setState({
          data: null,
          error,
          isLoading: false,
          isRetrying: false,
        });

        // Show error toast if configured (default true)
        if (options.showErrorToast !== false) {
          showErrorNotification(error, "API Request");
        }

        // Call error callback
        options.onError?.(error);

        throw error;
      }
    },
    [apiFunction, options, toast]
  );

  const retry = useCallback(async () => {
    if (!state.error || !isRetryableError(state.error)) {
      return;
    }

    setState((prev) => ({ ...prev, isRetrying: true }));

    try {
      await execute();
    } catch (error) {
      // Error already handled in execute
    }
  }, [execute, state.error]);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({
      data: null,
      error: null,
      isLoading: false,
      isRetrying: false,
    });
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
    isOffline: !networkStatus.isOnline(),
  };
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<T = any, P = any>(
  mutationFunction: (params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const api = useApiWithRetry(mutationFunction, {
    showSuccessToast: true,
    ...options,
  });

  return {
    ...api,
    mutate: api.execute,
    mutateAsync: api.execute,
  };
}

// Hook for queries with automatic execution
export function useQuery<T = any, P = any>(
  queryFunction: (params?: P) => Promise<T>,
  params?: P,
  options: UseApiOptions<T> & {
    enabled?: boolean;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  } = {}
) {
  const { enabled = true, refetchInterval, refetchOnWindowFocus = true, staleTime, ...apiOptions } = options;
  
  const api = useApiWithRetry(queryFunction, apiOptions);
  const lastFetchRef = useRef<number>(0);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      api.execute(params);
    }
  }, [enabled]);

  // Refetch on interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      api.execute(params);
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, params]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;

    const handleFocus = () => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchRef.current;

      // Only refetch if data is stale
      if (!staleTime || timeSinceLastFetch > staleTime) {
        api.execute(params);
        lastFetchRef.current = now;
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchOnWindowFocus, enabled, staleTime, params]);

  return {
    ...api,
    refetch: () => api.execute(params),
  };
}

// Hook for infinite queries (pagination)
export function useInfiniteQuery<T = any, P extends { page?: number } = any>(
  queryFunction: (params: P) => Promise<{ data: T[]; hasMore: boolean; nextPage?: number }>,
  initialParams: P,
  options: UseApiOptions<{ data: T[]; hasMore: boolean }> = {}
) {
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const api = useApiWithRetry(
    async (params?: P) => {
      const result = await queryFunction({ ...initialParams, ...params, page });
      return result;
    },
    {
      ...options,
      onSuccess: (data) => {
        setAllData((prev) => [...prev, ...data.data]);
        setHasMore(data.hasMore);
        setPage((prev) => prev + 1);
        options.onSuccess?.(data);
      },
    }
  );

  const loadMore = useCallback(() => {
    if (!hasMore || api.isLoading) return;
    api.execute({ ...initialParams, page } as P);
  }, [hasMore, api.isLoading, page, initialParams]);

  const reset = useCallback(() => {
    setAllData([]);
    setHasMore(true);
    setPage(1);
    api.reset();
  }, []);

  return {
    ...api,
    data: allData,
    hasMore,
    loadMore,
    reset,
  };
}