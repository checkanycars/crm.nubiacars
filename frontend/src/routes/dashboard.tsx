import { createFileRoute, redirect } from '@tanstack/react-router';
import DashboardLayout from '../components/dashboard/DashboardLayout';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      });
    }
    
    // Redirect finance users to finance page when accessing /dashboard root
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'finance') {
            throw redirect({
              to: '/dashboard/finance',
            });
          }
        } catch (error) {
          // If it's a redirect error, re-throw it
          if (error && typeof error === 'object' && 'to' in error) {
            throw error;
          }
          // Otherwise ignore JSON parsing errors
        }
      }
    }
  },
  component: DashboardLayoutRoute,
});

function DashboardLayoutRoute() {
  return <DashboardLayout />;
}