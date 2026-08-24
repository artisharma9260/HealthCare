import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getToken, clearToken } from '@/lib/api';
import { fetchCurrentUser } from '@/lib/authService';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token = getToken();
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }
      const currentUser = await fetchCurrentUser();
      if (!mounted) return;
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Token invalid or expired
        clearToken();
      }
      setLoading(false);
    }

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const login = (authUser: AuthUser) => setUser(authUser);

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
