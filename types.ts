// 单词及其复习状态定义
export interface Word {
  id: string;
  term: string;           // 单词
  phonetic?: string;      // 音标
  definition: string;     // 中文释义
  exampleSentence?: string; // 例句
  exampleTranslation?: string; // 例句翻译
  tags: string[];
  
  // SM-2 Algorithm fields
  easiness: number;       // 简易度 (EF)
  interval: number;       // 间隔天数
  repetitions: number;    // 连续正确次数
  dueDate: number;        // 下次复习时间戳
  lastReviewDate?: number; // 上次复习时间
  
  createdAt: number;
}

// 复习反馈等级 (0-5)
export enum Grade {
  Blackout = 0, // 完全忘记
  Hard = 3,     // 困难
  Good = 4,     // 记得，但有点犹豫
  Easy = 5,     // 轻松秒杀
}

// 统计数据
export interface Stats {
  totalWords: number;
  dueToday: number;
  learned: number; // Interval > 1
  retentionRate: number;
}

// API 响应结构 (Gemini)
export interface AIWordInfo {
  definition: string;
  phonetic: string;
  exampleSentence: string;
  exampleTranslation: string;
  tags: string[];
}

// 用户认证相关
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}