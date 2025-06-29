// Network Status and Offline Detection Utility
import { toast } from "@/hooks/use-toast";

export interface NetworkStatus {
  online: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

class NetworkStatusManager {
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private currentStatus: NetworkStatus = { online: navigator.onLine };
  private retryQueue: Array<() => Promise<any>> = [];
  private isRetrying = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);

    // Check connection quality if available
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      this.updateConnectionInfo(connection);
      
      connection.addEventListener("change", () => {
        this.updateConnectionInfo(connection);
      });
    }
  }

  private updateConnectionInfo(connection: any) {
    this.currentStatus = {
      ...this.currentStatus,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
    this.notifyListeners();
  }

  private handleOnline = () => {
    this.currentStatus.online = true;
    this.notifyListeners();
    
    toast({
      title: "Connection Restored",
      description: "You are back online. Syncing data...",
      variant: "default",
    });

    // Process retry queue
    this.processRetryQueue();
  };

  private handleOffline = () => {
    this.currentStatus.online = false;
    this.notifyListeners();
    
    toast({
      title: "Connection Lost",
      description: "You are offline. Some features may be limited.",
      variant: "destructive",
    });
  };

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentStatus));
  }

  public subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current status
    listener(this.currentStatus);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  public isOnline(): boolean {
    return this.currentStatus.online;
  }

  public isSlowConnection(): boolean {
    const { effectiveType, saveData } = this.currentStatus;
    return saveData || effectiveType === "slow-2g" || effectiveType === "2g";
  }

  public addToRetryQueue(operation: () => Promise<any>) {
    this.retryQueue.push(operation);
  }

  private async processRetryQueue() {
    if (this.isRetrying || this.retryQueue.length === 0) return;
    
    this.isRetrying = true;
    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const operation of queue) {
      try {
        await operation();
      } catch (error) {
        console.error("Failed to retry operation:", error);
        // Add back to queue if still offline
        if (!this.isOnline()) {
          this.retryQueue.push(operation);
        }
      }
    }

    this.isRetrying = false;
  }

  public destroy() {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    this.listeners.clear();
    this.retryQueue = [];
  }
}

// Singleton instance
export const networkStatus = new NetworkStatusManager();

// React hook for network status
import { useEffect, useState } from "react";

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(networkStatus.getStatus());

  useEffect(() => {
    const unsubscribe = networkStatus.subscribe(setStatus);
    return unsubscribe;
  }, []);

  return status;
}

// Offline-capable request wrapper
export async function offlineCapableRequest<T>(
  request: () => Promise<T>,
  options?: {
    fallback?: () => T;
    queueIfOffline?: boolean;
    cacheKey?: string;
    cacheDuration?: number;
  }
): Promise<T> {
  // Check if online
  if (!networkStatus.isOnline()) {
    if (options?.queueIfOffline) {
      // Queue for retry when back online
      networkStatus.addToRetryQueue(request);
      
      if (options.fallback) {
        return options.fallback();
      }
      
      throw new Error("Operation queued for when you're back online");
    }
    
    if (options?.fallback) {
      return options.fallback();
    }
    
    throw new Error("No internet connection");
  }

  // Check cache if provided
  if (options?.cacheKey) {
    const cached = getCachedData<T>(options.cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  try {
    const result = await request();
    
    // Cache result if cache key provided
    if (options?.cacheKey) {
      setCachedData(options.cacheKey, result, options.cacheDuration);
    }
    
    return result;
  } catch (error: any) {
    // If network error and we have fallback, use it
    if (error.message?.includes("Failed to fetch") && options?.fallback) {
      return options.fallback();
    }
    throw error;
  }
}

// Simple in-memory cache for offline support
const cache = new Map<string, { data: any; expiry: number }>();

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (cached.expiry < Date.now()) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCachedData(key: string, data: any, duration = 5 * 60 * 1000) {
  cache.set(key, {
    data,
    expiry: Date.now() + duration,
  });
}

// Prefetch critical data for offline use
export async function prefetchForOffline(requests: Array<{
  key: string;
  request: () => Promise<any>;
  duration?: number;
}>) {
  const results = await Promise.allSettled(
    requests.map(async ({ key, request, duration }) => {
      try {
        const data = await request();
        setCachedData(key, data, duration);
        return { key, success: true };
      } catch (error) {
        return { key, success: false, error };
      }
    })
  );
  
  return results;
}