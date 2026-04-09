import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Brain, Target, Flame, Award, CheckCircle2, X, Sparkles } from 'lucide-react';

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

interface FeedbackSystemProps {
  onDismiss?: () => void;
}

// All possible achievements
const ACHIEVEMENT_TEMPLATES: Achievement[] = [
  { id: 'first_word', type: 'milestone', title: '初学乍练', description: '添加第一个单词', icon: <Star size={24} />, maxProgress: 1 },
  { id: 'streak_7', type: 'streak', title: '七日坚持', description: '连续学习7天', icon: <Flame size={24} />, maxProgress: 7 },
  { id: 'streak_30', type: 'streak', title: '月度达人', description: '连续学习30天', icon: <Trophy size={24} />, maxProgress: 30 },
  { id: 'master_100', type: 'mastery', title: '百词斩', description: '掌握100个单词', icon: <Brain size={24} />, maxProgress: 100 },
  { id: 'master_500', type: 'mastery', title: '词汇大师', description: '掌握500个单词', icon: <Award size={24} />, maxProgress: 500 },
  { id: 'perfect_session', type: 'session', title: '完美表现', description: '一次复习全对', icon: <Target size={24} />, maxProgress: 1 },
  { id: 'quick_learner', type: 'speed', title: '极速学习', description: '10分钟内完成50张卡片', icon: <Zap size={24} />, maxProgress: 1 },
  { id: 'formula_master', type: 'type', title: '公式达人', description: '掌握50个公式', icon: <Sparkles size={24} />, maxProgress: 50 },
];

// Feedback toast component
interface FeedbackToastProps {
  message: string;
  type: 'success' | 'warning' | 'info' | 'achievement';
  achievement?: Achievement;
  onClose: () => void;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({ message, type, achievement, onClose }) => {
  const bgColors = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    achievement: 'bg-gradient-to-r from-purple-500 to-pink-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${bgColors[type]} text-white px-6 py-4 rounded-2xl shadow-xl max-w-sm`}
    >
      <div className="flex items-start gap-3">
        {achievement && (
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            {achievement.icon}
          </div>
        )}
        <div className="flex-1">
          {achievement && (
            <p className="font-bold text-sm mb-1">🏆 成就解锁！</p>
          )}
          <p className="text-sm">{message}</p>
          {achievement && (
            <p className="text-xs opacity-80 mt-1">{achievement.title}</p>
          )}
        </div>
        <button onClick={onClose} className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// Main feedback system
const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ onDismiss }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  useEffect(() => {
    // Load achievements from localStorage
    const saved = localStorage.getItem('yishan_achievements');
    if (saved) {
      try {
        setUnlockedAchievements(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }
    }
  }, []);

  const checkAchievement = (type: string, progress: number) => {
    const template = ACHIEVEMENT_TEMPLATES.find(a => a.id === type || a.type === type);
    if (!template) return null;

    const existing = unlockedAchievements.find(a => a.id === template.id);
    if (existing) return null; // Already unlocked

    if (progress >= (template.maxProgress || 1)) {
      const newAchievement = {
        ...template,
        unlockedAt: Date.now(),
        progress: template.maxProgress
      };
      
      const updated = [...unlockedAchievements, newAchievement];
      setUnlockedAchievements(updated);
      setRecentUnlock(newAchievement);
      localStorage.setItem('yishan_achievements', JSON.stringify(updated));
      
      return newAchievement;
    }
    
    return null;
  };

  // Get achievement progress
  const getProgress = (achievementId: string): number => {
    const achievement = unlockedAchievements.find(a => a.id === achievementId);
    return achievement?.progress || 0;
  };

  return (
    <div className="space-y-4">
      {/* Recent Unlock Toast */}
      <AnimatePresence>
        {recentUnlock && (
          <FeedbackToast
            message={recentUnlock.description}
            type="achievement"
            achievement={recentUnlock}
            onClose={() => setRecentUnlock(null)}
          />
        )}
      </AnimatePresence>

      {/* Achievement Gallery */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <h3 className="font-bold text-foreground">成就墙</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {unlockedAchievements.length} / {ACHIEVEMENT_TEMPLATES.length}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENT_TEMPLATES.map(template => {
            const unlocked = unlockedAchievements.find(a => a.id === template.id);
            const progress = getProgress(template.id);
            const isUnlocked = !!unlocked;

            return (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.05 }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 border ${
                  isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-muted/50 border-border text-muted-foreground opacity-50'
                }`}
                title={isUnlocked ? `${template.title}: ${template.description}` : '???'}
              >
                <div className={`${isUnlocked ? '' : 'grayscale'}`}>
                  {template.icon}
                </div>
                <span className="text-[8px] font-bold mt-1 text-center truncate w-full">
                  {isUnlocked ? template.title : '???'}
                </span>
                {!isUnlocked && template.maxProgress && template.maxProgress > 1 && (
                  <span className="text-[8px] opacity-60">
                    {progress}/{template.maxProgress}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <h4 className="text-sm font-bold text-foreground mb-3">最近解锁</h4>
          <div className="space-y-2">
            {unlockedAchievements
              .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
              .slice(0, 5)
              .map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                >
                  <div className="text-amber-400">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(achievement.unlockedAt || 0).toLocaleDateString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { ACHIEVEMENT_TEMPLATES };
export default FeedbackSystem;
