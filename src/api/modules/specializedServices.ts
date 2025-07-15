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
  specialized_service_id: number;
  name: string;
  phone: string;
  preferred_time_slot: string;
  notes: string;
  status: string;
  created_at: string;
  service?: SpecializedService;
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
    return apiRequest('/appointment-requests');
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