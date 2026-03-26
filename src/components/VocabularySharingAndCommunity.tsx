import React, { useState } from 'react';
import { Share2, Download, Heart, MessageCircle, Star, TrendingUp } from 'lucide-react';

interface VocabularySet {
  id: string;
  name: string;
  description: string;
  author: string;
  words: number;
  downloads: number;
  rating: number;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function VocabularySharingAndCommunity() {
  const [vocabSets, setVocabSets] = useState<VocabularySet[]>([
    {
      id: '1',
      name: '高考英语核心词汇',
      description: '高考必考的 3500 个核心词汇',
      author: '学习大师',
      words: 3500,
      downloads: 12450,
      rating: 4.8,
      tags: ['高考', '英语', '核心词汇'],
      difficulty: 'hard',
    },
    {
      id: '2',
      name: '日常英语 1000 词',
      description: '日常生活中最常用的 1000 个英文单词',
      author: '英语爱好者',
      words: 1000,
      downloads: 8920,
      rating: 4.6,
      tags: ['日常', '英语', '初级'],
      difficulty: 'easy',
    },
    {
      id: '3',
      name: 'TOEFL 词汇精选',
      description: 'TOEFL 考试必备词汇 2000+',
      author: '考试专家',
      words: 2100,
      downloads: 5670,
      rating: 4.9,
      tags: ['TOEFL', '考试', '高级'],
      difficulty: 'hard',
    },
  ]);

  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null);
  const [userRating, setUserRating] = useState(0);

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  };

  const difficultyLabels = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };

  const downloadVocabSet = (set: VocabularySet) => {
    alert(`已下载 "${set.name}" 词库！`);
  };

  const submitRating = (set: VocabularySet) => {
    alert(`感谢评分！你给了 ${userRating} 星`);
    setUserRating(0);
  };

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '📚 词库分享'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, '发现和分享优质词库'),
    ]),

    // Featured Sets
    React.createElement('div', { key: 'featured', className: 'bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white' }, [
      React.createElement('p', { key: 't', className: 'text-lg font-black mb-2' }, '⭐ 本周热门'),
      React.createElement('p', { key: 'd', className: 'text-sm opacity-90' }, '高考英语核心词汇 - 12,450 次下载'),
    ]),

    // Vocabulary Sets
    React.createElement('div', { key: 'sets', className: 'space-y-3' },
      vocabSets.map((set, i) =>
        React.createElement('div', { key: i, className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
          React.createElement('div', { key: 'header', className: 'flex items-start justify-between mb-2' }, [
            React.createElement('div', { key: 'info', className: 'flex-1' }, [
              React.createElement('p', { key: 'name', className: 'font-bold text-lg' }, set.name),
              React.createElement('p', { key: 'author', className: 'text-xs text-muted-foreground' }, `作者: ${set.author}`),
            ]),
            React.createElement('span', { key: 'diff', className: `text-xs px-2 py-1 rounded-lg font-bold ${difficultyColors[set.difficulty]}` }, 
              difficultyLabels[set.difficulty]
            ),
          ]),
          React.createElement('p', { key: 'desc', className: 'text-sm text-muted-foreground mb-3' }, set.description),
          React.createElement('div', { key: 'stats', className: 'flex gap-4 text-sm mb-3' }, [
            React.createElement('span', { key: 'words', className: 'flex items-center gap-1' }, [
              React.createElement('span', { key: 'i' }, '📚'),
              `${set.words} 词`,
            ]),
            React.createElement('span', { key: 'downloads', className: 'flex items-center gap-1' }, [
              React.createElement('span', { key: 'i' }, '⬇️'),
              `${set.downloads} 次`,
            ]),
            React.createElement('span', { key: 'rating', className: 'flex items-center gap-1 text-amber-600' }, [
              React.createElement('span', { key: 'i' }, '⭐'),
              `${set.rating}`,
            ]),
          ]),
          React.createElement('div', { key: 'tags', className: 'flex gap-2 mb-3' },
            set.tags.map((tag, j) =>
              React.createElement('span', { key: j, className: 'text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-700' }, tag)
            )
          ),
          React.createElement('div', { key: 'actions', className: 'flex gap-2' }, [
            React.createElement('button', {
              key: 'download',
              onClick: () => downloadVocabSet(set),
              className: 'flex-1 bg-indigo-500 text-white rounded-lg py-2 font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1'
            }, [React.createElement(Download, { key: 'i', size: 16 }), '下载']),
            React.createElement('button', {
              key: 'like',
              className: 'flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1'
            }, [React.createElement(Heart, { key: 'i', size: 16 }), '收藏']),
            React.createElement('button', {
              key: 'comment',
              onClick: () => setSelectedSet(set),
              className: 'flex-1 bg-slate-100 text-slate-700 rounded-lg py-2 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1'
            }, [React.createElement(MessageCircle, { key: 'i', size: 16 }), '评价']),
          ]),
        ])
      )
    ),

    // Rating Modal
    selectedSet && React.createElement('div', { key: 'modal', className: 'fixed inset-0 bg-black/50 flex items-center justify-center z-50' }, [
      React.createElement('div', { key: 'content', className: 'bg-white rounded-2xl p-6 max-w-md w-full mx-4' }, [
        React.createElement('p', { key: 't', className: 'text-lg font-black mb-4' }, `评价 "${selectedSet.name}"`),
        React.createElement('div', { key: 'stars', className: 'flex gap-2 mb-4 justify-center' }, [
          ...Array(5).fill(0).map((_, i) =>
            React.createElement('button', {
              key: i,
              onClick: () => setUserRating(i + 1),
              className: `text-3xl transition-transform ${userRating > i ? 'text-amber-400 scale-110' : 'text-slate-300'}`
            }, '⭐')
          )
        ]),
        React.createElement('textarea', {
          key: 'comment',
          placeholder: '分享你的评价...',
          className: 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24 mb-4'
        }),
        React.createElement('div', { key: 'buttons', className: 'flex gap-2' }, [
          React.createElement('button', {
            key: 'submit',
            onClick: () => submitRating(selectedSet),
            className: 'flex-1 bg-indigo-500 text-white rounded-lg py-2 font-bold hover:bg-indigo-600'
          }, '提交'),
          React.createElement('button', {
            key: 'close',
            onClick: () => setSelectedSet(null),
            className: 'flex-1 bg-slate-200 text-slate-700 rounded-lg py-2 font-bold hover:bg-slate-300'
          }, '关闭'),
        ]),
      ]),
    ]),

    // Community Recommendations
    React.createElement('div', { key: 'community', className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
      React.createElement('p', { key: 't', className: 'font-bold text-lg mb-3 flex items-center gap-2' }, [
        React.createElement(TrendingUp, { key: 'i', size: 20 }),
        '社区推荐',
      ]),
      React.createElement('div', { key: 'list', className: 'space-y-2' }, [
        React.createElement('div', { key: '1', className: 'p-3 bg-slate-50 rounded-lg' }, [
          React.createElement('p', { key: 'title', className: 'font-bold' }, '🔥 本周最热'),
          React.createElement('p', { key: 'desc', className: 'text-sm text-muted-foreground' }, '高考英语核心词汇 - 1,234 人下载'),
        ]),
        React.createElement('div', { key: '2', className: 'p-3 bg-slate-50 rounded-lg' }, [
          React.createElement('p', { key: 'title', className: 'font-bold' }, '⭐ 最高评分'),
          React.createElement('p', { key: 'desc', className: 'text-sm text-muted-foreground' }, 'TOEFL 词汇精选 - 4.9 星'),
        ]),
        React.createElement('div', { key: '3', className: 'p-3 bg-slate-50 rounded-lg' }, [
          React.createElement('p', { key: 'title', className: 'font-bold' }, '🆕 最新发布'),
          React.createElement('p', { key: 'desc', className: 'text-sm text-muted-foreground' }, '商务英语 500 词 - 刚发布'),
        ]),
      ]),
    ]),
  ]);
}
