import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function RequireRole({ role, children }: { role: 'staff' | 'admin'; children: ReactNode }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <p className="muted">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (role === 'admin' && user.role !== 'admin') return <p className="error">Admins only.</p>;
  return <>{children}</>;
}
