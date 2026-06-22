import { create } from 'zustand';
import type { User, UserRole } from '../../shared/types';

interface AuthState {
  token: string | null;
  user: User | null;
  role: UserRole | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const getStored = <T>(key: string): T | null => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getStored<string>('auth_token'),
  user: getStored<User>('auth_user'),
  role: getStored<UserRole>('auth_role'),
  login: (token, user) => {
    localStorage.setItem('auth_token', JSON.stringify(token));
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_role', JSON.stringify(user.role));
    set({ token, user, role: user.role });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');
    set({ token: null, user: null, role: null });
  },
  setRole: (role) => {
    localStorage.setItem('auth_role', JSON.stringify(role));
    set({ role });
  }
}));
