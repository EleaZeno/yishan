
// 单词及其认知状态定义 (Bayesian Version)
export interface Word {
  id: string;
  term: string;           
  phonetic?: string;      
  definition: string;     
  exampleSentence?: string; 
  exampleTranslation?: string; 
  tags: string[];
  
  // 贝叶斯认知模型字段 (Bayesian Model Fields)
  alpha: number;          // 成功先验
  beta: number;           // 失败先验
  halflife: number;       // 半衰期 (分钟)
  
  lastSeen: number;       // 上次交互时间戳
  totalExposure: number;  // 总交互次数
  dueDate: number;        // 下次应复习时间戳
  
  createdAt: number;
}

export interface InteractionMetrics {
  durationMs: number;     
  isFlipped: boolean;       
  audioPlayedCount: number;
  direction: 'left' | 'right'; // Left = Mastered, Right = Review
}

export interface Stats {
  totalSignals: number;    
  fadingSignals: number;   
  averageRecallProb: number; 
  connectivity: number;      
  estimatedVocab?: number; 
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isPro: boolean;        // 是否为专业版
  proUntil?: number;     // 会员有效期
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface WordPack {
  id: string;
  name: string;
  description: string;
  count: number;
  isPremium: boolean;
  price?: number;
}
