import { Link, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Customers', path: '/dashboard/customers', icon: '👥' },
  { name: 'Leads', path: '/dashboard/leads', icon: '🎯' },
  // { name: 'Vehicles', path: '/dashboard/vehicles', icon: '🚗' },
  // { name: 'Sales', path: '/dashboard/sales', icon: '💰' },
  // { name: 'Reports', path: '/dashboard/reports', icon: '📈' },
  // { name: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800 px-4">
        <h1 className="text-xl font-bold text-white">CRM Nubia Cars</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
              ${
                isActive(item.path)
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            `}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Info */}
      {user && (
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white">
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}