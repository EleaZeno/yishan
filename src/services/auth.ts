export const authService = {
  login: async (email: string, password: string) => {
    return { token: 'mock', user: { id: '1', email } };
  },
  register: async (email: string, password: string) => {
    return { token: 'mock', user: { id: '1', email } };
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getToken: () => localStorage.getItem('token'),
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setSession: (token: string, user: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const auth = authService;
export default authService;
