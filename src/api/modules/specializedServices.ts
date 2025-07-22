import { apiRequest } from '../../config/api';

export interface SpecializedService {
  id: number;
  name: string;
  slug: string;
  description: string;
  duration: string;
  price: string;
  icon: string;
  preferred_time_slots: string[];
}

export interface AppointmentRequest {
  id: number;
  specialized_service_id?: number;
  user_id?: string;
  name?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  email?: string;
  phone?: string;
  type?: 'ems' | 'personal';
  preferred_dates?: string[];
  preferred_times?: string[];
  preferred_time_slot?: string;
  message?: string;
  notes?: string;
  status: string;
  rejection_reason?: string;
  final_date?: string;
  final_time?: string;
  created_at: string;
  service?: SpecializedService;
}

export interface ConfirmRequestData {
  final_date: string;
  final_time: string;
  notes?: string;
}

export interface RejectRequestData {
  rejection_reason: string;
  notes?: string;
}

export const specializedServicesApi = {
  getAll: async (): Promise<SpecializedService[]> => {
    return apiRequest('/admin/specialized-services');
  },

  create: async (data: Partial<SpecializedService>): Promise<SpecializedService> => {
    return apiRequest('/specialized-services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<SpecializedService>): Promise<SpecializedService> => {
    return apiRequest(`/specialized-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest(`/specialized-services/${id}`, {
      method: 'DELETE',
    });
  },
};

export const appointmentRequestsApi = {
  getAll: async (): Promise<AppointmentRequest[]> => {
    return apiRequest('/api/v1/admin/booking-requests');
  },

  getById: async (id: number): Promise<AppointmentRequest> => {
    return apiRequest(`/api/v1/admin/booking-requests/${id}`);
  },

  confirm: async (id: number, data: ConfirmRequestData): Promise<AppointmentRequest> => {
    return apiRequest(`/api/v1/admin/booking-requests/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  reject: async (id: number, data: RejectRequestData): Promise<AppointmentRequest> => {
    return apiRequest(`/api/v1/admin/booking-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: number, status: string): Promise<AppointmentRequest> => {
    return apiRequest(`/appointment-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest(`/appointment-requests/${id}`, {
      method: 'DELETE',
    });
  },
};