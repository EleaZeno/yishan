export const VALID_USERS = [
  { id: '1', email: '111', password: '111', name: 'User' }
];

export const authService = {
  login: async (email: string, password: string) => {
    const user = VALID_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const { password: _, ...safeUser } = user;
    const token = btoa(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 86400000 }));
    return { token, user: safeUser };
  },
  
  register: async (email: string, password: string) => {
    const exists = VALID_USERS.find(u => u.email === email);
    if (exists) {
      throw new Error('User already exists');
    }
    const newUser = { id: String(VALID_USERS.length + 1), email, password, name: email };
    VALID_USERS.push(newUser);
    const { password: _, ...safeUser } = newUser;
    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, exp: Date.now() + 86400000 }));
    return { token, user: safeUser };
  },
  
  logout: () => {
    localStorage.removeItem('yishan_token');
    localStorage.removeItem('yishan_user');
  },
  
  getToken: () => localStorage.getItem('yishan_token'),
  
  getCurrentUser: () => {
    const user = localStorage.getItem('yishan_user');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },
  
  setSession: (token: string, user: any) => {
    localStorage.setItem('yishan_token', token);
    localStorage.setItem('yishan_user', JSON.stringify(user));
  },
  
  validateToken: (token: string) => {
    try {
      const data = JSON.parse(atob(token));
      return data.exp > Date.now();
    } catch {
      return false;
    }
  }
};

export const auth = authService;
export default authService;
