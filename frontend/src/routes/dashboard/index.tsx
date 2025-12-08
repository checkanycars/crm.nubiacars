import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { leadsService } from '../../services/leadsService';
import { customersService } from '../../services/customersService';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndexPage,
});

interface DashboardStats {
  totalCustomers: number;
  activeLeads: number;
  convertedLeads: number;
  notConvertedLeads: number;
  conversionRate: number;
}

function DashboardIndexPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeLeads: 0,
    convertedLeads: 0,
    notConvertedLeads: 0,
    conversionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch customers and leads statistics in parallel
        const [customersResponse, leadsStats] = await Promise.all([
          customersService.getCustomers({ per_page: 1 }), // Just get count
          leadsService.getStatistics(),
        ]);


        // Laravel pagination may return data in meta object
        const totalCustomers = customersResponse?.total ||
                               customersResponse?.meta?.total ||
                               (customersResponse as any)?.data?.total || 0;

        // Calculate conversion rate
        const total = leadsStats.total;
        const conversionRate = total > 0 ? Math.round((leadsStats.converted / total) * 100) : 0;


        setStats({
          totalCustomers,
          activeLeads: leadsStats?.new || 0,
          convertedLeads: leadsStats?.converted || 0,
          notConvertedLeads: leadsStats?.not_converted || 0,
          conversionRate,
        });
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(err?.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleAddCustomer = () => {
    navigate({
      to: '/dashboard/customers',
      search: { action: 'add' }
    });
  };

  const handleCreateLead = () => {
    navigate({
      to: '/dashboard/leads',
      search: { action: 'add' }
    });
  };

  const statsCards = [
    {
      name: 'Total Customers',
      value: isLoading ? '...' : (stats.totalCustomers || 0).toLocaleString(),
      icon: '👥',
    },
    {
      name: 'Active Leads',
      value: isLoading ? '...' : (stats.activeLeads || 0).toLocaleString(),
      icon: '🎯',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name || 'User'}! Here's what's happening today.
        </p>
        {user?.role === 'sales' && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Showing only your assigned leads and related customers</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
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
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-lg bg-white px-6 py-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="shrink-0">
                <span className="text-4xl">{stat.icon}</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className={`grid gap-6 ${user?.role === 'manager' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        {/* Leads Overview */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Leads Overview
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/dashboard/leads', search: { action: undefined } })}
              className="text-blue-600 hover:text-blue-700"
            >
              View All →
            </Button>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading statistics...</div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* New Leads */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-xl">🆕</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">New Leads</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.activeLeads || 0}</p>
                    </div>
                  </div>

                  {/* Converted */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <span className="text-xl">✅</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Converted</p>
                      <p className="text-2xl font-bold text-green-600">{stats.convertedLeads || 0}</p>
                    </div>
                  </div>

                  {/* Not Converted */}
                  <div className="flex items-center gap-4 sm:col-span-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <span className="text-xl">❌</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Not Converted</p>
                      <p className="text-2xl font-bold text-red-600">{stats.notConvertedLeads || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Conversion Rate Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                    <span className="text-sm font-semibold text-gray-900">{stats.conversionRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-linear-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.conversionRate || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>
                      {stats.convertedLeads || 0} converted out of{' '}
                      {(stats.activeLeads || 0) + (stats.convertedLeads || 0) + (stats.notConvertedLeads || 0)} total leads
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions - Only visible to managers */}
        {user?.role === 'manager' && (
          <div className="rounded-lg bg-white shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <Button
                variant="outline"
                onClick={handleAddCustomer}
                className="w-full flex items-center justify-between rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 h-auto hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">➕</span>
                  <span className="font-medium text-gray-900">Add New Customer</span>
                </span>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>

              <Button
                variant="outline"
                onClick={handleCreateLead}
                className="w-full flex items-center justify-between rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 h-auto hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <span className="font-medium text-gray-900">Create New Lead</span>
                </span>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
