import axios from '../lib/axios';

export interface ExportCountry {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExportCountryFilters {
  search?: string;
  show_inactive?: boolean;
  per_page?: number;
  page?: number;
}

export interface PaginatedExportCountriesResponse {
  data: ExportCountry[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const exportCountriesService = {
  /**
   * Get all export countries with optional filters
   */
  async getCountries(filters?: ExportCountryFilters): Promise<PaginatedExportCountriesResponse> {
    const response = await axios.get<PaginatedExportCountriesResponse>('/api/export-countries', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get a single export country by ID
   */
  async getCountry(id: number): Promise<ExportCountry> {
    const response = await axios.get<{ data: ExportCountry }>(`/api/export-countries/${id}`);
    return response.data.data;
  },

  /**
   * Search export countries by name
   */
  async searchCountries(searchTerm: string, perPage = 100): Promise<ExportCountry[]> {
    const response = await axios.get<PaginatedExportCountriesResponse>('/api/export-countries', {
      params: {
        search: searchTerm,
        per_page: perPage,
      },
    });
    return response.data.data;
  },

  /**
   * Create a new export country
   */
  async createCountry(data: { name: string; is_active?: boolean }): Promise<ExportCountry> {
    const response = await axios.post<{ data: ExportCountry }>('/api/export-countries', data);
    return response.data.data;
  },

  /**
   * Update an export country
   */
  async updateCountry(id: number, data: { name?: string; is_active?: boolean }): Promise<ExportCountry> {
    const response = await axios.put<{ data: ExportCountry }>(`/api/export-countries/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete an export country
   */
  async deleteCountry(id: number): Promise<void> {
    await axios.delete(`/api/export-countries/${id}`);
  },
};