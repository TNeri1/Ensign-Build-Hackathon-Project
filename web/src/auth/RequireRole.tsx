import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { LinearProgress } from '../components/m3/LinearProgress';
import { Alert } from '../components/m3/Alert';

export function RequireRole({ role, children }: { role: 'staff' | 'admin'; children: ReactNode }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <LinearProgress label="Loading" />;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (role === 'admin' && user.role !== 'admin') return <div className="app-page"><Alert kind="error" title="Admins only">Log in with an admin account to see this page.</Alert></div>;
  return <>{children}</>;
}
