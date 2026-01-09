// 单词及其复习状态定义
export interface Word {
  id: string;
  term: string;           // 单词
  phonetic?: string;      // 音标
  definition: string;     // 中文释义
  exampleSentence?: string; // 例句
  exampleTranslation?: string; // 例句翻译
  tags: string[];
  
  // Memory Algorithm Fields (YiShan Strength Model)
  strength: number;       // 记忆强度 (0-1)
  interval: number;       // 当前间隔 (分钟)
  dueDate: number;        // 下次复习时间戳
  repetitions: number;    // 复习次数
  
  createdAt: number;
}

// 用户交互行为指标 (作为算法输入)
export interface InteractionMetrics {
  durationMs: number;     // 停留毫秒数
  flipped: boolean;       // 是否翻转查看背面
  audioPlayed: number;    // 播放音频次数
  exampleExpanded: boolean; // 是否展开例句
  direction: 'left' | 'right'; // 滑动方向
}

// 统计数据
export interface Stats {
  totalWords: number;
  dueToday: number;
  learned: number; // Interval > 1 day
  retentionRate: number; // Based on avg strength
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}