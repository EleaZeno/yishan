import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';

interface StudyRecord {
  id: string;
  date: Date;
  duration: number; // minutes
  wordsStudied: number;
  wordsReviewed: number;
  accuracy: number; // 0-100
  type: 'study' | 'review' | 'test';
}

export default function LearningHistoryTracker() {
  const [records, setRecords] = useState<StudyRecord[]>(() => {
    const saved = localStorage.getItem('studyRecords');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
  });

  const [filterType, setFilterType] = useState<'all' | 'study' | 'review' | 'test'>('all');
  const [filterDays, setFilterDays] = useState(30);

  useEffect(() => {
    localStorage.setItem('studyRecords', JSON.stringify(records));
  }, [records]);

  const filteredRecords = records
    .filter(r => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      const daysAgo = (Date.now() - r.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= filterDays;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const stats = {
    totalSessions: filteredRecords.length,
    totalMinutes: filteredRecords.reduce((sum, r) => sum + r.duration, 0),
    totalWords: filteredRecords.reduce((sum, r) => sum + r.wordsStudied, 0),
    avgAccuracy: filteredRecords.length > 0 
      ? Math.round(filteredRecords.reduce((sum, r) => sum + r.accuracy, 0) / filteredRecords.length)
      : 0,
  };

  const typeColors = {
    study: 'bg-blue-100 text-blue-700',
    review: 'bg-amber-100 text-amber-700',
    test: 'bg-purple-100 text-purple-700',
  };

  const typeLabels = {
    study: '学习',
    review: '复习',
    test: '测试',
  };

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '📚 学习历史'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, '追踪你的学习进度'),
    ]),

    // Stats
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-2 md:grid-cols-4 gap-3' }, [
      React.createElement('div', { key: 's1', className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
        React.createElement('p', { key: 'v', className: 'text-2xl font-black' }, stats.totalSessions),
        React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground mt-1' }, '学习次数'),
      ]),
      React.createElement('div', { key: 's2', className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
        React.createElement('p', { key: 'v', className: 'text-2xl font-black' }, stats.totalMinutes),
        React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground mt-1' }, '学习分钟'),
      ]),
      React.createElement('div', { key: 's3', className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
        React.createElement('p', { key: 'v', className: 'text-2xl font-black' }, stats.totalWords),
        React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground mt-1' }, '学习词数'),
      ]),
      React.createElement('div', { key: 's4', className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
        React.createElement('p', { key: 'v', className: 'text-2xl font-black text-emerald-600' }, stats.avgAccuracy + '%'),
        React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground mt-1' }, '平均准确率'),
      ]),
    ]),

    // Filters
    React.createElement('div', { key: 'filters', className: 'bg-white rounded-2xl p-4 border border-slate-200 space-y-3' }, [
      React.createElement('div', { key: 'type', className: 'flex gap-2' }, [
        React.createElement('button', {
          key: 'all',
          onClick: () => setFilterType('all'),
          className: `px-3 py-1 rounded-lg text-sm font-bold transition-colors ${filterType === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`
        }, '全部'),
        React.createElement('button', {
          key: 'study',
          onClick: () => setFilterType('study'),
          className: `px-3 py-1 rounded-lg text-sm font-bold transition-colors ${filterType === 'study' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`
        }, '学习'),
        React.createElement('button', {
          key: 'review',
          onClick: () => setFilterType('review'),
          className: `px-3 py-1 rounded-lg text-sm font-bold transition-colors ${filterType === 'review' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`
        }, '复习'),
        React.createElement('button', {
          key: 'test',
          onClick: () => setFilterType('test'),
          className: `px-3 py-1 rounded-lg text-sm font-bold transition-colors ${filterType === 'test' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`
        }, '测试'),
      ]),
      React.createElement('select', {
        key: 'days',
        value: filterDays,
        onChange: (e: any) => setFilterDays(parseInt(e.target.value)),
        className: 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
      }, [
        React.createElement('option', { key: '7', value: 7 }, '最近 7 天'),
        React.createElement('option', { key: '30', value: 30 }, '最近 30 天'),
        React.createElement('option', { key: '90', value: 90 }, '最近 90 天'),
        React.createElement('option', { key: '365', value: 365 }, '最近一年'),
      ]),
    ]),

    // Records List
    React.createElement('div', { key: 'list', className: 'space-y-2' },
      filteredRecords.map((record, i) =>
        React.createElement('div', { key: i, className: 'bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between' }, [
          React.createElement('div', { key: 'left', className: 'flex-1' }, [
            React.createElement('div', { key: 'header', className: 'flex items-center gap-2 mb-1' }, [
              React.createElement('span', { key: 'type', className: `text-xs px-2 py-0.5 rounded-lg font-bold ${typeColors[record.type]}` }, 
                typeLabels[record.type]
              ),
              React.createElement('span', { key: 'date', className: 'text-sm font-bold' }, 
                record.date.toLocaleDateString()
              ),
              React.createElement('span', { key: 'time', className: 'text-xs text-muted-foreground' }, 
                record.date.toLocaleTimeString()
              ),
            ]),
            React.createElement('div', { key: 'stats', className: 'flex gap-4 text-xs text-muted-foreground' }, [
              React.createElement('span', { key: 'd' }, `⏱️ ${record.duration} 分钟`),
              React.createElement('span', { key: 'w' }, `📚 ${record.wordsStudied} 词`),
              React.createElement('span', { key: 'a' }, `✅ ${record.accuracy}%`),
            ]),
          ]),
          React.createElement('div', { key: 'right', className: 'text-right' }, [
            React.createElement('p', { key: 'acc', className: 'text-lg font-black text-emerald-600' }, record.accuracy + '%'),
          ]),
        ])
      )
    ),

    // Empty State
    filteredRecords.length === 0 && React.createElement('div', { key: 'empty', className: 'text-center py-12 text-muted-foreground' }, [
      React.createElement('p', { key: 'p', className: 'font-medium' }, '暂无学习记录'),
    ]),
  ]);
}
