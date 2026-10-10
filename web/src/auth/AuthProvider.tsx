import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { SessionUser } from '@vlf/shared';
import { api } from '../api/client';

interface AuthState {
  user: SessionUser | null;
  ready: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}
const Ctx = createContext<AuthState>(null as unknown as AuthState);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.get<SessionUser>('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setReady(true));
  }, []);

  const value: AuthState = {
    user,
    ready,
    login: async (email, password) => setUser(await api.post<SessionUser>('/auth/login', { email, password })),
    logout: async () => { await api.post('/auth/logout'); setUser(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
