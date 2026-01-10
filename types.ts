
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
  // 我们使用 Beta 分布 (α, β) 来模拟记忆强度的概率
  alpha: number;          // 成功先验 (Prior Successes)
  beta: number;           // 失败先验 (Prior Failures)
  halflife: number;       // 半衰期：记忆概率降至 0.5 所需的时间 (分钟)
  
  lastSeen: number;       // 上次交互时间戳
  totalExposure: number;  // 总交互次数
  dueDate: number;        // 下次应复习时间戳 (当 P(recall) < 0.85 时)
  
  createdAt: number;
}

export interface InteractionMetrics {
  durationMs: number;     
  isFlipped: boolean;       
  audioPlayedCount: number;
  direction: 'left' | 'right'; // Left = Mastered (Success), Right = Review (Fail)
}

export interface Stats {
  totalSignals: number;    
  fadingSignals: number;   
  averageRecallProb: number; // 预测的全库平均召回概率
  connectivity: number;      // 记忆连接强度 (基于半衰期分布)
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
