import { createFileRoute, redirect } from '@tanstack/react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

// export const Route = createFileRoute('/dashboard/users')({
//   beforeLoad: async ({ context, location }) => {
//     // Check if user is authenticated
//     const token = localStorage.getItem('auth_token');
//     if (!token) {
//       throw redirect({
//         to: '/',
//         search: {
//           redirect: location.href,
//         },
//       });
//     }

//     // Check if user has manager role
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
//   component: UsersPage,
// });

function UsersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock users data - in production, this would come from an API
  const users = [
    {
      id: 1,
      name: 'Manager',
      email: 'manager@example.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-16 10:30 AM',
      createdAt: '2024-01-01',
    },
    {
      id: 2,
      name: 'Sales One',
      email: 'sales1@example.com',
      role: 'sales',
      status: 'active',
      lastLogin: '2024-01-16 09:15 AM',
      createdAt: '2024-01-02',
    },
    {
      id: 3,
      name: 'Sales Two',
      email: 'sales2@example.com',
      role: 'sales',
      status: 'active',
      lastLogin: '2024-01-15 04:45 PM',
      createdAt: '2024-01-03',
    },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const styles = {
      manager: 'bg-purple-100 text-purple-800 border-purple-200',
      sales: 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ProtectedRoute requiredRole="manager">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage user accounts and permissions (Manager Only)
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <span className="text-2xl">👔</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Managers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === 'manager').length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl">💼</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sales Staff</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === 'sales').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200">
          {/* Search Bar */}
          <div className="border-b border-gray-200 p-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-medium">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(
                          u.status
                        )}`}
                      >
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>

        {/* Manager Access Notice */}
        <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800">Manager Access</h3>
              <div className="mt-2 text-sm text-purple-700">
                <p>
                  This page is only accessible to users with the Manager role. You can manage
                  all users, assign roles, and control access permissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
