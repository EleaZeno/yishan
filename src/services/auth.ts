const API_BASE = 'https://yishan-api.15703377328.workers.dev';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    localStorage.setItem('yishan_token', data.token);
    localStorage.setItem('yishan_user', JSON.stringify(data.user));
    return data;
  },
  
  register: async (email: string, password: string, name?: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!res.ok) throw new Error('Registration failed');
    const data = await res.json();
    localStorage.setItem('yishan_token', data.token);
    localStorage.setItem('yishan_user', JSON.stringify(data.user));
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('yishan_token');
    localStorage.removeItem('yishan_user');
  },
  
  getToken: () => localStorage.getItem('yishan_token'),
  
  getCurrentUser: () => {
    const user = localStorage.getItem('yishan_user');
    return user ? JSON.parse(user) : null;
  },
  
  setSession: (token: string, user: any) => {
    localStorage.setItem('yishan_token', token);
    localStorage.setItem('yishan_user', JSON.stringify(user));
  }
};

export const api = {
  getBooks: async () => {
    const res = await fetch(`${API_BASE}/api/books`);
    return res.json();
  },
  
  getWords: async (bookId: string) => {
    const res = await fetch(`${API_BASE}/api/words/${bookId}`);
    return res.json();
  },
  
  getProgress: async (userId: string) => {
    const res = await fetch(`${API_BASE}/api/progress?user_id=${userId}`);
    return res.json();
  },
  
  updateProgress: async (userId: string, wordId: string, correct: boolean) => {
    const res = await fetch(`${API_BASE}/api/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, word_id: wordId, correct })
    });
    return res.json();
  },
  
  getTestResults: async (userId: string) => {
    const res = await fetch(`${API_BASE}/api/tests?user_id=${userId}`);
    return res.json();
  },
  
  submitTest: async (data: any) => {
    const res = await fetch(`${API_BASE}/api/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  getPrediction: async (userId: string, examType: string = 'gaokao') => {
    const res = await fetch(`${API_BASE}/api/predict?user_id=${userId}&exam_type=${examType}`);
    return res.json();
  },
  
  getStats: async (userId: string) => {
    const res = await fetch(`${API_BASE}/api/stats?user_id=${userId}`);
    return res.json();
  }
};

export const auth = authService;
export default authService;
