import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';

// export const Route = createFileRoute('/dashboard/reports')({
//   beforeLoad: async ({ location }) => {
//     const token = localStorage.getItem('auth_token');
//     if (!token) {
//       throw redirect({
//         to: '/',
//         search: {
//           redirect: location.href,
//         },
//       });
//     }

//     const userJson = localStorage.getItem('auth_user');
//     if (userJson) {
//       const user = JSON.parse(userJson);
//       if (user.role !== 'manager') {
//         throw redirect({
//           to: '/dashboard',
//         });
//       }
//     }
//   },
//   component: ReportsPage,
// });

function ReportsPage() {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Sales',
      value: 'AED 1,234,567',
      growth: '+23.5%',
      icon: '💰',
      color: 'bg-green-100',
    },
    {
      name: 'Total Leads',
      value: '456',
      growth: '+12%',
      icon: '🎯',
      color: 'bg-blue-100',
    },
    {
      name: 'Converted',
      value: '123',
      growth: '+18%',
      icon: '✅',
      color: 'bg-purple-100',
    },
    {
      name: 'Active Users',
      value: '3',
      growth: '0%',
      icon: '👥',
      color: 'bg-yellow-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            View detailed reports and insights (Manager Only)
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Report
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-sm text-green-600 font-medium">{stat.growth}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Chart visualization would go here</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">Manager Access Only</h3>
            <div className="mt-2 text-sm text-purple-700">
              <p>This page is only accessible to users with the Manager role.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
