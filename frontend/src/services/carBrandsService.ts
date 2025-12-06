import axios from '../lib/axios';

export interface CarBrand {
  id: number;
  name: string;
  models_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CarBrandFilters {
  search?: string;
  include_models?: boolean;
  with_counts?: boolean;
  per_page?: number;
  page?: number;
}

export interface PaginatedCarBrandsResponse {
  data: CarBrand[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const carBrandsService = {
  /**
   * Get all car brands with optional filters
   */
  async getBrands(filters?: CarBrandFilters): Promise<PaginatedCarBrandsResponse> {
    const response = await axios.get<PaginatedCarBrandsResponse>('/api/car-brands', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get a single car brand by ID
   */
  async getBrand(id: number, includeModels = false): Promise<CarBrand> {
    const response = await axios.get<{ data: CarBrand }>(`/api/car-brands/${id}`, {
      params: includeModels ? { include_models: true } : {},
    });
    return response.data.data;
  },

  /**
   * Search car brands by name
   */
  async searchBrands(searchTerm: string, perPage = 50): Promise<CarBrand[]> {
    const response = await axios.get<PaginatedCarBrandsResponse>('/api/car-brands', {
      params: {
        search: searchTerm,
        per_page: perPage,
      },
    });
    return response.data.data;
  },
};