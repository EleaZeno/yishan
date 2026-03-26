import React, { useState, useEffect } from 'react';
import { db } from '../services/storage';
import { Trophy, Zap, BookOpen, Brain, Target, Flame } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  condition: (stats: any) => boolean;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      const allWords = await db.getAllWordsForStats();
      const total = allWords.length;
      const mastered = allWords.filter(w => (w.halflife || 0) > 20160).length;
      const learning = allWords.filter(w => (w.halflife || 0) > 2880 && (w.halflife || 0) <= 20160).length;
      const avgExposure = Math.round(allWords.reduce((sum, w) => sum + (w.totalExposure || 0), 0) / total);

      const currentStats = { total, mastered, learning, avgExposure };
      setStats(currentStats);

      const achievementsList: Achievement[] = [
        {
          id: 'first-word',
          name: '初学者',
          description: '添加第一个词汇',
          icon: React.createElement(BookOpen, { size: 24 }),
          condition: (s) => s.total >= 1,
          unlocked: total >= 1,
          rarity: 'common',
        },
        {
          id: 'ten-words',
          name: '学徒',
          description: '积累 10 个词汇',
          icon: React.createElement(Brain, { size: 24 }),
          condition: (s) => s.total >= 10,
          unlocked: total >= 10,
          rarity: 'common',
        },
        {
          id: 'hundred-words',
          name: '学者',
          description: '积累 100 个词汇',
          icon: React.createElement(Target, { size: 24 }),
          condition: (s) => s.total >= 100,
          unlocked: total >= 100,
          rarity: 'rare',
        },
        {
          id: 'thousand-words',
          name: '大师',
          description: '积累 1000 个词汇',
          icon: React.createElement(Trophy, { size: 24 }),
          condition: (s) => s.total >= 1000,
          unlocked: total >= 1000,
          rarity: 'epic',
        },
        {
          id: 'first-mastered',
          name: '掌握者',
          description: '掌握第一个词汇',
          icon: React.createElement(Zap, { size: 24 }),
          condition: (s) => s.mastered >= 1,
          unlocked: mastered >= 1,
          rarity: 'common',
        },
        {
          id: 'fifty-mastered',
          name: '记忆大师',
          description: '掌握 50 个词汇',
          icon: React.createElement(Flame, { size: 24 }),
          condition: (s) => s.mastered >= 50,
          unlocked: mastered >= 50,
          rarity: 'epic',
        },
        {
          id: 'consistent-learner',
          name: '坚持者',
          description: '平均复习 5 次以上',
          icon: React.createElement(Flame, { size: 24 }),
          condition: (s) => s.avgExposure >= 5,
          unlocked: avgExposure >= 5,
          rarity: 'rare',
        },
        {
          id: 'balanced-learner',
          name: '平衡者',
          description: '掌握率达到 50%',
          icon: React.createElement(Target, { size: 24 }),
          condition: (s) => s.total > 0 && (s.mastered / s.total) >= 0.5,
          unlocked: total > 0 && (mastered / total) >= 0.5,
          rarity: 'epic',
        },
        {
          id: 'legendary-learner',
          name: '传奇学者',
          description: '掌握率达到 90%',
          icon: React.createElement(Trophy, { size: 24 }),
          condition: (s) => s.total > 0 && (s.mastered / s.total) >= 0.9,
          unlocked: total > 0 && (mastered / total) >= 0.9,
          rarity: 'legendary',
        },
      ];

      setAchievements(achievementsList);
    };

    loadAchievements();
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const rarityColors = {
    common: 'bg-slate-100 text-slate-700 border-slate-300',
    rare: 'bg-blue-100 text-blue-700 border-blue-300',
    epic: 'bg-purple-100 text-purple-700 border-purple-300',
    legendary: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  };

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '🏆 成就徽章'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, `已解锁 ${unlockedCount}/${totalCount} 个成就`),
    ]),

    // Progress Bar
    React.createElement('div', { key: 'progress', className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
      React.createElement('div', { key: 'bar', className: 'w-full h-4 bg-slate-200 rounded-full overflow-hidden' }, [
        React.createElement('div', { key: 'fill', className: 'h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all', style: { width: (unlockedCount / totalCount * 100) + '%' } }),
      ]),
      React.createElement('p', { key: 'text', className: 'text-sm font-bold mt-2' }, `${Math.round(unlockedCount / totalCount * 100)}% 完成度`),
    ]),

    // Achievements Grid
    React.createElement('div', { key: 'grid', className: 'grid grid-cols-2 md:grid-cols-3 gap-3' },
      achievements.map((achievement, i) =>
        React.createElement('div', {
          key: i,
          className: `rounded-2xl p-4 border-2 transition-all ${
            achievement.unlocked
              ? rarityColors[achievement.rarity]
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`
        }, [
          React.createElement('div', { key: 'icon', className: 'text-center mb-2' }, achievement.icon),
          React.createElement('p', { key: 'name', className: 'font-bold text-sm text-center' }, achievement.name),
          React.createElement('p', { key: 'desc', className: 'text-xs text-center opacity-75 mt-1' }, achievement.description),
          achievement.unlocked && React.createElement('p', { key: 'date', className: 'text-xs text-center mt-2 opacity-50' }, 
            achievement.unlockedAt?.toLocaleDateString() || '已解锁'
          ),
        ])
      )
    ),

    // Stats
    stats && React.createElement('div', { key: 'stats', className: 'bg-white rounded-2xl p-4 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3' }, [
      React.createElement('div', { key: 's1', className: 'text-center' }, [
        React.createElement('p', { key: 'v', className: 'text-2xl font-black' }, stats.total),
        React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground' }, '总词数'),
      ]),
      React.createElement('div', { key: 's2', className: 'text-center' }, [
        React.createElement('p', { key: 'v', className: 'text-2xl font-black text-emerald-600' }, stats.mastered),
        React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground' }, '已掌握'),
      ]),
      React.createElement('div', { key: 's3', className: 'text-center' }, [
        React.createElement('p', { key: 'v', className: 'text-2xl font-black text-amber-600' }, stats.learning),
        React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground' }, '学习中'),
      ]),
      React.createElement('div', { key: 's4', className: 'text-center' }, [
        React.createElement('p', { key: 'v', className: 'text-2xl font-black text-indigo-600' }, stats.avgExposure),
        React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground' }, '平均复习'),
      ]),
    ]),
  ]);
}
