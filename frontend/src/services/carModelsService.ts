import axios from '../lib/axios';

export interface CarModel {
  id: number;
  brand_id: number;
  model_name: string;
  brand?: {
    id: number;
    name: string;
  };
  trims_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CarModelFilters {
  search?: string;
  brand_id?: number;
  include_brand?: boolean;
  include_trims?: boolean;
  with_counts?: boolean;
  per_page?: number;
  page?: number;
}

export interface PaginatedCarModelsResponse {
  data: CarModel[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const carModelsService = {
  /**
   * Get all car models with optional filters
   */
  async getModels(filters?: CarModelFilters): Promise<PaginatedCarModelsResponse> {
    const response = await axios.get<PaginatedCarModelsResponse>('/api/car-models', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get a single car model by ID
   */
  async getModel(id: number, includeBrand = false): Promise<CarModel> {
    const response = await axios.get<{ data: CarModel }>(`/api/car-models/${id}`, {
      params: includeBrand ? { include_brand: true } : {},
    });
    return response.data.data;
  },

  /**
   * Search car models by name
   */
  async searchModels(searchTerm: string, brandId?: number, perPage = 50): Promise<CarModel[]> {
    const params: CarModelFilters = {
      search: searchTerm,
      per_page: perPage,
      include_brand: true,
    };

    if (brandId) {
      params.brand_id = brandId;
    }

    const response = await axios.get<PaginatedCarModelsResponse>('/api/car-models', {
      params,
    });
    return response.data.data;
  },

  /**
   * Get models by brand ID
   */
  async getModelsByBrand(brandId: number, perPage = 100): Promise<CarModel[]> {
    const response = await axios.get<PaginatedCarModelsResponse>('/api/car-models', {
      params: {
        brand_id: brandId,
        per_page: perPage,
      },
    });
    return response.data.data;
  },
};