import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Loader2, Sparkles, Lightbulb, TrendingUp,
  BookOpen, Target, Zap, ChevronDown, ChevronUp, RefreshCw,
  MessageSquare, ThumbsUp, ThumbsDown, Copy, RotateCcw
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { predictRecallProbability, getOptimalReviewTime } from '../lib/algorithm';
import { Word } from '../types';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  actions?: AIAction[];
  timestamp: number;
}

interface AIAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface AIStudyAssistantProps {
  words: Word[];
  stats: {
    totalSignals: number;
    fadingSignals: number;
    averageRecallProb: number;
    connectivity: number;
  };
  studyHistory?: any[];
  onApplySuggestion?: (suggestion: string) => void;
}

// ============================================================
// AI Response Templates (Simulated AI - No API key needed)
// ============================================================
const AI_ANALYZERS = {
  // Analyze overall learning status
  analyzeStatus: (words: Word[], stats: any): string => {
    if (words.length === 0) {
      return "你的词库目前是空的。添加一些单词开始学习吧！推荐从核心词汇开始，打下坚实的基础。";
    }

    const avgRecall = stats.averageRecallProb;
    const stability = stats.connectivity;
    const dueCount = stats.fadingSignals;

    let health = '优秀';
    let advice = '';

    if (avgRecall < 50) {
      health = '需要加强';
      advice = '建议先复习近期学过的单词，巩固基础。每天坚持复习比一次性学很多更重要。';
    } else if (avgRecall < 70) {
      health = '良好';
      advice = '继续保持现有的学习节奏。建议每天复习 20-30 张卡片，保持记忆活跃。';
    } else if (avgRecall < 85) {
      health = '优秀';
      advice = '你的记忆保持得很好！可以考虑增加每日学习量，挑战更高难度的词汇。';
    } else {
      health = '卓越';
      advice = '你已经是记忆大师了！建议拓展到专业领域词汇，或开始学习新的语言。';
    }

    const contentTypes = words.reduce((acc, w) => {
      acc[w.contentType || 'word'] = (acc[w.contentType || 'word'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeBreakdown = Object.entries(contentTypes)
      .map(([type, count]) => `${type === 'word' ? '单词' : type === 'formula' ? '公式' : type === 'knowledge' ? '知识点' : type === 'mistake' ? '错题' : '名词解释'}: ${count}个`)
      .join('、');

    return `📊 学习健康度：**${health}**

你的词库包含 ${words.length} 个信号节点：
• ${typeBreakdown}

📈 关键指标：
• 平均记忆留存率：**${avgRecall}%**
• 高稳定性占比：**${stability}%**
• 待复习信号：**${dueCount}个**

💡 **${advice}**`;
  },

  // Generate personalized study plan
  generatePlan: (words: Word[], days: number = 7): string => {
    const total = words.length;
    const dailyNew = Math.max(5, Math.floor(total / 30));
    const dailyReview = Math.max(10, Math.floor(total * 0.2));

    const dailyPlan = [];
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayName = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];

      if (dayName === '日' || dayName === '六') {
        dailyPlan.push(`**Day ${i}（周${dayName}）**：轻松复习日，重点回顾本周薄弱单词，约 ${Math.floor(dailyReview * 0.7)} 张`);
      } else {
        dailyPlan.push(`**Day ${i}（周${dayName}）**：${dailyNew}个新单词 + ${dailyReview}张复习`);
      }
    }

    return `🗓️ **${days}天学习计划**

📈 每日目标：
• 新单词：${dailyNew}个/天
• 复习单词：${dailyReview}张/天
• 预计完成时间：15-25分钟/天

${dailyPlan.join('\n')}

💡 **建议**：坚持在固定时间段学习，形成习惯后大脑会自动进入学习状态。`;
  },

  // Analyze weak points
  analyzeWeakPoints: (words: Word[]): string => {
    const weakWords = words
      .filter(w => {
        const prob = predictRecallProbability(w, Date.now());
        return prob < 0.6 && w.totalExposure > 2;
      })
      .sort((a, b) => {
        const probA = predictRecallProbability(a, Date.now());
        const probB = predictRecallProbability(b, Date.now());
        return probA - probB;
      })
      .slice(0, 5);

    if (weakWords.length === 0) {
      return "🎉 太棒了！没有发现明显的薄弱环节。你的记忆稳定性保持得很好！";
    }

    const analysis = weakWords.map((w, i) => {
      const prob = Math.round(predictRecallProbability(w, Date.now()) * 100);
      const nextReview = new Date(getOptimalReviewTime(w)).toLocaleString('zh-CN');
      return `${i + 1}. **${w.term}** — 当前召回率 ${prob}%，建议 ${nextReview} 前复习`;
    });

    return `🔍 **薄弱点分析**

以下是需要重点关注的信号节点：

${analysis.join('\n')}

💡 **技巧**：对于反复忘记的单词，尝试联想记忆法或造句练习，加深印象。`;
  },

  // Learning tips
  getLearningTips: (): string[] => {
    const allTips = [
      { tip: '间隔重复是关键', desc: '按照遗忘曲线安排复习，比集中学习效果提升 200%' },
      { tip: '主动回忆优于被动看', desc: '盖住释义尝试回忆，比单纯看单词记住率高出 50%' },
      { tip: '多感官输入', desc: '边看边读边写，三重编码让记忆更持久' },
      { tip: '睡眠巩固记忆', desc: '学习后 6 小时内睡眠，对记忆巩固至关重要' },
      { tip: '情绪影响记忆', desc: '积极情绪下学习的内容，记忆更深刻持久' },
      { tip: '适度压力有益', desc: '中等难度的挑战比简单重复更能强化记忆' },
      { tip: '穿插练习法', desc: '不同类型内容穿插学习，比逐个击破效果更好' },
      { tip: '间隔效应', desc: '每次学习之间留有间隔，比连续学习记得更牢' },
    ];

    // Return 3 random tips
    const shuffled = [...allTips].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(t => `💡 **${t.tip}**：${t.desc}`);
  },

  // Content recommendations
  recommendContent: (words: Word[]): string => {
    const contentTypes = words.reduce((acc, w) => {
      acc[w.contentType || 'word'] = (acc[w.contentType || 'word'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = words.length;
    const recommendations = [];

    if (!contentTypes.word || contentTypes.word < total * 0.5) {
      recommendations.push('• 建议增加**单词**类内容，打好语言基础');
    }
    if (!contentTypes.formula && total > 20) {
      recommendations.push('• 可以尝试添加**公式**类内容，适合理科学习');
    }
    if (!contentTypes.mistake && total > 30) {
      recommendations.push('• 建议建立**错题本**，针对弱点强化训练');
    }
    if (total < 50) {
      recommendations.push('• 当前词库较小，建议扩充至 50+ 词汇以获得更好的复习效果');
    }

    if (recommendations.length === 0) {
      return "✅ 你的词库结构很均衡！继续保持多样的学习内容。";
    }

    return `📚 **内容建议**

${recommendations.join('\n')}`;
  },

  // Memory science explanation
  explainMemory: (): string => {
    return `🧠 **记忆科学原理**

忆闪采用基于科学的记忆算法：

**1. 间隔重复 (Spaced Repetition)**
大脑对新知识的遗忘是先快后慢。间隔重复利用这一特性，在即将遗忘时复习，大幅提升长期记忆效果。

**2. 贝叶斯自适应**
系统会根据你的每次反应动态调整复习间隔。记不住的单词会频繁出现，已掌握的单词逐渐淡出。

**3. 测试效应 (Testing Effect)**
主动回忆比被动复习效果更好。每一次滑动卡片都是一次"小测试"，强化记忆痕迹。

**4. 认知负荷管理**
系统会监控你的学习状态，避免过度疲劳。适当的休息和复习节奏比长时间学习更有效。

💡 科学研究表明，使用间隔重复的学习者，2周后的记忆保持率比传统学习方法高出 **300%**！`;
  },
};

const AIStudyAssistant: React.FC<AIStudyAssistantProps> = ({
  words, stats, studyHistory, onApplySuggestion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<string[]>([
    '分析我的学习状态', '生成学习计划', '找出薄弱点', '学习技巧', '推荐内容'
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process user query and generate response
  const generateResponse = useCallback(async (userQuery: string): Promise<AIMessage> => {
    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 800));

    const query = userQuery.toLowerCase();

    // Intent detection
    if (query.includes('分析') || query.includes('状态') || query.includes('怎么样')) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: AI_ANALYZERS.analyzeStatus(words, stats),
        timestamp: Date.now(),
      };
    }

    if (query.includes('计划') || query.includes('安排') || query.includes('schedule')) {
      const days = query.match(/\d+/)?.[0] || '7';
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: AI_ANALYZERS.generatePlan(words, parseInt(days)),
        actions: [
          { label: '应用计划', icon: <Target size={14} />, onClick: () => {} },
        ],
        timestamp: Date.now(),
      };
    }

    if (query.includes('薄弱') || query.includes('困难') || query.includes('忘记')) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: AI_ANALYZERS.analyzeWeakPoints(words),
        actions: [
          { label: '针对复习', icon: <RefreshCw size={14} />, onClick: () => {} },
        ],
        timestamp: Date.now(),
      };
    }

    if (query.includes('技巧') || query.includes('方法') || query.includes('建议')) {
      const tips = AI_ANALYZERS.getLearningTips();
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: tips.join('\n\n'),
        timestamp: Date.now(),
      };
    }

    if (query.includes('推荐') || query.includes('内容') || query.includes('词库')) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: AI_ANALYZERS.recommendContent(words),
        timestamp: Date.now(),
      };
    }

    if (query.includes('原理') || query.includes('科学') || query.includes('为什么')) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: AI_ANALYZERS.explainMemory(),
        timestamp: Date.now(),
      };
    }

    // Default response
    const defaultResponses = [
      "我理解你的问题。让我分析一下你的学习数据...\n\n根据你的进度，我建议你每天坚持复习 20-30 张卡片，保持记忆活跃。",
      "好的问题！我观察到你的学习曲线很健康。继续保持现在的节奏，数据会越来越好看 📈",
      "这是一个很好的学习策略思考。我建议你将复习分散到一天的不同时段，效果会比集中复习好 30%。",
    ];

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      timestamp: Date.now(),
    };
  }, [words, stats]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateResponse(userMessage.content);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('AI response error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setInput(action);
    await new Promise(r => setTimeout(r, 50));
    handleSend();
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
          isOpen
            ? 'bg-muted text-muted-foreground rotate-90'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:shadow-2xl hover:scale-110'
        }`}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <ChevronDown size={24} />
        ) : (
          <Bot size={24} className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
            />
          </Bot>
        )}
      </motion.button>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-36 right-6 z-40 w-[380px] h-[520px] max-w-[calc(100vw-48px)]"
          >
            <Card className="h-full flex flex-col shadow-2xl border-2 border-border/50 overflow-hidden">
              {/* Header */}
              <CardHeader className="pb-3 border-b bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <CardTitle className="text-base">忆闪 AI 助手</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronUp size={16} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">基于你的学习数据，提供个性化建议</p>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.length === 0 && (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto">
                      <Bot size={32} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">你好！我是你的 AI 学习助手</p>
                      <p className="text-xs text-muted-foreground">我可以帮你分析学习状态、生成计划、找出薄弱点</p>
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Actions */}
                      {msg.actions && msg.role === 'assistant' && (
                        <div className="flex gap-2 mt-2">
                          {msg.actions.map((action, i) => (
                            <Button
                              key={i}
                              size="sm"
                              variant="outline"
                              onClick={action.onClick}
                              className="text-xs h-7"
                            >
                              {action.icon}
                              <span className="ml-1">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Quick copy */}
                      {msg.role === 'assistant' && (
                        <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(msg.content)}
                            className="h-6 w-6 p-0 text-muted-foreground"
                          >
                            <Copy size={12} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                          className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                          className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Quick Actions */}
              {messages.length === 0 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-muted-foreground mb-2">快捷提问</p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action}
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction(action)}
                        className="text-xs h-7"
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t bg-background/50">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="问我任何关于学习的问题..."
                    className="flex-1 resize-none bg-muted/50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 min-h-[40px] max-h-[80px]"
                    rows={1}
                  />
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="self-end h-10 w-10 p-0"
                  >
                    {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIStudyAssistant;
