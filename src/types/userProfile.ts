// TypeScript interfaces for Full User Profile API

export interface GuardianDetails {
  full_name: string;
  father_name: string;
  mother_name: string;
  birth_date: string;
  id_number: string;
  phone: string;
  address: string;
  city: string;
  zip_code: string;
  email: string;
  consent_date: string;
  signature_url?: string;
}

export interface EMSContraindication {
  has_condition: boolean;
  year_of_onset?: string | null;
}

export interface MedicalConditions {
  medical_history?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface OtherMedicalData {
  medical_conditions?: MedicalConditions;
  emergency_contact?: EmergencyContact;
}

export interface MedicalHistory {
  has_ems_interest: boolean;
  ems_contraindications?: Record<string, EMSContraindication>;
  ems_liability_accepted: boolean;
  other_medical_data?: OtherMedicalData;
}

export interface ReferrerInfo {
  referrer_id: number;
  referrer_name: string;
  code_or_name_used: string;
}

export interface FoundUsVia {
  source: string;
  referrer_info?: ReferrerInfo;
  sub_source?: string | null;
}

export interface FullUserProfile {
  id: number;
  full_name: string;
  email: string;
  is_minor: boolean;
  registration_date: string;
  signature_url?: string;
  guardian_details?: GuardianDetails;
  medical_history?: MedicalHistory;
  found_us_via?: FoundUsVia;
}

export interface FullUserProfileResponse {
  success: boolean;
  data: FullUserProfile;
}