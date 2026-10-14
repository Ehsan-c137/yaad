import { useUserStore } from '../store/use-user-store';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  accessToken: string;
  defaultWorkspaceId?: string;
}

export interface IAuthService {
  register(email: string, password: string, name?: string): Promise<AuthResponse>;
  login(email: string, password: string): Promise<AuthResponse>;
  logout(): void;
  getToken(): string | null;
}

export class AuthService implements IAuthService {
  private readonly baseUrl: string;

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Registration failed');
    }

    const data: AuthResponse = await res.json();
    useUserStore.getState().setAuth({
      token: data.accessToken,
      userId: data.user.id,
      email: data.user.email,
      name,
    });

    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Login failed');
    }

    const data: AuthResponse = await res.json();
    useUserStore.getState().setAuth({
      token: data.accessToken,
      userId: data.user.id,
      email: data.user.email,
    });

    return data;
  }

  logout(): void {
    useUserStore.getState().clearAuth();
  }

  getToken(): string | null {
    return useUserStore.getState().token;
  }
}

export const authService = new AuthService();
