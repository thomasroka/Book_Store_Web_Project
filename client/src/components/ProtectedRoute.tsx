import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui/Spinner';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loaded } = useAuth();
  const location = useLocation();

  if (!loaded) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}