# Error Handling and Loading States Guide

This guide explains how to use the comprehensive error handling and loading state system in the SWEAT24 Admin Panel.

## Table of Contents
1. [Overview](#overview)
2. [Error Handling](#error-handling)
3. [Loading States](#loading-states)
4. [Network Status](#network-status)
5. [API Integration](#api-integration)
6. [Best Practices](#best-practices)

## Overview

The error handling system provides:
- Global error boundary for catching React errors
- Centralized error handler utility
- Retry logic for failed API requests
- Offline detection and handling
- Loading skeletons for better UX

## Error Handling

### 1. Global Error Boundary

The `ErrorBoundary` component wraps the entire application in `App.tsx`:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

const App = () => (
  <ErrorBoundary>
    {/* Your app content */}
  </ErrorBoundary>
);
```

### 2. Async Boundary for Sections

Use `AsyncBoundary` for specific sections that might fail:

```tsx
import { AsyncBoundary } from "@/components/ErrorBoundary";

<AsyncBoundary>
  <YourComponent />
</AsyncBoundary>
```

### 3. Retryable Error Component

Display errors with retry functionality:

```tsx
import { RetryableError } from "@/components/RetryableError";

<RetryableError
  error={error}
  onRetry={handleRetry}
  variant="card" // "inline" | "card" | "fullpage"
/>
```

### 4. Error Handler Utility

Use the centralized error handler:

```tsx
import { handleError, showErrorNotification } from "@/utils/errorHandler";

try {
  await someOperation();
} catch (error) {
  // Get error details
  const errorDetails = handleError(error, "Operation Context");
  
  // Show notification
  showErrorNotification(error, "Operation Context");
}
```

### 5. Custom Error Types

```tsx
import { NetworkError, ValidationError, PermissionError } from "@/utils/errorHandler";

// Network error
throw new NetworkError("Connection failed");

// Validation error with field details
throw new ValidationError("Invalid input", {
  email: ["Email is required", "Invalid format"],
  password: ["Must be at least 8 characters"]
});

// Permission error
throw new PermissionError("Access denied");
```

## Loading States

### 1. Loading Skeletons

Use pre-built skeleton components:

```tsx
import { 
  TableSkeleton, 
  UserCardSkeleton, 
  DashboardStatsSkeleton 
} from "@/components/LoadingSkeletons";

// Table loading
<TableSkeleton rows={5} columns={4} />

// User card loading
<UserCardSkeleton />

// Dashboard stats loading
<DashboardStatsSkeleton />
```

### 2. Loading Components

```tsx
import { 
  Spinner, 
  PageLoader, 
  SectionLoader, 
  LoadingButton 
} from "@/components/LoadingStates";

// Spinner
<Spinner size="lg" className="text-primary" />

// Full page loader
<PageLoader message="Loading dashboard..." />

// Section loader
<SectionLoader message="Fetching users..." />

// Button with loading state
<LoadingButton
  isLoading={isSubmitting}
  loadingText="Saving..."
  onClick={handleSubmit}
>
  Save Changes
</LoadingButton>
```

### 3. Skeleton Wrapper

Conditionally show skeleton or content:

```tsx
import { SkeletonWrapper } from "@/components/LoadingSkeletons";

<SkeletonWrapper 
  isLoading={isLoading}
  skeleton={<TableSkeleton />}
>
  <YourTable data={data} />
</SkeletonWrapper>
```

## Network Status

### 1. Network Status Indicator

The indicator automatically appears when offline:

```tsx
import { NetworkStatusIndicator } from "@/components/NetworkStatusIndicator";

// Add to your app root
<NetworkStatusIndicator />
```

### 2. Using Network Status Hook

```tsx
import { useNetworkStatus } from "@/utils/networkStatus";

function MyComponent() {
  const networkStatus = useNetworkStatus();

  if (!networkStatus.online) {
    return <div>You're offline</div>;
  }

  if (networkStatus.effectiveType === "slow-2g") {
    return <div>Slow connection detected</div>;
  }
}
```

### 3. Offline-Capable Requests

```tsx
import { offlineCapableRequest } from "@/utils/networkStatus";

const data = await offlineCapableRequest(
  () => fetchUserData(),
  {
    fallback: () => getCachedData(),
    queueIfOffline: true,
    cacheKey: "user-data",
    cacheDuration: 5 * 60 * 1000 // 5 minutes
  }
);
```

## API Integration

### 1. Using API with Retry Hook

```tsx
import { useApiWithRetry } from "@/hooks/useApiWithRetry";

function UserList() {
  const {
    data,
    error,
    isLoading,
    execute,
    retry,
    isOffline
  } = useApiWithRetry(
    () => usersApi.getAll(),
    {
      retryConfig: {
        maxAttempts: 3,
        delay: 1000,
        backoff: true
      },
      offlineConfig: {
        cacheKey: "users-list",
        fallback: () => []
      },
      showErrorToast: true,
      showSuccessToast: true,
      successMessage: "Users loaded successfully"
    }
  );

  // Initial load
  useEffect(() => {
    execute();
  }, []);

  if (isLoading) return <TableSkeleton />;
  if (error) return <RetryableError error={error} onRetry={retry} />;
  
  return <UserTable users={data} />;
}
```

### 2. Using Query Hook

```tsx
import { useQuery } from "@/hooks/useApiWithRetry";

function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery(
    () => dashboardApi.getStats(),
    undefined, // params
    {
      enabled: true,
      refetchInterval: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      staleTime: 2 * 60 * 1000 // 2 minutes
    }
  );

  return (
    <LazyLoadWrapper
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
    >
      <DashboardStats stats={data} />
    </LazyLoadWrapper>
  );
}
```

### 3. Using Mutation Hook

```tsx
import { useMutation } from "@/hooks/useApiWithRetry";

function CreateUserForm() {
  const createUser = useMutation(
    (userData: UserData) => usersApi.create(userData),
    {
      successMessage: "User created successfully",
      onSuccess: (data) => {
        router.push(`/users/${data.id}`);
      }
    }
  );

  const handleSubmit = async (formData) => {
    await createUser.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <LoadingButton
        type="submit"
        isLoading={createUser.isLoading}
        loadingText="Creating user..."
      >
        Create User
      </LoadingButton>
    </form>
  );
}
```

### 4. Batch Operations with Error Handling

```tsx
import { batchWithErrorHandling } from "@/utils/errorHandler";

async function batchDeleteUsers(userIds: string[]) {
  const operations = userIds.map(id => () => usersApi.delete(id));
  
  const results = await batchWithErrorHandling(operations, {
    stopOnError: false,
    context: "Batch delete users"
  });

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  toast({
    title: "Batch Operation Complete",
    description: `${successful} succeeded, ${failed} failed`
  });
}
```

## Best Practices

### 1. Always Handle Loading States

```tsx
// ❌ Bad
function UserList() {
  const { data } = useQuery(usersApi.getAll);
  return <Table data={data} />;
}

// ✅ Good
function UserList() {
  const { data, isLoading, error } = useQuery(usersApi.getAll);
  
  if (isLoading) return <TableSkeleton />;
  if (error) return <RetryableError error={error} onRetry={refetch} />;
  if (!data?.length) return <EmptyState />;
  
  return <Table data={data} />;
}
```

### 2. Use Appropriate Error Boundaries

```tsx
// ✅ Wrap async components
<AsyncBoundary>
  <DataFetchingComponent />
</AsyncBoundary>

// ✅ Use HOC for existing components
const SafeComponent = withErrorBoundary(YourComponent);
```

### 3. Configure Retry Logic Appropriately

```tsx
// ✅ Different retry configs for different operations
const readConfig = {
  maxAttempts: 3,
  delay: 1000,
  backoff: true
};

const writeConfig = {
  maxAttempts: 2,
  delay: 2000,
  shouldRetry: (error) => error.status !== 422 // Don't retry validation errors
};

const paymentConfig = {
  maxAttempts: 1, // Never retry payments
  shouldRetry: () => false
};
```

### 4. Provide Offline Fallbacks

```tsx
// ✅ Good offline support
const { data } = useQuery(
  () => api.getData(),
  {},
  {
    offlineConfig: {
      cacheKey: "important-data",
      fallback: () => getLocalStorageData(),
      queueIfOffline: true
    }
  }
);
```

### 5. Show Contextual Error Messages

```tsx
// ✅ Provide context
showErrorNotification(error, "Creating user account");

// ✅ Custom error messages
catch (error) {
  if (error.status === 409) {
    toast({
      title: "Email Already Exists",
      description: "This email is already registered. Try logging in instead.",
      variant: "destructive"
    });
  } else {
    showErrorNotification(error);
  }
}
```

### 6. Prefetch Critical Data

```tsx
// ✅ Prefetch for offline support
useEffect(() => {
  prefetchCriticalData();
}, []);
```

## Example: Complete Page Implementation

See `/src/pages/UsersPageWithErrorHandling.tsx` for a complete example implementing all error handling and loading patterns.

## Testing Error States

During development, you can test error states by:

1. **Simulate Network Errors**: Use browser DevTools to throttle network or go offline
2. **Force API Errors**: Temporarily modify API calls to throw errors
3. **Test Error Boundaries**: Throw errors in components
4. **Test Retry Logic**: Use DevTools to block requests temporarily

```tsx
// Development only - force error for testing
if (process.env.NODE_ENV === 'development' && window.forceError) {
  throw new Error("Test error boundary");
}
```