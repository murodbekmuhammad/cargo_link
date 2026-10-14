import { createContext } from 'react';
import type { RegisterInput, Role, User } from '../types';

export interface AuthContextValue {
  user: User | null;
  login: (role: Role, email: string, password: string) => User;
  register: (input: RegisterInput) => User;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
