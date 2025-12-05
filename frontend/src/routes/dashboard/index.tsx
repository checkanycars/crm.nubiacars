import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const stats = [
    {
      name: 'Total Customers',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: '👥',
    },
    {
      name: 'Active Leads',
      value: '456',
      change: '+8%',
      changeType: 'positive',
      icon: '🎯',
    },
    // {
    //   name: 'Monthly Sales',
    //   value: 'AED 89,23',
    //   change: '+23%',
    //   changeType: 'positive',
    //   icon: '💰',
    // },
    // {
    //   name: 'Vehicles Sold',
    //   value: '67',
    //   change: '-4%',
    //   changeType: 'negative',
    //   icon: '🚗',
    // },
  ];

  // Mock leads data - would come from API in production
  const leads = useMemo(() => [
    { id: 1, name: 'Sarah Miller', status: 'new', createdAt: '2024-01-16' },
    { id: 2, name: 'Michael Davis', status: 'new', createdAt: '2024-01-15' },
    { id: 3, name: 'Emily Wilson', status: 'new', createdAt: '2024-01-12' },
    { id: 4, name: 'David Martinez', status: 'converted', createdAt: '2024-01-14' },
    { id: 5, name: 'Lisa Anderson', status: 'converted', createdAt: '2024-01-10' },
    { id: 6, name: 'Robert Taylor', status: 'not_converted', createdAt: '2024-01-08' },
    { id: 7, name: 'Jennifer White', status: 'not_converted', createdAt: '2024-01-05' },
  ], []);

  const leadsStats = useMemo(() => {
    const total = leads.length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const notConverted = leads.filter(l => l.status === 'not_converted').length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

    return { total, converted, notConverted, newLeads, conversionRate };
  }, [leads]);


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name || 'User'}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {stats.map((stat) => (
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
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </div>
                </dd>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}

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
            <div className="grid gap-4 sm:grid-cols-2">
              {/* New Leads */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-xl">🆕</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">New Leads</p>
                  <p className="text-2xl font-bold text-blue-600">{leadsStats.newLeads}</p>
                </div>
              </div>

              {/* Converted */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Converted</p>
                  <p className="text-2xl font-bold text-green-600">{leadsStats.converted}</p>
                </div>
              </div>

              {/* Not Converted */}
              <div className="flex items-center gap-4 sm:col-span-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <span className="text-xl">❌</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Not Converted</p>
                  <p className="text-2xl font-bold text-red-600">{leadsStats.notConverted}</p>
                </div>
              </div>
            </div>

            {/* Conversion Rate Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                <span className="text-sm font-semibold text-gray-900">{leadsStats.conversionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${leadsStats.conversionRate}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{leadsStats.converted} converted out of {leadsStats.total} total leads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
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

            {/*<button className="w-full flex items-center justify-between rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <span className="flex items-center gap-3">
                <span className="text-2xl">🚗</span>
                <span className="font-medium text-gray-900">Add Vehicle</span>
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
            </button>

            <button className="w-full flex items-center justify-between rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <span className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <span className="font-medium text-gray-900">View Reports</span>
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
            </button>*/}
          </div>
        </div>
      </div>


      {/* Additional Info Section */}
      {/*<div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Need help getting started?</h3>
            <p className="mt-1 text-sm text-blue-100">
              Check out our documentation and tutorials to make the most of your CRM.
            </p>
          </div>
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>*/}
    </div>
  );
}
