# SWEAT24 Admin Panel - Backend Integration Audit & Fix Requirements

## Overview
This issue tracks all functionality problems in the SWEAT24 Admin Panel where features are either using dummy data or not fully integrated with the Laravel backend API.

## Current State
The application is in a transitional state between mock/demo version and full backend integration. While API service layers are defined in `/src/services/api.ts`, most components still rely on mock data from `/src/data/mockData.ts`.

## Critical Issues to Fix

### 1. Mock Data Dependencies
**Files affected:**
- `/src/data/mockData.ts` - Contains all hardcoded mock data
- Multiple components directly import and use this mock data

**Required fixes:**
- Replace all mock data imports with API service calls
- Remove dependency on mockData.ts throughout the application
- Implement proper data fetching with React Query hooks

### 2. Non-Functional Forms & Actions

#### Settings Page (`/src/pages/SettingsPage.tsx`)
- **Issue**: Form submission only logs to console (line 78-80)
- **Fix needed**: Implement actual API calls to save settings
- **Affected areas**: Gym settings, pricing, system settings, backup/restore

#### Assessment Page (`/src/pages/AssessmentPage.tsx`)
- **Issue**: Save button only logs data (line 626-627)
- **Fix needed**: Implement API endpoint for saving assessments

#### User Profile Page (`/src/pages/UserProfilePage.tsx`)
- **Issues**:
  - Package assignment dialog is empty (line 162-163)
  - Package status changes don't persist (line 56-57)
  - Trainer name is hardcoded (line 77)
- **Fix needed**: 
  - Implement package assignment form
  - Add API calls for package status updates
  - Fetch actual logged-in trainer data

#### Business Expense Modal (`/src/components/BusinessExpenseModal.tsx`)
- **Issue**: Approve/reject actions only log to console (lines 309-315)
- **Fix needed**: Implement API calls for expense approval workflow

### 3. Search Functionality
#### Admin Header (`/src/components/AdminHeader.tsx`)
- **Issue**: Global search input has no functionality (lines 52-57)
- **Fix needed**: Implement global search with API integration

### 4. Data Persistence Issues

**All Modal Components:**
- NewUserModal - Creates users without backend save
- NewClassModal - Creates classes without backend save
- PaymentInstallmentsModal - Records payments without persistence
- CashRegisterModal - Records transactions without persistence
- BusinessExpenseModal - Records expenses without persistence

**Fix needed**: Update all modals to use API services for CRUD operations

### 5. Console.log Cleanup
**Files with console.log statements to remove:**
- `/src/hooks/useLocalStorage.ts` (lines 13, 30)
- `/src/config/api.ts` (lines 2, 55, 58, 69, 74, 83)
- `/src/contexts/AuthContext.tsx` (lines 63, 97, 114)
- `/src/components/BusinessExpenseModal.tsx` (lines 309, 313)
- Multiple page components with error logging

### 6. Hardcoded Data in Components
- `/src/components/RecentActivity.tsx` - Hardcoded activities array
- `/src/components/QuickActions.tsx` - Hardcoded actions array
- `/src/pages/StorePage.tsx` - mockProducts array

### 7. TODO Comments to Address
- UserProfilePage.tsx - 3 TODO items for package management and trainer data
- Multiple placeholder texts in Greek need proper implementation

## Implementation Priority

### Phase 1 - Core Functionality (High Priority)
1. Replace mock data with API calls in all page components
2. Implement user CRUD operations with backend
3. Fix authentication flow and session management
4. Implement class and booking management

### Phase 2 - Financial Features (High Priority)
1. Payment installments persistence
2. Cash register integration
3. Business expense workflow
4. Financial reporting

### Phase 3 - Enhanced Features (Medium Priority)
1. Global search functionality
2. Settings persistence
3. Assessment and progress tracking
4. Notification system

### Phase 4 - Polish (Low Priority)
1. Remove all console.log statements
2. Clean up TODO comments
3. Implement proper error handling
4. Add loading states and error boundaries

## Technical Requirements

### API Integration Checklist
- [ ] Update all components to use API service instead of mock data
- [ ] Implement proper error handling for all API calls
- [ ] Add loading states for async operations
- [ ] Implement optimistic updates where appropriate
- [ ] Add proper TypeScript types for API responses

### Testing Requirements
- [ ] Test all CRUD operations
- [ ] Verify data persistence across page refreshes
- [ ] Test error scenarios and edge cases
- [ ] Ensure proper authorization for all endpoints
- [ ] Test form validations

### Code Quality
- [ ] Remove all console.log statements
- [ ] Remove or implement all TODO comments
- [ ] Remove hardcoded/mock data
- [ ] Ensure consistent error handling
- [ ] Add proper loading and error states

## Acceptance Criteria
1. All forms and modals should persist data to the backend
2. No mock data should be used in production
3. All buttons and interactive elements should have proper functionality
4. Search functionality should work across the application
5. Settings should be saved and loaded from the backend
6. No console.log statements in production code
7. Proper error handling and user feedback for all operations

## Additional Notes
- The Laravel backend API endpoints are already defined but need to be properly integrated
- Authentication is partially implemented but needs completion
- Consider implementing a global state management solution for better data consistency
- Add comprehensive error boundaries for better error handling