import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, Brain, Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface UserProfile {
  id: string;
  preferredTimeSlots: string[];
  avgEfficiencyByHour: Record<number, number>;
  fatigueThreshold: number;
  dailyGoal: number;
  createdAt: number;
  updatedAt: number;
}

interface UserProfilerProps {
  words: any[];
  studyHistory: any[];
  onProfileUpdate?: (profile: UserProfile) => void;
}

const defaultProfile: UserProfile = {
  id: '',
  preferredTimeSlots: [],
  avgEfficiencyByHour: {},
  fatigueThreshold: 50,
  dailyGoal: 50,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Analyze user's study patterns
function analyzeStudyPatterns(studyHistory: any[]): {
  efficiencyByHour: Record<number, number>;
  bestHours: number[];
  worstHours: number[];
} {
  const hourlyStats: Record<number, { total: number; correct: number }> = {};
  
  studyHistory.forEach(session => {
    const hour = new Date(session.timestamp).getHours();
    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { total: 0, correct: 0 };
    }
    hourlyStats[hour].total += session.total || 1;
    hourlyStats[hour].correct += session.correct || 0;
  });
  
  const efficiencyByHour: Record<number, number> = {};
  const hoursWithStats = Object.keys(hourlyStats).map(Number);
  
  hoursWithStats.forEach(hour => {
    const stats = hourlyStats[hour];
    efficiencyByHour[hour] = stats.total > 0 ? stats.correct / stats.total : 0;
  });
  
  // Sort by efficiency
  const sortedHours = hoursWithStats.sort((a, b) => 
    (efficiencyByHour[b] || 0) - (efficiencyByHour[a] || 0)
  );
  
  const bestHours = sortedHours.slice(0, 3);
  const worstHours = sortedHours.slice(-3).reverse();
  
  return { efficiencyByHour, bestHours, worstHours };
}

// Detect fatigue from recent sessions
function detectFatigue(recentSessions: any[]): number {
  if (recentSessions.length < 3) return 0;
  
  const last3 = recentSessions.slice(-3);
  const avgAccuracy = last3.reduce((sum, s) => 
    sum + (s.correct / Math.max(s.total, 1)), 0
  ) / 3;
  
  const prev3 = recentSessions.slice(-6, -3);
  if (prev3.length < 3) return 0;
  
  const prevAvgAccuracy = prev3.reduce((sum, s) => 
    sum + (s.correct / Math.max(s.total, 1)), 0
  ) / 3;
  
  // Fatigue = decline in accuracy
  const fatigue = Math.max(0, prevAvgAccuracy - avgAccuracy) * 100;
  return Math.round(fatigue);
}

const UserProfiler: React.FC<UserProfilerProps> = ({ words, studyHistory, onProfileUpdate }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [patterns, setPatterns] = useState<{
    efficiencyByHour: Record<number, number>;
    bestHours: number[];
    worstHours: number[];
  }>({ efficiencyByHour: {}, bestHours: [], worstHours: [] });
  const [fatigue, setFatigue] = useState(0);

  useEffect(() => {
    // Load profile from localStorage
    const saved = localStorage.getItem('yishan_user_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
    }
    
    // Analyze patterns
    if (studyHistory.length > 0) {
      const analyzed = analyzeStudyPatterns(studyHistory);
      setPatterns(analyzed);
      setFatigue(detectFatigue(studyHistory));
    }
  }, [studyHistory]);

  const updateDailyGoal = (goal: number) => {
    const updated = { ...profile, dailyGoal: goal, updatedAt: Date.now() };
    setProfile(updated);
    localStorage.setItem('yishan_user_profile', JSON.stringify(updated));
    onProfileUpdate?.(updated);
  };

  // Hour labels
  const hourLabels: Record<number, string> = {
    6: '早6点', 7: '早7点', 8: '早8点', 9: '上午9点', 10: '上午10点', 11: '上午11点',
    12: '中午12点', 13: '下午1点', 14: '下午2点', 15: '下午3点', 16: '下午4点',
    17: '下午5点', 18: '傍晚6点', 19: '晚7点', 20: '晚8点', 21: '晚9点', 22: '晚10点'
  };

  return (
    <div className="space-y-4">
      {/* Daily Goal Setting */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-primary" />
          <h3 className="font-bold text-foreground">每日目标</h3>
        </div>
        <div className="flex gap-2">
          {[20, 30, 50, 80, 100].map(goal => (
            <button
              key={goal}
              onClick={() => updateDailyGoal(goal)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                profile.dailyGoal === goal
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {goal}张
            </button>
          ))}
        </div>
      </div>

      {/* Best Study Hours */}
      {patterns.bestHours.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-green-500" />
            <h3 className="font-bold text-foreground">最佳学习时段</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {patterns.bestHours.map(hour => (
              <div
                key={hour}
                className="px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <span className="text-sm font-medium text-green-400">
                  {hourLabels[hour] || `${hour}点`}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {Math.round((patterns.efficiencyByHour[hour] || 0) * 100)}% 效率
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Fatigue Detection */}
      {fatigue > 20 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-amber-500" />
            <h3 className="font-bold text-amber-400">疲劳预警</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            检测到你的学习效率有所下降，建议休息一下或切换到轻松的复习模式。
          </p>
        </motion.div>
      )}

      {/* Efficiency Chart */}
      {Object.keys(patterns.efficiencyByHour).length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-blue-500" />
            <h3 className="font-bold text-foreground">时段效率分布</h3>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 24 }, (_, i) => {
              const efficiency = patterns.efficiencyByHour[i] || 0;
              const isBest = patterns.bestHours.includes(i);
              const isWorst = patterns.worstHours.includes(i);
              
              return (
                <div
                  key={i}
                  className={`aspect-square rounded flex items-center justify-center text-xs ${
                    isBest ? 'bg-green-500/20 text-green-400' :
                    isWorst ? 'bg-red-500/10 text-red-400' :
                    efficiency > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                  title={`${i}点: ${Math.round(efficiency * 100)}%`}
                >
                  {i}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-green-500/20" /> 最佳
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-red-500/10" /> 待优化
            </span>
          </div>
        </div>
      )}

      {/* Cognitive Load Summary */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={18} className="text-purple-500" />
          <h3 className="font-bold text-foreground">认知状态</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">总词库</p>
            <p className="text-xl font-bold text-foreground">{words.length}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">疲劳度</p>
            <p className={`text-xl font-bold ${
              fatigue > 50 ? 'text-red-500' : fatigue > 20 ? 'text-amber-500' : 'text-green-500'
            }`}>
              {fatigue}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfiler;
