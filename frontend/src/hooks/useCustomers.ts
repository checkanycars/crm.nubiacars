import { useState, useEffect, useCallback } from 'react';
import { customersService, type Customer } from '../services/customersService';

export function useCustomers(initialSearch = '') {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);

  const fetchCustomers = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await customersService.searchCustomers(searchTerm, 100);
      setCustomers(results);
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
      setError(err?.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(search);
  }, [search, fetchCustomers]);

  const searchCustomers = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
  }, []);

  const refreshCustomers = useCallback(() => {
    fetchCustomers(search);
  }, [search, fetchCustomers]);

  return {
    customers,
    isLoading,
    error,
    searchCustomers,
    refreshCustomers,
  };
}