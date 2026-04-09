// ============================================================
// yishan Types v2.0 - Multi-content-type memory system
// ============================================================

// Content types for different memory items
export type ContentType = 'word' | 'formula' | 'knowledge' | 'mistake' | 'definition';

// Word / Memory Card (Bayesian Spaced Repetition Model)
export interface Word {
  id: string;
  term: string;
  phonetic?: string;
  definition: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  tags: string[];
  
  // Content type - determines memory strategy
  contentType: ContentType;
  
  // Additional fields per content type
  notes?: string;        // user custom notes (all types)
  errorReason?: string;   // mistake type: "概念混淆" / "计算失误" / "审题不清"
  formulaType?: string;   // formula type: "几何" / "代数" / "三角"
  
  // Bayesian memory model (Beta Distribution)
  alpha: number;          // Prior successes (Bayesian)
  beta: number;          // Prior failures (Bayesian)
  halflife: number;      // Minutes until recall probability drops to 0.5
  
  // State
  lastSeen: number;      // Unix timestamp (ms)
  totalExposure: number; // Total review count
  dueDate: number;       // Next review timestamp (ms)
  
  // Stability (computed from halflife, 0-100)
  stability?: number;
  
  createdAt: number;     // Unix timestamp (ms)
  updatedAt?: number;    // Unix timestamp (ms)
  deletedAt?: number;    // Soft delete for sync
}

export interface InteractionMetrics {
  durationMs: number;
  isFlipped: boolean;
  audioPlayedCount: number;
  direction: 'left' | 'right'; // left = mastered, right = review
  contentType?: ContentType;
}

export interface Stats {
  totalSignals: number;
  fadingSignals: number;
  averageRecallProb: number;
  connectivity: number;
  streak?: number;
  masteredWords?: number;
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

// ============================================================
// Sync Types
// ============================================================
export interface SyncDevice {
  deviceId: string;
  deviceName: string;
  lastActiveAt: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt: number | null;
  pendingChanges: number;
  syncVersion: number;
  deviceId: string;
}

export interface SyncChange {
  action: 'upsert' | 'delete';
  word: Partial<Word>;
  wordId?: string;
  timestamp: number;
}

// ============================================================
// Content-type specific metadata
// ============================================================
export const CONTENT_TYPE_LABELS: Record<ContentType, { zh: string; en: string }> = {
  word: { zh: '单词', en: 'Word' },
  formula: { zh: '公式', en: 'Formula' },
  knowledge: { zh: '知识点', en: 'Knowledge' },
  mistake: { zh: '错题', en: 'Mistake' },
  definition: { zh: '名词解释', en: 'Definition' },
};

export const ERROR_REASONS = [
  { value: 'concept', label: '概念混淆', en: 'Concept confusion' },
  { value: 'calculation', label: '计算失误', en: 'Calculation error' },
  { value: 'reading', label: '审题不清', en: 'Misreading' },
  { value: 'memory', label: '记忆模糊', en: 'Memory lapse' },
  { value: 'logic', label: '逻辑错误', en: 'Logic error' },
];

export const FORMULA_TYPES = [
  { value: 'algebra', label: '代数', en: 'Algebra' },
  { value: 'geometry', label: '几何', en: 'Geometry' },
  { value: 'trigonometry', label: '三角函数', en: 'Trigonometry' },
  { value: 'calculus', label: '微积分', en: 'Calculus' },
  { value: 'statistics', label: '概率统计', en: 'Statistics' },
];
