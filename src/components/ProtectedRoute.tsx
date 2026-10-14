import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';
import { ROLE_HOME, type Role } from '../types';

export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== role) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <>{children}</>;
}
