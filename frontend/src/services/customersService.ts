import axios from '../lib/axios';

export interface CustomerDocument {
  id: number;
  customer_id: number;
  filename: string;
  stored_name: string;
  path: string;
  size: number;
  formatted_size: string;
  mime_type: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  notes?: string;
  documents?: CustomerDocument[];
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerFilters {
  status?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateCustomerData {
  fullName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  notes?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export interface PaginatedCustomersResponse {
  data: Customer[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const customersService = {
  /**
   * Get all customers with optional filters
   */
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedCustomersResponse> {
    const response = await axios.get<PaginatedCustomersResponse>('/api/customers', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get a single customer by ID
   */
  async getCustomer(id: number): Promise<Customer> {
    const response = await axios.get<{ data: Customer }>(`/api/customers/${id}`);
    return response.data.data;
  },

  /**
   * Create a new customer
   */
  async createCustomer(data: CreateCustomerData, documents?: File[]): Promise<Customer> {
    // If documents are provided, use FormData
    if (documents && documents.length > 0) {
      const formData = new FormData();
      formData.append('full_name', data.fullName);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('status', data.status);
      formData.append('notes', data.notes || '');
      
      documents.forEach((file) => {
        formData.append('documents[]', file);
      });

      const response = await axios.post<{ message: string; data: Customer }>(
        '/api/customers',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    }

    // Otherwise use regular JSON
    const response = await axios.post<{ message: string; data: Customer }>('/api/customers', {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      status: data.status,
      notes: data.notes || '',
    });
    return response.data.data;
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(id: number, data: UpdateCustomerData, documents?: File[]): Promise<Customer> {
    // If documents are provided, use FormData with POST method and _method override
    if (documents && documents.length > 0) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      
      if (data.fullName) formData.append('full_name', data.fullName);
      if (data.email) formData.append('email', data.email);
      if (data.phone) formData.append('phone', data.phone);
      if (data.status) formData.append('status', data.status);
      if (data.notes !== undefined) formData.append('notes', data.notes);
      
      documents.forEach((file) => {
        formData.append('documents[]', file);
      });

      const response = await axios.post<{ message: string; data: Customer }>(
        `/api/customers/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    }

    // Otherwise use regular JSON with PUT
    const updateData: Record<string, any> = {};

    if (data.fullName) updateData.full_name = data.fullName;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const response = await axios.put<{ message: string; data: Customer }>(
      `/api/customers/${id}`,
      updateData
    );
    return response.data.data;
  },

  /**
   * Delete a customer
   */
  async deleteCustomer(id: number): Promise<void> {
    await axios.delete(`/api/customers/${id}`);
  },

  /**
   * Search customers by name, email, or phone
   */
  async searchCustomers(searchTerm: string, perPage = 50): Promise<Customer[]> {
    const response = await axios.get<PaginatedCustomersResponse>('/api/customers', {
      params: {
        search: searchTerm,
        per_page: perPage,
      },
    });
    return response.data.data;
  },
};