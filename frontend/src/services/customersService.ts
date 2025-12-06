import axios from '../lib/axios';

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  notes?: string;
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
  async createCustomer(data: CreateCustomerData): Promise<Customer> {
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
  async updateCustomer(id: number, data: UpdateCustomerData): Promise<Customer> {
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
};