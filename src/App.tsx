import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { ApplicantDashboard } from './pages/dashboards/ApplicantDashboard';
import { CompanyDashboard } from './pages/dashboards/CompanyDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/company" element={<ProtectedRoute role="company"><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/applicant" element={<ProtectedRoute role="applicant"><ApplicantDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
