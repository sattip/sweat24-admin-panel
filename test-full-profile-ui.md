# Full Profile UI Implementation Test Plan

## Overview
This document outlines the test plan for the new full user profile feature implemented in the admin panel.

## Implementation Summary

### Files Modified
1. **src/services/apiService.ts**
   - Added `getFullProfile` method to `usersApi` object
   - Endpoint: `/api/admin/users/{userId}/full-profile`

2. **src/pages/UserProfilePage.tsx**
   - Added state for `fullProfile` data
   - Modified `loadUserData` to fetch full profile alongside basic user data
   - Added three new conditional sections:
     - Guardian Details (shown only if `is_minor = true`)
     - Medical History - EMS (shown only if `has_ems_interest = true`)
     - Referral Information (shown if `found_us_via` exists)

### Features Implemented

#### 1. Guardian Details Section
- **Condition**: Only displays when `fullProfile.is_minor === true`
- **Fields displayed**:
  - Guardian full name
  - ID/Passport number
  - Father's name
  - Mother's name
  - Birth date
  - Phone number
  - Email
  - Full address (street, city, zip code)
  - Guardian's signature image (if available)
- **UI Elements**: Card with grid layout for organized display

#### 2. Medical History - EMS Section
- **Condition**: Only displays when `fullProfile.medical_history.has_ems_interest === true`
- **Fields displayed**:
  - EMS interest confirmation
  - Liability acceptance status
  - List of EMS contraindications with:
    - Condition name
    - Has condition indicator (yes/no)
    - Year of onset (if applicable)
  - Additional medical data
  - Emergency contact information
- **UI Elements**: 
  - Color-coded indicators (green checkmarks for accepted, red alerts for conditions)
  - Organized list view with visual hierarchy

#### 3. Referral Information Section
- **Condition**: Always displays if `fullProfile.found_us_via` exists
- **Fields displayed**:
  - Referral source (e.g., "Σύσταση", "Social")
  - For referrals: Referrer name and code/name used
  - For social: Platform name (e.g., "Facebook", "Instagram")
- **UI Elements**: Badges for source display, grid layout for referrer details

#### 4. User Signature Display
- Added display of user's signature in the main user header section
- Shows below the basic user information if `fullProfile.signature_url` exists

## Testing Steps

### Manual Testing Procedure

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to a user profile**:
   - Go to http://localhost:5174 (or the port shown)
   - Login to admin panel
   - Navigate to Users section
   - Click on any user to view their profile

3. **Verify conditional rendering**:
   
   **For Minor Users:**
   - Verify "Στοιχεία Ανήλικου & Κηδεμόνα" section appears
   - Check all guardian fields are displayed correctly
   - Verify guardian signature image loads (if available)
   
   **For Users with EMS Interest:**
   - Verify "Ιατρικό Ιστορικό - EMS" section appears
   - Check contraindications list displays correctly
   - Verify color coding (red for conditions, gray for no conditions)
   - Check year of onset displays for relevant conditions
   
   **For All Users:**
   - Verify "Πώς μας βρήκατε;" section appears if referral data exists
   - Check referral details display correctly based on source type
   - Verify user signature displays in header if available

4. **Error Handling**:
   - Test with a non-existent user ID
   - Verify proper error toast appears
   - Check loading states work correctly

### API Response Simulation

Since the backend endpoint may not be immediately available, you can test using mock data by temporarily modifying the API response:

1. In `src/services/apiService.ts`, temporarily modify the `getFullProfile` method:

```typescript
getFullProfile: async (id: string): Promise<any> => {
  // For testing, return mock data
  return {
    success: true,
    data: {
      id: parseInt(id),
      full_name: "Test User",
      email: "test@example.com",
      is_minor: true,
      registration_date: "2025-08-07",
      signature_url: "https://via.placeholder.com/200x100",
      guardian_details: {
        full_name: "Guardian Name",
        father_name: "Father Name",
        mother_name: "Mother Name",
        birth_date: "1980-05-15",
        id_number: "AB123456",
        phone: "+306912345678",
        address: "Test Street 15",
        city: "Athens",
        zip_code: "11145",
        email: "guardian@example.com",
        consent_date: "2025-08-05T12:00:00.000Z",
        signature_url: "https://via.placeholder.com/200x100"
      },
      medical_history: {
        has_ems_interest: true,
        ems_contraindications: {
          "Pacemaker": {
            has_condition: true,
            year_of_onset: "2021"
          },
          "Heart Conditions": {
            has_condition: false,
            year_of_onset: null
          }
        },
        ems_liability_accepted: true,
        other_medical_data: {
          emergency_contact: {
            name: "Emergency Contact",
            phone: "+30123456789"
          }
        }
      },
      found_us_via: {
        source: "Σύσταση",
        referrer_info: {
          referrer_id: 456,
          referrer_name: "John Doe",
          code_or_name_used: "JD456"
        }
      }
    }
  };
},
```

## Expected Results

1. **Performance**: Page should load quickly with parallel API calls
2. **UI/UX**: 
   - Sections should only appear when relevant data exists
   - Layout should be responsive and well-organized
   - Greek text should display correctly
3. **Data Integrity**: All fields from the API should map correctly to UI elements
4. **Error Handling**: Graceful degradation if API fails or returns partial data

## Known Limitations

1. The actual backend endpoint must be implemented for production use
2. Image URLs for signatures need to be accessible from the frontend
3. Date formatting relies on browser's locale support for 'el-GR'

## Conclusion

The implementation successfully integrates the new full profile API endpoint with the admin panel UI, providing comprehensive user information display with proper conditional rendering based on user type and available data.