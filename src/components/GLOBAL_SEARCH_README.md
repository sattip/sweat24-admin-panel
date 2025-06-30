# Global Search Implementation

## Overview
The global search functionality allows users to search across users, classes, and bookings from the admin header. It includes debouncing, loading states, and keyboard navigation support.

## Components

### 1. **AdminHeader.tsx**
- Contains the search input with integrated search results dropdown
- Handles search state management and user interactions
- Features:
  - Real-time search as you type
  - Clear button when search is active
  - Click outside to close
  - ESC key to close

### 2. **GlobalSearchResults.tsx**
- Displays categorized search results
- Shows users, classes, and bookings in separate sections
- Handles navigation to selected results

### 3. **useGlobalSearch.ts** (Custom Hook)
- Manages search state and API calls
- Implements debouncing (300ms delay)
- Handles navigation to search results
- Features:
  - Automatic debouncing to prevent excessive API calls
  - Error handling
  - Loading states
  - Result categorization

### 4. **searchApi** (API Service)
- Handles communication with the backend search endpoint
- Currently using mock data for demonstration
- Will connect to `/api/v1/search` endpoint when backend is ready

## Usage

The search functionality is automatically available in the admin header. Users can:

1. Click on the search input or press a key while focused
2. Type at least 2 characters to trigger search
3. View results categorized by type (Users, Classes, Bookings)
4. Click on any result to navigate to that item
5. Press ESC or click outside to close the search

## Backend Integration

When the Laravel backend is ready, update the `searchApi` in `apiService.ts`:

```typescript
// Replace the mock implementation with:
export const searchApi = {
  globalSearch: async (query: string): Promise<{
    users: Array<User & { type: 'user' }>;
    classes: Array<GymClass & { type: 'class' }>;
    bookings: Array<Booking & { type: 'booking' }>;
  }> => {
    const queryParams = new URLSearchParams({ q: query });
    return apiRequest(`${API_CONFIG.ENDPOINTS.SEARCH}?${queryParams.toString()}`);
  },
};
```

## Expected Backend Response Format

The backend should return a JSON response with the following structure:

```json
{
  "users": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+30 123 456 7890",
      "status": "active",
      // ... other user fields
    }
  ],
  "classes": [
    {
      "id": "1",
      "title": "CrossFit",
      "instructor": "Instructor Name",
      "date": "2024-01-20T10:00:00Z",
      "time": "10:00",
      // ... other class fields
    }
  ],
  "bookings": [
    {
      "id": "1",
      "userId": "1",
      "userName": "John Doe",
      "classId": "1",
      "className": "CrossFit",
      "date": "2024-01-20T10:00:00Z",
      "time": "10:00",
      "status": "confirmed",
      // ... other booking fields
    }
  ]
}
```

## Customization

### Debounce Delay
To adjust the debounce delay, modify the value in `useGlobalSearch.ts`:
```typescript
debounce(async (query: string) => {
  // ...
}, 300), // Change 300 to desired milliseconds
```

### Minimum Query Length
To change the minimum characters required for search:
```typescript
if (query.trim().length < 2) { // Change 2 to desired minimum
```

### Search Result Limit
To limit the number of results displayed, modify the backend query or filter results in the frontend.

## Performance Considerations

1. **Debouncing**: Prevents excessive API calls while typing
2. **Minimum query length**: Reduces unnecessary searches
3. **Cancellation**: Previous searches are cancelled when new ones start
4. **Memoization**: Results are cached during the component lifecycle

## Future Enhancements

1. Add search history
2. Implement fuzzy search
3. Add filters (date range, status, etc.)
4. Keyboard navigation (arrow keys)
5. Search result highlighting
6. Advanced search with multiple criteria