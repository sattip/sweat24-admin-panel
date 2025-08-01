import { apiRequest } from '../../config/api';

// Types για το ιατρικό ιστορικό
export interface MedicalCondition {
  ever_diagnosed: boolean;
  year_of_onset?: number;
  details?: string;
}

export interface MedicalConditions {
  heart_disease: MedicalCondition;
  hypertension: MedicalCondition;
  diabetes: MedicalCondition;
  asthma: MedicalCondition;
  thyroid_disorder: MedicalCondition;
  osteoporosis: MedicalCondition;
  arthritis: MedicalCondition;
  cancer: MedicalCondition;
  stroke: MedicalCondition;
  epilepsy: MedicalCondition;
  kidney_disease: MedicalCondition;
  mental_health: MedicalCondition;
  high_cholesterol: MedicalCondition;
}

export interface CurrentHealthProblems {
  has_problems: boolean;
  details?: string;
}

export interface PrescribedMedication {
  medication: string;
  reason: string;
}

export interface SmokingHistory {
  ever_smoked: boolean;
  is_current_smoker?: boolean;
  smoking_years?: number;
  quit_years_ago?: number;
}

export interface PhysicalActivity {
  current_activity_level: 'none' | 'light' | 'moderate' | 'vigorous';
  description?: string;
  frequency?: string;
  duration?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface MedicalHistoryAnalysis {
  has_ems_contraindications: boolean;
  active_conditions: string[];
  total_active_conditions: number;
  is_smoker: boolean;
  has_health_problems: boolean;
  emergency_contact_available: boolean;
}

export interface MedicalHistory {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  medical_conditions: MedicalConditions;
  current_health_problems: CurrentHealthProblems;
  prescribed_medications: PrescribedMedication[];
  smoking: SmokingHistory;
  physical_activity: PhysicalActivity;
  emergency_contact: EmergencyContact;
  liability_declaration_accepted: boolean;
  submitted_at: string;
  analysis: MedicalHistoryAnalysis;
}

// API function
export const medicalHistoryApi = {
  getUserMedicalHistory: async (userId: string): Promise<MedicalHistory> => {
    // Χρησιμοποιούμε direct fetch με το σωστό authentication
    // Το endpoint δεν είναι στο /api/v1 αλλά στο /api
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`https://sweat93laravel.obs.com.gr/api/admin/users/${userId}/medical-history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
        throw new Error('Unauthorized - please login again');
      }
      throw new Error(`Failed to fetch medical history: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data; // Επιστρέφουμε το data object από την απόκριση
  }
}; 