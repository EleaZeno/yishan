import React, { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Target, Crown, Zap, Award, Medal, Gem, Lock, CheckCircle } from 'lucide-react';
import { db } from '../services/storage';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  progress: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

const rarityColors = {
  common: {
    bg: 'from-slate-100 to-slate-200',
    border: 'border-slate-300',
    text: 'text-slate-600',
    glow: '',
    badge: 'bg-slate-200 text-slate-600',
  },
  rare: {
    bg: 'from-blue-100 to-blue-200',
    border: 'border-blue-300',
    text: 'text-blue-600',
    glow: 'shadow-blue-200/50',
    badge: 'bg-blue-200 text-blue-700',
  },
  epic: {
    bg: 'from-purple-100 to-purple-200',
    border: 'border-purple-300',
    text: 'text-purple-600',
    glow: 'shadow-purple-300/50',
    badge: 'bg-purple-200 text-purple-700',
  },
  legendary: {
    bg: 'from-amber-100 via-orange-100 to-yellow-100',
    border: 'border-amber-400',
    text: 'text-amber-700',
    glow: 'shadow-amber-400/50 shadow-lg',
    badge: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
  },
};

export default function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-word',
      name: '初学者',
      description: '添加第一个词汇',
      icon: React.createElement(Star, { size: 28 }),
      requirement: 1,
      progress: 0,
      unlocked: false,
      rarity: 'common',
    },
    {
      id: 'vocabulary-10',
      name: '学徒',
      description: '积累 10 个词汇',
      icon: React.createElement(BookOpen, { size: 28 }),
      requirement: 10,
      progress: 0,
      unlocked: false,
      rarity: 'common',
    },
    {
      id: 'vocabulary-100',
      name: '学者',
      description: '积累 100 个词汇',
      icon: React.createElement(Award, { size: 28 }),
      requirement: 100,
      progress: 0,
      unlocked: false,
      rarity: 'rare',
    },
    {
      id: 'vocabulary-1000',
      name: '大师',
      description: '积累 1000 个词汇',
      icon: React.createElement(Crown, { size: 28 }),
      requirement: 1000,
      progress: 0,
      unlocked: false,
      rarity: 'epic',
    },
    {
      id: 'first-mastered',
      name: '掌握者',
      description: '掌握第一个词汇',
      icon: React.createElement(Target, { size: 28 }),
      requirement: 1,
      progress: 0,
      unlocked: false,
      rarity: 'common',
    },
    {
      id: 'mastered-50',
      name: '记忆大师',
      description: '掌握 50 个词汇',
      icon: React.createElement(Trophy, { size: 28 }),
      requirement: 50,
      progress: 0,
      unlocked: false,
      rarity: 'epic',
    },
    {
      id: 'avg-reviews-5',
      name: '坚持者',
      description: '平均复习 5 次以上',
      icon: React.createElement(Flame, { size: 28 }),
      requirement: 5,
      progress: 0,
      unlocked: false,
      rarity: 'rare',
    },
    {
      id: 'mastery-50-percent',
      name: '平衡者',
      description: '掌握率达到 50%',
      icon: React.createElement(Medal, { size: 28 }),
      requirement: 50,
      progress: 0,
      unlocked: false,
      rarity: 'epic',
    },
    {
      id: 'mastery-90-percent',
      name: '传奇学者',
      description: '掌握率达到 90%',
      icon: React.createElement(Gem, { size: 28 }),
      requirement: 90,
      progress: 0,
      unlocked: false,
      rarity: 'legendary',
    },
  ]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const words = await db.getAllWordsForStats();
      const totalWords = words.length;
      const masteredWords = words.filter(w => (w.halflife || 0) > 20160).length;
      const avgReviews = words.length > 0 
        ? words.reduce((sum, w) => sum + (w.totalExposure || 0), 0) / words.length 
        : 0;
      const masteryRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

      setAchievements(prev => prev.map(a => {
        let progress = 0;
        switch (a.id) {
          case 'first-word':
          case 'vocabulary-10':
          case 'vocabulary-100':
          case 'vocabulary-1000':
            progress = totalWords;
            break;
          case 'first-mastered':
          case 'mastered-50':
            progress = masteredWords;
            break;
          case 'avg-reviews-5':
            progress = Math.round(avgReviews);
            break;
          case 'mastery-50-percent':
          case 'mastery-90-percent':
            progress = masteryRate;
            break;
        }
        
        return {
          ...a,
          progress: Math.min(progress, a.requirement),
          unlocked: progress >= a.requirement,
        };
      }));
    } catch (e) {
      console.error('Load achievements error:', e);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const BookOpen = ({ size }: { size: number }) => React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }, [
    React.createElement('path', { key: 'p1', d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
    React.createElement('path', { key: 'p2', d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' }),
  ]);

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '🏆 成就徽章'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, '记录你的学习里程碑'),
    ]),

    // Progress Overview
    React.createElement('div', {
      key: 'overview',
      className: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl'
    }, [
      React.createElement('div', { key: 'top', className: 'flex items-center justify-between mb-4' }, [
        React.createElement('div', { key: 'left' }, [
          React.createElement('p', { key: 'label', className: 'text-white/80 text-sm font-bold uppercase tracking-widest' }, '已解锁成就'),
          React.createElement('p', { key: 'value', className: 'text-4xl font-black mt-1' }, `${unlockedCount} / ${totalCount}`),
        ]),
        React.createElement('div', {
          key: 'icon',
          className: 'w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg'
        }, React.createElement(Trophy, { size: 32, className: 'text-white' })),
      ]),
      
      React.createElement('div', { key: 'bar', className: 'bg-white/20 rounded-full h-3 overflow-hidden' }, [
        React.createElement('div', {
          key: 'fill',
          className: 'bg-white h-full rounded-full transition-all duration-500',
          style: { width: `${(unlockedCount / totalCount) * 100}%` }
        }),
      ]),
      
      React.createElement('p', { key: 'hint', className: 'text-white/70 text-sm mt-3 text-center' }, 
        `继续努力，还剩 ${totalCount - unlockedCount} 个成就等待解锁！`
      ),
    ]),

    // Achievements Grid
    React.createElement('div', { key: 'grid', className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
      achievements.map((achievement, i) =>
        React.createElement('div', {
          key: i,
          className: `relative overflow-hidden rounded-2xl bg-gradient-to-br ${rarityColors[achievement.rarity].bg} border-2 ${rarityColors[achievement.rarity].border} ${rarityColors[achievement.rarity].glow} transition-all duration-300 ${achievement.unlocked ? '' : 'opacity-60 grayscale'}`,
        }, [
          // Badge
          React.createElement('div', {
            key: 'badge',
            className: `absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold ${rarityColors[achievement.rarity].badge}`
          }, achievement.rarity === 'common' ? '普通' : achievement.rarity === 'rare' ? '稀有' : achievement.rarity === 'epic' ? '史诗' : '传奇'),

          // Content
          React.createElement('div', { key: 'content', className: 'p-5' }, [
            // Icon & Title
            React.createElement('div', { key: 'header', className: 'flex items-start gap-3 mb-3' }, [
              React.createElement('div', {
                key: 'icon',
                className: `w-14 h-14 rounded-2xl flex items-center justify-center ${achievement.unlocked ? 'bg-white/80' : 'bg-white/40'} shadow-inner`
              }, achievement.unlocked ? achievement.icon : React.createElement(Lock, { size: 28, className: 'text-slate-400' })),
              
              React.createElement('div', { key: 'info', className: 'flex-1' }, [
                React.createElement('p', {
                  key: 'name',
                  className: `font-black text-lg ${achievement.unlocked ? 'text-slate-800' : 'text-slate-500'}`
                }, achievement.name),
                React.createElement('p', { key: 'desc', className: 'text-sm text-slate-600 mt-0.5' }, achievement.description),
              ]),
            ]),

            // Progress
            React.createElement('div', { key: 'progress', className: 'mt-3' }, [
              React.createElement('div', { key: 'bar', className: 'bg-white/50 rounded-full h-2 overflow-hidden' }, [
                React.createElement('div', {
                  key: 'fill',
                  className: `h-full rounded-full transition-all duration-500 ${achievement.unlocked ? 'bg-emerald-500' : 'bg-slate-400'}`,
                  style: { width: `${Math.min((achievement.progress / achievement.requirement) * 100, 100)}%` }
                }),
              ]),
              React.createElement('div', { key: 'text', className: 'flex justify-between mt-2 text-xs font-bold' }, [
                React.createElement('span', { key: 'prog', className: 'text-slate-600' }, `${achievement.progress} / ${achievement.requirement}`),
                achievement.unlocked && React.createElement('span', { key: 'check', className: 'text-emerald-600 flex items-center gap-1' }, [
                  React.createElement(CheckCircle, { key: 'icon', size: 14 }),
                  '已解锁',
                ]),
              ]),
            ]),
          ]),

          // Glow effect for legendary
          achievement.unlocked && achievement.rarity === 'legendary' && React.createElement('div', {
            key: 'glow',
            className: 'absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/20 to-amber-400/0 animate-pulse'
          }),
        ])
      )
    ),
  ]);
}
