/**
 * 忆闪 YiShan - 全局配置文件
 * 统一管理所有魔法数字和常量配置
 */

// ==================== 算法配置 ====================
export const ALGORITHM_CONFIG = {
  // 召回率阈值
  RECALL_THRESHOLD: 0.85,
  
  // 半衰期配置 (单位：分钟)
  DEFAULT_HALFLIFE: 24 * 60,    // 默认：1天
  MIN_HALFLIFE: 10,             // 最小：10分钟
  MAX_HALFLIFE: 525600,         // 最大：1年
  
  // 反应时间奖惩
  REACTION_BONUS_MAX: 0.2,
  FAST_REACTION_THRESHOLD_MS: 3000,
  
  // Beta 分布参数
  DEFAULT_ALPHA: 3,
  DEFAULT_BETA: 1,
  
  // 调整因子
  SUCCESS_SCALING_FACTOR: 1.5,
  FAILURE_HALFLIFE_RATIO: 0.2,
} as const;

// ==================== UI 配置 ====================
export const UI_CONFIG = {
  // 动画时长 (ms)
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // 闪卡配置
  FLASHCARD: {
    SWIPE_THRESHOLD: 100,
    VELOCITY_THRESHOLD: 400,
    MAX_ROTATION: 12,
    MAX_SCALE: 0.96,
  },
  
  // 学习配置
  STUDY: {
    MAX_DUE_WORDS: 50,
    MIN_SUCCESS_MS: 900,
  },
  
  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    STATS_PAGE_SIZE: 1000,
  },
} as const;

// ==================== 主题配置 ====================
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#4f46e5',      // indigo-600
    SECONDARY: '#0891b2',    // cyan-600
    SUCCESS: '#10b981',      // emerald-500
    WARNING: '#f59e0b',      // amber-500
    DANGER: '#ef4444',       // red-500
    
    // 暗色模式
    DARK_BG: '#0f172a',      // slate-900
    DARK_CARD: '#1e293b',    // slate-800
    DARK_TEXT: '#f1f5f9',    // slate-100
  },
  
  // 存储键
  STORAGE_KEYS: {
    THEME: 'yishan_theme',
    WORDS: 'yishan_words_v1',
    USER: 'yishan_user',
  },
} as const;

// ==================== API 配置 ====================
export const API_CONFIG = {
  BASE_URL: '/api',
  ENDPOINTS: {
    WORDS: '/words',
    AUTH: '/auth',
    STATS: '/stats',
  },
  TIMEOUT: 10000, // ms
} as const;

// ==================== 存储键 ====================
export const STORAGE_KEYS = {
  WORDS: 'yishan_words_v1',
  USER: 'yishan_user',
  THEME: 'yishan_theme',
  SETTINGS: 'yishan_settings',
} as const;

export default {
  ALGORITHM_CONFIG,
  UI_CONFIG,
  THEME_CONFIG,
  API_CONFIG,
  STORAGE_KEYS,
};
