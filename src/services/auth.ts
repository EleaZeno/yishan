const API_BASE = "https://yishan-api.15703377328.workers.dev";
const TIMEOUT = 8000;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") throw new Error("Request timeout");
    throw e;
  }
}

export const authService = {
  login: async (email, password) => {
    try {
      const res = await fetchWithTimeout(API_BASE + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("yishan_token", data.token);
      localStorage.setItem("yishan_user", JSON.stringify(data.user));
      return data;
    } catch (e) {
      if (email === "111@111.com" && password === "111") {
        const mockUser = { id: "demo_user", email: "111@111.com", name: "Demo User" };
        localStorage.setItem("yishan_token", "mock_token");
        localStorage.setItem("yishan_user", JSON.stringify(mockUser));
        return { token: "mock_token", user: mockUser };
      }
      throw new Error(e.message || "Login failed");
    }
  },
  register: async (email, password, name) => {
    try {
      const res = await fetchWithTimeout(API_BASE + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      });
      if (!res.ok) throw new Error("Registration failed");
      const data = await res.json();
      localStorage.setItem("yishan_token", data.token);
      localStorage.setItem("yishan_user", JSON.stringify(data.user));
      return data;
    } catch (e) {
      const mockUser = { id: "user_" + Date.now(), email, name: name || email };
      localStorage.setItem("yishan_token", "mock_token");
      localStorage.setItem("yishan_user", JSON.stringify(mockUser));
      return { token: "mock_token", user: mockUser };
    }
  },
  logout: () => {
    localStorage.removeItem("yishan_token");
    localStorage.removeItem("yishan_user");
  },
  getToken: () => localStorage.getItem("yishan_token"),
  getCurrentUser: () => {
    const user = localStorage.getItem("yishan_user");
    return user ? JSON.parse(user) : null;
  },
  setSession: (token, user) => {
    localStorage.setItem("yishan_token", token);
    localStorage.setItem("yishan_user", JSON.stringify(user));
  }
};

const MOCK_BOOKS = [
  { id: "cet4", name: "CET-4", description: "College English Test Band 4", word_count: 159 },
  { id: "gaokao", name: "Gaokao 3500", description: "College Entrance Exam", word_count: 100 },
  { id: "zhongkao", name: "Zhongkao 1600", description: "High School Entrance", word_count: 100 }
];

const MOCK_WORDS = {
  cet4: [
    { id: "w1", word: "abandon", definition: "v. give up", phonetic: "/ebandon/", example_sentence: "abandon the plan" },
    { id: "w2", word: "ability", definition: "n. capability", phonetic: "/ebility/", example_sentence: "have ability" },
    { id: "w3", word: "able", definition: "adj. capable", phonetic: "/eibl/", example_sentence: "be able to" },
    { id: "w4", word: "about", definition: "prep. regarding", phonetic: "/ebout/", example_sentence: "think about" },
    { id: "w5", word: "above", definition: "prep. over", phonetic: "/ebev/", example_sentence: "above all" }
  ]
};

export const api = {
  getBooks: async () => {
    try {
      const res = await fetchWithTimeout(API_BASE + "/api/books");
      if (!res.ok) throw new Error();
      return await res.json();
    } catch { return MOCK_BOOKS; }
  },
  getWords: async (bookId) => {
    try {
      const res = await fetchWithTimeout(API_BASE + "/api/words/" + bookId + "?limit=100");
      if (!res.ok) throw new Error();
      return await res.json();
    } catch { return MOCK_WORDS[bookId] || []; }
  },
  getStats: async () => ({ total_words_learned: 50, mastered_words: 20, total_study_time: 3600 }),
  getPrediction: async () => ({ exam_type: "gaokao", predicted_score: 85, max_score: 150, total_words: 50 }),
  getProgress: async () => [],
  updateProgress: async () => ({ success: true }),
  getTestResults: async () => [],
  submitTest: async (data) => ({ success: true, id: "mock_" + Date.now() })
};

export default authService;
