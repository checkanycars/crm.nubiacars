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
  },
  component: DashboardLayoutRoute,
});

function DashboardLayoutRoute() {
  return <DashboardLayout />;
}