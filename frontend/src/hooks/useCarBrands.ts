import { useState, useEffect, useCallback } from 'react';
import { carBrandsService, type CarBrand } from '../services/carBrandsService';

export function useCarBrands(initialSearch = '') {
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);

  const fetchBrands = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await carBrandsService.searchBrands(searchTerm, 100);
      setBrands(results);
    } catch (err: any) {
      console.error('Failed to fetch car brands:', err);
      setError(err?.response?.data?.message || 'Failed to fetch car brands');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands(search);
  }, [search, fetchBrands]);

  const searchBrands = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
  }, []);

  const refreshBrands = useCallback(() => {
    fetchBrands(search);
  }, [search, fetchBrands]);

  return {
    brands,
    isLoading,
    error,
    searchBrands,
    refreshBrands,
  };
}