
// 单词及其认知状态定义
export interface Word {
  id: string;
  term: string;           
  phonetic?: string;      
  definition: string;     
  exampleSentence?: string; 
  exampleTranslation?: string; 
  tags: string[];
  
  // Cognitive Model Fields
  weight: number;         // 认知权重 (0-1) - 核心信号强度
  stability: number;      // 信号稳定性 - 对应复习间隔（分钟）
  lastSeen: number;       // 上次暴露时间戳
  totalExposure: number;  // 总暴露次数
  dueDate: number;        // 下次到期时间戳
  
  createdAt: number;
}

export interface InteractionMetrics {
  durationMs: number;     
  isFlipped: boolean;       
  audioPlayedCount: number;
  direction: 'left' | 'right';
}

export interface Stats {
  totalSignals: number;    
  fadingSignals: number;   
  stabilizedSignals: number; 
  connectivity: number;    
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
