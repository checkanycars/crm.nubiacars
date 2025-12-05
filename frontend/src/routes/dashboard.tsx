import { createFileRoute } from '@tanstack/react-router';
import DashboardLayout from '../components/dashboard/DashboardLayout';

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayoutRoute,
});

function DashboardLayoutRoute() {
  return <DashboardLayout />;
}