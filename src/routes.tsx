
import { Navigate, RouteObject } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScenarioLibraryPage from './pages/ScenarioLibraryPage';
import ScenarioDetailPage from './pages/ScenarioDetailPage';
import FlightAnalysisPage from './pages/FlightAnalysisPage';
import FlightComparePage from './pages/FlightComparePage';
import PilotListPage from './pages/PilotListPage';
import PilotProfilePage from './pages/PilotProfilePage';
import PilotComparePage from './pages/PilotComparePage';
import UploadSimulationPage from './pages/UploadSimulationPage';

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'scenarios', element: <ScenarioLibraryPage /> },
      { path: 'scenarios/:id', element: <ScenarioDetailPage /> },
      { path: 'flights/compare', element: <FlightComparePage /> },
      { path: 'flights/:flightId', element: <FlightAnalysisPage /> },
      {
        path: 'pilots',
        element: (
          <ProtectedRoute requireRole="instructor">
            <PilotListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pilots/compare',
        element: (
          <ProtectedRoute requireRole="instructor">
            <PilotComparePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'pilots/:pilotId',
        element: (
          <ProtectedRoute requireRole="instructor">
            <PilotProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: 'upload', element: <UploadSimulationPage /> },
    ],
  },
];
