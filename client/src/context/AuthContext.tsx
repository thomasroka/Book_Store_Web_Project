import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { User } from '../types';
import { clearSession, getStoredUser, getToken, setSession } from '../utils/storage';

interface AuthContextValue {
  user: User | null;
  loaded: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfileName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser<User>());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setLoaded(true);
      return;
    }
    authService
      .me()
      .then(({ user: current }) => setUser(current))
      .catch(() => clearSession())
      .finally(() => setLoaded(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedInUser } = await authService.login({ email, password });
    setSession(token, loggedInUser);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user: registeredUser } = await authService.register({ name, email, password });
    setSession(token, registeredUser);
    setUser(registeredUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    window.location.assign('/');
  }, []);

  const updateProfileName = useCallback(async (name: string) => {
    const { user: updated } = await authService.updateProfile(name);
    setUser(updated);
    localStorage.setItem('leaf_ink_user', JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loaded, isAdmin: user?.role === 'admin', login, register, logout, updateProfileName }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}