import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

// export const Route = createFileRoute('/dashboard/settings')({
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
//   component: SettingsPage,
// });

function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'account', name: 'Account', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'security', name: 'Security', icon: '🔒' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-200">
        {activeTab === 'profile' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your personal information and profile details
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  defaultValue={user?.name}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  defaultValue={user?.email}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  defaultValue={user?.role || 'Sales Representative'}
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Tell us about yourself..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account preferences and settings
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Language</h3>
                  <p className="text-sm text-gray-500">Select your preferred language</p>
                </div>
                <select className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Timezone</h3>
                  <p className="text-sm text-gray-500">Set your local timezone</p>
                </div>
                <select className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC-6 (Central Time)</option>
                  <option>UTC-7 (Mountain Time)</option>
                  <option>UTC-8 (Pacific Time)</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Date Format</h3>
                  <p className="text-sm text-gray-500">Choose how dates are displayed</p>
                </div>
                <select className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose how you want to be notified about updates
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">New Lead Alerts</h3>
                  <p className="text-sm text-gray-500">Get notified when new leads are added</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sales Updates</h3>
                  <p className="text-sm text-gray-500">Notifications about sales activities</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
                  <p className="text-sm text-gray-500">Receive weekly performance reports</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your password and security preferences
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Update Password
              </button>
            </div>

            <div className="rounded-lg bg-red-50 border border-red-200 p-4 mt-6">
              <h3 className="text-sm font-medium text-red-800">Danger Zone</h3>
              <p className="mt-1 text-sm text-red-600">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
