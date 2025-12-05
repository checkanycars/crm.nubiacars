import { Link, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: string;
  allowedRoles?: Array<'manager' | 'sales'>;
}

export default function Sidebar() {
  const { user, hasRole } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  // Define navigation items with role-based access
  const allNavigation: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', allowedRoles: ['manager', 'sales'] },
    { name: 'Leads', path: '/dashboard/leads', icon: '🎯', allowedRoles: ['manager', 'sales'] },
    { name: 'Customers', path: '/dashboard/customers', icon: '👥', allowedRoles: ['manager'] },
    // { name: 'Reports', path: '/dashboard/reports', icon: '📈', allowedRoles: ['manager'] },
    { name: 'User Management', path: '/dashboard/users', icon: '👤', allowedRoles: ['manager'] },
    // { name: 'Settings', path: '/dashboard/settings', icon: '⚙️', allowedRoles: ['manager'] },
  ];

  // Filter navigation based on user role
  const navigation = allNavigation.filter((item) => {
    if (!item.allowedRoles) return true;
    if (!user?.role) return false;
    return item.allowedRoles.includes(user.role as 'manager' | 'sales');
  });

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-600';
      case 'sales':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800 px-4">
        <h1 className="text-xl font-bold text-white">CRM Nubia Cars</h1>
      </div>

      {/* Role Badge */}
      {user?.role && (
        <div className="px-4 pt-4 pb-2">
          <div
            className={`${getRoleBadgeColor(
              user.role
            )} text-white text-xs font-medium px-3 py-2 rounded-lg text-center`}
          >
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Access
          </div>
        </div>
      )}

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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white font-medium">
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
