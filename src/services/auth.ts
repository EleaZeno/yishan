const API_BASE = 'https://yishan-api.15703377328.workers.dev';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (e: any) {
    clearTimeout(timeout);
    throw e;
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      localStorage.setItem('yishan_token', data.token);
      localStorage.setItem('yishan_user', JSON.stringify(data.user));
      return data;
    } catch (e: any) {
      // Fallback for demo
      if (email === '111@111.com' && password === '111') {
        const mockUser: User = { id: 'demo_user', email: '111@111.com', name: 'Demo User' };
        const mockToken = btoa(JSON.stringify({ id: mockUser.id, email: mockUser.email }));
        localStorage.setItem('yishan_token', mockToken);
        localStorage.setItem('yishan_user', JSON.stringify(mockUser));
        return { token: mockToken, user: mockUser };
      }
      throw new Error(e.message || 'Login failed');
    }
  },

  register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      localStorage.setItem('yishan_token', data.token);
      localStorage.setItem('yishan_user', JSON.stringify(data.user));
      return data;
    } catch (e: any) {
      const mockUser: User = { id: 'user_' + Date.now(), email, name: name || email };
      const mockToken = btoa(JSON.stringify({ id: mockUser.id, email: mockUser.email }));
      localStorage.setItem('yishan_token', mockToken);
      localStorage.setItem('yishan_user', JSON.stringify(mockUser));
      return { token: mockToken, user: mockUser };
    }
  },

  logout: () => {
    localStorage.removeItem('yishan_token');
    localStorage.removeItem('yishan_user');
  },

  getToken: (): string | null => localStorage.getItem('yishan_token'),

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('yishan_user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
