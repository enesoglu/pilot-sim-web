import { useAuth } from '../auth/AuthContext';
import DashboardPilot from './DashboardPilot';
import DashboardInstructor from './DashboardInstructor';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  if (currentUser?.role === 'instructor') return <DashboardInstructor />;
  return <DashboardPilot />;
}
