import { User, AuthResponse } from "../types";

// Base URL for Cloudflare Worker
// In production, this is usually just '/api' if served from the same domain
const API_BASE = '/api';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    // 模拟演示环境：如果是在没有真实后端的环境中运行，返回模拟数据
    // 在真实 Cloudflare 环境中，这里会发起 fetch 请求
    if (process.env.NODE_ENV === 'development' && !window.location.host.includes('pages.dev')) {
        await new Promise(r => setTimeout(r, 800));
        if (email === 'demo@example.com' && password === 'password') {
             return {
                user: { id: 'u1', email: 'demo@example.com', name: 'Demo User' },
                token: 'mock-jwt-token'
            };
        }
        // 如果不是 demo 账号，尝试发送请求（虽然在纯前端环境会失败）
    }

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || '登录失败');
    }

    return res.json();
  },

  async register(email: string, password: string): Promise<AuthResponse> {
     if (process.env.NODE_ENV === 'development' && !window.location.host.includes('pages.dev')) {
        await new Promise(r => setTimeout(r, 800));
        return {
            user: { id: 'u2', email, name: email.split('@')[0] },
            token: 'mock-jwt-token'
        };
    }

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || '注册失败');
    }

    return res.json();
  },

  logout() {
    localStorage.removeItem('yishan_token');
    localStorage.removeItem('yishan_user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('yishan_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('yishan_token');
  }
};