import axios from '../lib/axios';

export type LeadCategory = 'local_new' | 'local_used' | 'premium_export' | 'regular_export' | 'commercial_export';

export interface Lead {
  id: number;
  leadName: string;
  customerId?: number;
  contactName: string;
  email: string;
  phone: string;
  customer?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    status: string;
  };
  status: 'new' | 'contacted' | 'converted' | 'not_converted';
  category?: LeadCategory;
  source: string;
  carCompany: string;
  model: string;
  trim?: string;
  spec?: string;
  modelYear: number;
  interiorColour?: string;
  exteriorColour?: string;
  gearBox?: string;
  carType?: 'new' | 'used';
  fuelTank?: string;
  steeringSide?: string;
  exportTo?: string;
  exportToCountry?: string;
  quantity?: number;
  sellingPrice?: number;
  costPrice?: number;
  notes: string;
  priority: 'high' | 'medium' | 'low';
  notConvertedReason?: string;
  assignedTo?: number;
  assignedUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface LeadFilters {
  status?: string;
  priority?: string;
  assigned_to?: number;
  source?: string;
  search?: string;
  car_company?: string;
  model?: string;
  model_year?: number;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface LeadStatistics {
  total: number;
  new: number;
  contacted: number;
  converted: number;
  not_converted: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
}

export interface PerformanceStatistics {
  user_id: number;
  user_name: string;
  user_role: string;
  target: {
    amount: number;
    achieved: number;
    remaining: number;
    progress_percentage: number;
  };
  commission: {
    base_commission: number;
    bonus_commission: number;
    total_commission: number;
  };
  deals: {
    total_converted: number;
    total_sales_value: number;
  };
}

export interface CategoryStatistics {
  local_new: number;
  local_used: number;
  premium_export: number;
  regular_export: number;
  commercial_export: number;
}

export interface CategoryLimits {
  local_new: number;
  local_used: number;
  premium_export: number;
  regular_export: number;
  commercial_export: number;
}

export interface CategoryLimitData {
  user_id: number;
  limits: CategoryLimits;
}

export interface UserWithLimits {
  id: number;
  name: string;
  email: string;
  role: string;
  limits: CategoryLimits;
}

export interface CreateLeadData {
  leadName: string;
  customerId: number;
  source: string;
  carCompany: string;
  model: string;
  trim?: string;
  spec?: string;
  modelYear: number;
  interiorColour?: string;
  exteriorColour?: string;
  gearBox?: string;
  carType?: 'new' | 'used';
  fuelTank?: string;
  steeringSide?: string;
  exportTo?: string;
  exportToCountry?: string;
  quantity?: number;
  sellingPrice?: number;
  costPrice?: number;
  priority: 'high' | 'medium' | 'low';
  category?: LeadCategory;
  notes?: string;
  assignedTo?: number;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: 'new' | 'contacted' | 'converted' | 'not_converted';
  category?: LeadCategory;
  notConvertedReason?: string;
}

export interface PaginatedLeadsResponse {
  data: Lead[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const leadsService = {
  /**
   * Get all leads with optional filters
   */
  async getLeads(filters?: LeadFilters): Promise<PaginatedLeadsResponse> {
    const response = await axios.get<PaginatedLeadsResponse>('/api/leads', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get a single lead by ID
   */
  async getLead(id: number): Promise<Lead> {
    const response = await axios.get<{ data: Lead }>(`/api/leads/${id}`);
    return response.data.data;
  },

  /**
   * Create a new lead
   */
  async createLead(data: CreateLeadData): Promise<Lead> {
    const response = await axios.post<{ message: string; data: Lead }>('/api/leads', {
      lead_name: data.leadName,
      customer_id: data.customerId,
      status: 'new',
      category: data.category || null,
      source: data.source,
      car_company: data.carCompany,
      model: data.model,
      trim: data.trim || '',
      spec: data.spec || '',
      model_year: data.modelYear,
      interior_colour: data.interiorColour || '',
      exterior_colour: data.exteriorColour || '',
      gear_box: data.gearBox || '',
      car_type: data.carType || '',
      fuel_tank: data.fuelTank || '',
      steering_side: data.steeringSide || '',
      export_to: data.exportTo || '',
      export_to_country: data.exportToCountry || '',
      quantity: data.quantity || 1,
      selling_price: data.sellingPrice,
      cost_price: data.costPrice,
      priority: data.priority,
      notes: data.notes || '',
      assigned_to: data.assignedTo,
    });
    return response.data.data;
  },

  /**
   * Update an existing lead
   */
  async updateLead(id: number, data: UpdateLeadData): Promise<Lead> {
    const updateData: Record<string, any> = {};

    if (data.leadName) updateData.lead_name = data.leadName;
    if (data.customerId) updateData.customer_id = data.customerId;
    if (data.status) updateData.status = data.status;
    if (data.category) updateData.category = data.category;
    if (data.source) updateData.source = data.source;
    if (data.carCompany) updateData.car_company = data.carCompany;
    if (data.model) updateData.model = data.model;
    if (data.trim !== undefined) updateData.trim = data.trim;
    if (data.spec !== undefined) updateData.spec = data.spec;
    if (data.modelYear) updateData.model_year = data.modelYear;
    if (data.interiorColour !== undefined) updateData.interior_colour = data.interiorColour;
    if (data.exteriorColour !== undefined) updateData.exterior_colour = data.exteriorColour;
    if (data.gearBox !== undefined) updateData.gear_box = data.gearBox;
    if (data.carType !== undefined) updateData.car_type = data.carType;
    if (data.fuelTank !== undefined) updateData.fuel_tank = data.fuelTank;
    if (data.steeringSide !== undefined) updateData.steering_side = data.steeringSide;
    if (data.exportTo !== undefined) updateData.export_to = data.exportTo;
    if (data.exportToCountry !== undefined) updateData.export_to_country = data.exportToCountry;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.sellingPrice !== undefined) updateData.selling_price = data.sellingPrice;
    if (data.costPrice !== undefined) updateData.cost_price = data.costPrice;
    if (data.priority) updateData.priority = data.priority;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.notConvertedReason) updateData.not_converted_reason = data.notConvertedReason;
    if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo;

    const response = await axios.put<{ message: string; data: Lead }>(
      `/api/leads/${id}`,
      updateData
    );
    return response.data.data;
  },

  /**
   * Delete a lead
   */
  async deleteLead(id: number): Promise<void> {
    await axios.delete(`/api/leads/${id}`);
  },

  /**
   * Get lead statistics
   */
  async getStatistics(): Promise<LeadStatistics> {
    const response = await axios.get<{ data: LeadStatistics }>('/api/leads-statistics');
    return response.data.data;
  },

  /**
   * Bulk delete leads
   */
  async bulkDelete(ids: number[]): Promise<void> {
    await axios.post('/api/leads-bulk-destroy', { ids });
  },

  /**
   * Export leads to CSV
   */
  async exportLeads(filters?: LeadFilters): Promise<any[]> {
    const response = await axios.get<{ data: any[] }>('/api/leads-export', {
      params: filters,
    });
    return response.data.data;
  },

  /**
   * Get performance statistics
   */
  async getPerformance(userId?: number): Promise<PerformanceStatistics> {
    const response = await axios.get<{ data: PerformanceStatistics }>('/api/leads-performance', {
      params: userId ? { user_id: userId } : {},
    });
    return response.data.data;
  },

  /**
   * Get category statistics (converted leads only)
   */
  async getCategoryStatistics(userId?: number): Promise<{ user_id: number; statistics: CategoryStatistics }> {
    const response = await axios.get<{ data: { user_id: number; statistics: CategoryStatistics } }>('/api/leads-category-statistics', {
      params: userId ? { user_id: userId } : {},
    });
    return response.data.data;
  },

  /**
   * Get category limits for a user
   */
  async getCategoryLimits(userId?: number): Promise<CategoryLimitData> {
    const response = await axios.get<{ data: CategoryLimitData }>('/api/category-limits', {
      params: userId ? { user_id: userId } : {},
    });
    return response.data.data;
  },

  /**
   * Update category limits for a user (Manager only)
   */
  async updateCategoryLimits(userId: number, limits: CategoryLimits): Promise<CategoryLimitData> {
    const response = await axios.post<{ data: CategoryLimitData }>('/api/category-limits', {
      user_id: userId,
      limits,
    });
    return response.data.data;
  },

  /**
   * Get all users with their category limits (Manager only)
   */
  async getUsersWithLimits(): Promise<UserWithLimits[]> {
    const response = await axios.get<{ data: UserWithLimits[] }>('/api/category-limits-users');
    return response.data.data;
  },
};