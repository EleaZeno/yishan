import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Word, ContentType } from '../types';
import { predictRecallProbability, calculateStability, calculateMemoryLoad, recommendSessionSize } from '../lib/algorithm';
import { CONTENT_TYPE_LABELS } from '../types';

interface MemoryDashboardProps {
  words: Word[];
  onStudyClick?: () => void;
}

const MemoryDashboard: React.FC<MemoryDashboardProps> = ({ words, onStudyClick }) => {
  const now = Date.now();
  const activeWords = words.filter(w => !w.deletedAt);
  
  // Calculate stats
  const dueWords = activeWords.filter(w => w.dueDate && w.dueDate <= now);
  const todayStudied = activeWords.filter(w => w.lastSeen && now - w.lastSeen < 86400000);
  
  // Average retention
  const avgRetention = activeWords.length > 0
    ? activeWords.reduce((sum, w) => sum + predictRecallProbability(w, now), 0) / activeWords.length
    : 0;
  
  // Memory load
  const memoryLoad = calculateMemoryLoad(activeWords);
  const recommendedSize = recommendSessionSize(activeWords);
  
  // Content type distribution
  const typeDistribution: Record<ContentType, number> = {
    word: 0, formula: 0, knowledge: 0, mistake: 0, definition: 0
  };
  activeWords.forEach(w => {
    const type = w.contentType || 'word';
    typeDistribution[type]++;
  });
  
  // Weak points (low stability or low retention)
  const weakWords = activeWords
    .map(w => ({ word: w, retention: predictRecallProbability(w, now), stability: calculateStability(w) }))
    .filter(item => item.retention < 0.6 || item.stability < 30)
    .sort((a, b) => a.retention - b.retention)
    .slice(0, 5);
  
  // 7-day retention curve
  const retentionCurve = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = now - i * 86400000;
    const dayEnd = dayStart + 86400000;
    // Words that were due on that day
    const wordsDueThatDay = activeWords.filter(w => w.lastSeen && w.lastSeen >= dayStart && w.lastSeen < dayEnd);
    retentionCurve.push({
      day: i,
      count: wordsDueThatDay.length,
      label: i === 0 ? '今天' : i === 1 ? '昨天' : `${i}天前`
    });
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Due Today */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/20"
        >
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Clock size={18} />
            <span className="text-sm font-medium">待复习</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{dueWords.length}</div>
          <div className="text-xs text-muted-foreground mt-1">今日到期</div>
        </motion.div>

        {/* Today Studied */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/20"
        >
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">已复习</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{todayStudied.length}</div>
          <div className="text-xs text-muted-foreground mt-1">今日完成</div>
        </motion.div>

        {/* Average Retention */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/20"
        >
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Brain size={18} />
            <span className="text-sm font-medium">记忆留存</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{Math.round(avgRetention * 100)}%</div>
          <div className="text-xs text-muted-foreground mt-1">平均概率</div>
        </motion.div>

        {/* Memory Load */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Target size={18} />
            <span className="text-sm font-medium">认知负荷</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{memoryLoad}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {memoryLoad < 30 ? '轻松' : memoryLoad < 60 ? '适中' : '较高'}
          </div>
        </motion.div>
      </div>

      {/* Content Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl p-4 border border-border"
      >
        <h3 className="text-sm font-medium text-foreground mb-3">内容类型分布</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(typeDistribution) as ContentType[]).map((type) => {
            const count = typeDistribution[type];
            const labels = CONTENT_TYPE_LABELS[type];
            const percentage = activeWords.length > 0 ? (count / activeWords.length) * 100 : 0;
            
            if (count === 0) return null;
            
            const colorClasses: Record<ContentType, string> = {
              word: 'bg-blue-500',
              formula: 'bg-purple-500',
              knowledge: 'bg-green-500',
              mistake: 'bg-red-500',
              definition: 'bg-amber-500'
            };
            
            return (
              <div 
                key={type}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg"
              >
                <div className={`w-2 h-2 rounded-full ${colorClasses[type]}`} />
                <span className="text-sm text-foreground">{labels.zh}</span>
                <span className="text-xs text-muted-foreground">{count} ({Math.round(percentage)}%)</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 7-Day Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl p-4 border border-border"
      >
        <h3 className="text-sm font-medium text-foreground mb-3">7日复习趋势</h3>
        <div className="flex items-end gap-1 h-20">
          {retentionCurve.map((day, i) => {
            const maxCount = Math.max(...retentionCurve.map(d => d.count), 1);
            const height = (day.count / maxCount) * 100;
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-primary/60 rounded-t transition-all hover:bg-primary"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className="text-xs text-muted-foreground">{day.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Weak Points */}
      {weakWords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl p-4 border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-red-400" />
            <h3 className="text-sm font-medium text-foreground">薄弱知识点</h3>
          </div>
          <div className="space-y-2">
            {weakWords.map((item, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground truncate max-w-[150px]">
                    {item.word.term}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {CONTENT_TYPE_LABELS[item.word.contentType || 'word'].zh}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-red-400">
                    {Math.round(item.retention * 100)}% 留存
                  </span>
                  <span className="text-xs text-amber-400">
                    稳定度 {item.stability}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Study Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <TrendingUp size={18} />
              <span className="font-medium">学习建议</span>
            </div>
            <p className="text-sm text-muted-foreground">
              建议每次复习 <strong className="text-foreground">{recommendedSize}</strong> 张卡片
              {memoryLoad > 60 && '，认知负荷较高，建议分多次完成'}
            </p>
          </div>
          {onStudyClick && dueWords.length > 0 && (
            <button
              onClick={onStudyClick}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              开始复习
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MemoryDashboard;
