export const auth = {
  login: async (email: string, password: string) => ({ token: 'mock', user: { id: '1', email } }),
  register: async (email: string, password: string) => ({ token: 'mock', user: { id: '1', email } }),
  logout: () => {},
  getUser: () => null,
};

export const authService = auth;
export default auth;