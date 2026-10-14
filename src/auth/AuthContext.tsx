import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { RegisterInput, Role, User } from '../types';
import { AuthContext } from './context';
import * as store from './storage';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => store.getSession());

  const login = useCallback((role: Role, email: string, password: string) => {
    const u = store.login(role, email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback((input: RegisterInput) => {
    const u = store.register(input);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    store.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
