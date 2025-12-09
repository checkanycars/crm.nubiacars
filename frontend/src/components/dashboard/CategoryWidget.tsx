import { useState, useEffect } from 'react';
import { leadsService } from '../../services/leadsService';
import type { CategoryStatistics } from '../../services/leadsService';

export function CategoryWidget() {
  const [stats, setStats] = useState<CategoryStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const statsData = await leadsService.getCategoryStatistics();
        setStats(statsData.statistics);
      } catch (err: any) {
        console.error('Failed to fetch category data:', err);
        setError(err?.response?.data?.message || 'Failed to load category data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = [
    {
      key: 'local_new',
      name: 'Local New',
      icon: '🚗',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      iconBgColor: 'bg-blue-100',
    },
    {
      key: 'local_used',
      name: 'Local Used',
      icon: '🔄',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-900',
      iconBgColor: 'bg-purple-100',
    },
    {
      key: 'premium_export',
      name: 'Premium Export',
      icon: '✈️',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      iconBgColor: 'bg-green-100',
    },
    {
      key: 'regular_export',
      name: 'Regular Export',
      icon: '📦',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-900',
      iconBgColor: 'bg-orange-100',
    },
    {
      key: 'commercial_export',
      name: 'Commercial Export',
      icon: '🚚',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      iconBgColor: 'bg-red-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Category Overview</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading category statistics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Category Overview</h2>
        </div>
        <div className="p-6">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const totalConverted = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="rounded-lg bg-white shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Category Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Converted leads by category</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Total Converted:</span>
            <span className="font-semibold text-blue-600">{totalConverted}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const count = stats[category.key as keyof CategoryStatistics] || 0;

            return (
              <div
                key={category.key}
                className={`rounded-lg border-2 ${category.borderColor} ${category.bgColor} p-5 transition-all hover:shadow-md`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${category.iconBgColor}`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  
                  <h3 className={`text-sm font-semibold ${category.textColor}`}>
                    {category.name}
                  </h3>

                  <div className={`text-4xl font-bold ${category.textColor}`}>
                    {count}
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    Converted leads
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {totalConverted === 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            No converted leads with categories yet
          </div>
        )}
      </div>
    </div>
  );
}