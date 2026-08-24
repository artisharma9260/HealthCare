import { apiRequest, setToken, clearToken } from '@/lib/api';
import type { AuthUser } from '@/contexts/AuthContext';

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function signUpWithPassword(
  email: string,
  password: string,
  name: string,
  _role: 'patient' | 'doctor' | 'admin' = 'patient'
): Promise<AuthUser> {
  const { token, user } = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, password, name },
  });
  setToken(token);
  return user;
}

export async function signInWithPassword(email: string, password: string): Promise<AuthUser> {
  const { token, user } = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setToken(token);
  return user;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const { user } = await apiRequest<{ user: AuthUser }>('/auth/me');
    return user;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  clearToken();
}
