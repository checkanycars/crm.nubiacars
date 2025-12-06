import { useState, useEffect, useCallback } from 'react';
import { carModelsService, type CarModel } from '../services/carModelsService';

export function useCarModels(initialSearch = '', brandId?: number) {
  const [models, setModels] = useState<CarModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>(brandId);

  const fetchModels = useCallback(async (searchTerm: string, brandId?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await carModelsService.searchModels(searchTerm, brandId, 100);
      setModels(results);
    } catch (err: any) {
      console.error('Failed to fetch car models:', err);
      setError(err?.response?.data?.message || 'Failed to fetch car models');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels(search, selectedBrandId);
  }, [search, selectedBrandId, fetchModels]);

  const searchModels = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
  }, []);

  const filterByBrand = useCallback((brandId?: number) => {
    setSelectedBrandId(brandId);
    setSearch(''); // Reset search when brand changes
  }, []);

  const refreshModels = useCallback(() => {
    fetchModels(search, selectedBrandId);
  }, [search, selectedBrandId, fetchModels]);

  return {
    models,
    isLoading,
    error,
    searchModels,
    filterByBrand,
    refreshModels,
  };
}