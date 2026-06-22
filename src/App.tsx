import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import UploadPage from '@/pages/Upload';
import ComparePage from '@/pages/Compare';
import TenantDashboard from '@/pages/Tenant';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '../shared/types';

function ProtectedRoute({ children, allowedRole }: { children: JSX.Element; allowedRole: UserRole }) {
  const { token, role } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role !== allowedRole) {
    return <Navigate to={role === 'admin' ? '/dashboard' : '/tenant'} replace />;
  }

  return children;
}

function DefaultRedirect() {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'admin' ? '/dashboard' : '/tenant'} replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DefaultRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute allowedRole="admin">
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute allowedRole="admin">
              <ComparePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant"
          element={
            <ProtectedRoute allowedRole="tenant">
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </Router>
  );
}
