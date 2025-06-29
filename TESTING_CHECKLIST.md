# SWEAT24 Admin Panel Testing Checklist

## 🔐 Authentication Testing

### Login Functionality
- [ ] Test valid admin credentials (admin@sweat24.gr / password)
- [ ] Test invalid credentials - wrong password
- [ ] Test invalid credentials - non-existent email
- [ ] Test empty fields validation
- [ ] Test "Remember Me" functionality
- [ ] Verify password field is masked
- [ ] Test session persistence after page refresh
- [ ] Verify redirect to dashboard after successful login

### Logout Functionality
- [ ] Test logout button functionality
- [ ] Verify session is cleared after logout
- [ ] Verify redirect to login page after logout
- [ ] Test browser back button after logout (should not access protected pages)

## 📊 Dynamic Data Loading

### Dashboard Page
- [ ] Verify stats load correctly (Total Users, Active Subscriptions, etc.)
- [ ] Test recent activity feed updates
- [ ] Verify charts and graphs render with real data
- [ ] Test quick actions functionality

### Users Page
- [ ] Test user list loading and pagination
- [ ] Verify search functionality
- [ ] Test filter by status (Active/Inactive)
- [ ] Test user creation with all fields
- [ ] Test user editing functionality
- [ ] Test user deletion with confirmation
- [ ] Verify package assignment works

### Classes Page
- [ ] Test class schedule loading
- [ ] Verify weekly calendar view
- [ ] Test class creation with instructor assignment
- [ ] Test class editing (time, instructor, capacity)
- [ ] Test class deletion
- [ ] Verify recurring class functionality
- [ ] Test capacity tracking

### Trainers Page
- [ ] Test trainer list loading
- [ ] Verify trainer details display
- [ ] Test adding new trainer
- [ ] Test editing trainer information
- [ ] Test trainer schedule assignment
- [ ] Verify certifications display

### Packages Page
- [ ] Test package list loading
- [ ] Test creating new packages
- [ ] Test editing package details
- [ ] Test package activation/deactivation
- [ ] Verify pricing display
- [ ] Test duration settings

### Finance Page
- [ ] Test financial overview loading
- [ ] Verify payment installments display
- [ ] Test cash register entries
- [ ] Test business expense tracking
- [ ] Verify financial reports generation

## 📅 Booking Functionality

### Check-in Process
- [ ] Test manual check-in for users
- [ ] Verify check-in updates booking status
- [ ] Test check-in validation (time restrictions)
- [ ] Verify capacity updates after check-in

### Cancellation Process
- [ ] Test booking cancellation
- [ ] Verify cancellation updates available spots
- [ ] Test cancellation time restrictions
- [ ] Verify refund/credit logic

## 📦 Package Alerts

### Expiration Alerts
- [ ] Test package expiring soon alerts
- [ ] Verify expired package notifications
- [ ] Test alert dismissal functionality
- [ ] Verify alert timing accuracy

### Usage Alerts
- [ ] Test low remaining sessions alerts
- [ ] Verify usage tracking accuracy
- [ ] Test alert thresholds

## 🛍️ Store Functionality

### Product Search
- [ ] Test search by product name
- [ ] Test search with partial matches
- [ ] Verify search results accuracy
- [ ] Test empty search results handling

### Product Filtering
- [ ] Test filter by category
- [ ] Test filter by price range
- [ ] Test filter by availability
- [ ] Test multiple filter combinations
- [ ] Verify filter reset functionality

## ❌ Error Handling

### Network Errors
- [ ] Test behavior with no internet connection
- [ ] Test behavior with slow connection
- [ ] Verify timeout handling
- [ ] Test retry mechanisms

### API Errors
- [ ] Test 404 - Not Found handling
- [ ] Test 401 - Unauthorized handling
- [ ] Test 500 - Server Error handling
- [ ] Test validation error display

### Form Validation
- [ ] Test required field validation
- [ ] Test email format validation
- [ ] Test phone number format validation
- [ ] Test numeric field validation
- [ ] Test date/time validation

## 🚀 Deployment Verification

### Production Environment
- [ ] Verify production API URL is configured correctly
- [ ] Test HTTPS/SSL certificate
- [ ] Verify CORS configuration
- [ ] Test database connections
- [ ] Verify environment variables are set

### Performance Testing
- [ ] Test page load times
- [ ] Test API response times
- [ ] Verify image optimization
- [ ] Test under concurrent users

### Cross-browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge

### Responsive Testing
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)

## 📝 Test Scenarios

### End-to-End User Flow
1. Admin logs in
2. Creates a new user
3. Assigns a package to the user
4. Creates a class
5. User books the class (via client app)
6. Admin checks in the user
7. Admin views financial reports

### Critical Path Testing
- [ ] User registration → Package purchase → Class booking → Check-in
- [ ] Trainer assignment → Class creation → Student enrollment
- [ ] Product creation → Inventory update → Purchase flow

## 🔧 Backend Requirements

### Laravel Backend Setup
- [ ] Database migrations completed
- [ ] Seed data populated
- [ ] API routes accessible
- [ ] Authentication tokens working
- [ ] File uploads configured

### API Endpoints Testing
- [ ] GET /api/v1/auth/verify
- [ ] POST /api/v1/auth/login
- [ ] POST /api/v1/auth/logout
- [ ] GET /api/v1/users
- [ ] POST /api/v1/users
- [ ] GET /api/v1/classes
- [ ] POST /api/v1/bookings
- [ ] GET /api/v1/packages
- [ ] GET /api/v1/instructors

## 🐛 Bug Tracking

### Known Issues
- [ ] Document any bugs found during testing
- [ ] Prioritize bugs by severity
- [ ] Track bug fixes

### Regression Testing
- [ ] Retest fixed bugs
- [ ] Verify no new bugs introduced
- [ ] Test related functionality

---

## Testing Notes

### Test Data
- Admin credentials: admin@sweat24.gr / password
- Test user accounts should be created during testing
- Use realistic data for better testing coverage

### Testing Tools
- Browser DevTools for network monitoring
- Redux DevTools for state inspection
- Console logs for debugging

### Success Criteria
- All critical paths work without errors
- No console errors in production build
- All API endpoints return expected data
- UI is responsive and performs well
- Error messages are user-friendly