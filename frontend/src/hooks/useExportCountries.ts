import { useState, useEffect, useCallback } from 'react';
import { exportCountriesService, type ExportCountry } from '../services/exportCountriesService';

export function useExportCountries(initialSearch = '') {
  const [countries, setCountries] = useState<ExportCountry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);

  const fetchCountries = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await exportCountriesService.searchCountries(searchTerm, 200);
      setCountries(results);
    } catch (err: any) {
      console.error('Failed to fetch export countries:', err);
      setError(err?.response?.data?.message || 'Failed to fetch export countries');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries(search);
  }, [search, fetchCountries]);

  const searchCountries = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
  }, []);

  const refreshCountries = useCallback(() => {
    fetchCountries(search);
  }, [search, fetchCountries]);

  return {
    countries,
    isLoading,
    error,
    searchCountries,
    refreshCountries,
  };
}