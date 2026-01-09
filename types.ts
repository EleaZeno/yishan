
// 单词及其认知状态定义
export interface Word {
  id: string;
  term: string;           
  phonetic?: string;      
  definition: string;     
  exampleSentence?: string; 
  exampleTranslation?: string; 
  tags: string[];
  
  // 认知模型字段 (Cognitive Model Fields)
  weight: number;         // 记忆权重 (0.0-1.0)：0.1表示极度生疏，1.0表示牢不可破
  stability: number;      // 信号稳定性：复习间隔（分钟）
  lastSeen: number;       // 上次交互时间戳
  totalExposure: number;  // 总暴露/复习次数
  dueDate: number;        // 下次应复习时间戳
  
  createdAt: number;
}

export interface InteractionMetrics {
  durationMs: number;     
  isFlipped: boolean;       
  audioPlayedCount: number;
  direction: 'left' | 'right'; // Left = Mastered, Right = Review Again
}

export interface Stats {
  totalSignals: number;    
  fadingSignals: number;   
  stabilizedSignals: number; 
  connectivity: number; // 0-100, 基于平均weight
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
