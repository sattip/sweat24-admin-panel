import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '@/services/apiService';
import type { User } from '@/data/mockData';
import type { FullUserProfile } from '@/types/userProfile';

export function useUserData(userId: string | undefined) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [fullProfile, setFullProfile] = useState<FullUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both user data and full profile in parallel
      const [userData, fullProfileResponse] = await Promise.allSettled([
        usersApi.getById(userId),
        usersApi.getFullProfile(userId)
      ]);
      
      if (userData.status === 'fulfilled') {
        setUser(userData.value);
        
        // Handle medical history if present in user data
        if (userData.value.medical_history) {
          const medicalHistoryData = typeof userData.value.medical_history === 'string' 
            ? JSON.parse(userData.value.medical_history) 
            : userData.value.medical_history;
          
          const transformedMedicalHistory = {
            has_ems_interest: medicalHistoryData.ems_interest === true,
            ems_liability_accepted: medicalHistoryData.ems_liability_accepted === true,
            ems_contraindications: medicalHistoryData.ems_contraindications || {},
            other_medical_data: {
              medical_conditions: medicalHistoryData.medical_conditions,
              emergency_contact: medicalHistoryData.emergency_contact
            }
          };
          
          // Set a minimal fullProfile if we don't have one yet
          setFullProfile(prev => ({
            ...prev,
            id: parseInt(userData.value.id),
            full_name: userData.value.name,
            email: userData.value.email,
            is_minor: userData.value.is_minor || false,
            registration_date: userData.value.created_at || userData.value.joinDate,
            medical_history: transformedMedicalHistory
          }));
        }
      } else {
        setError('Αποτυχία φόρτωσης βασικών δεδομένων χρήστη');
      }
      
      if (fullProfileResponse.status === 'fulfilled') {
        setFullProfile(fullProfileResponse.value);
      } else {
        console.warn('Failed to fetch full profile (optional):', fullProfileResponse.reason);
      }
    } catch (error) {
      console.error('Unexpected error in fetchUserData:', error);
      setError('Απροσδόκητο σφάλμα κατά τη φόρτωση δεδομένων');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    user,
    fullProfile,
    loading,
    error,
    refetch: fetchUserData
  };
}
