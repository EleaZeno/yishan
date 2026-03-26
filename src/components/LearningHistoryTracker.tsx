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

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">📚 学习历史</h1>
        <p className="text-sm text-muted-foreground mt-1">追踪你的学习进度</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <p className="text-2xl font-black">{stats.totalSessions}</p>
          <p className="text-xs text-muted-foreground mt-1">学习次数</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <p className="text-2xl font-black">{stats.totalMinutes}</p>
          <p className="text-xs text-muted-foreground mt-1">学习分钟</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <p className="text-2xl font-black">{stats.totalWords}</p>
          <p className="text-xs text-muted-foreground mt-1">学习词数</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <p className="text-2xl font-black text-emerald-600">{stats.avgAccuracy}%</p>
          <p className="text-xs text-muted-foreground mt-1">平均准确率</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${filterType === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType('study')}
            className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${filterType === 'study' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            学习
          </button>
          <button
            onClick={() => setFilterType('review')}
            className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${filterType === 'review' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            复习
          </button>
          <button
            onClick={() => setFilterType('test')}
            className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${filterType === 'test' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            测试
          </button>
        </div>
        <select
          value={filterDays}
          onChange={(e: any) => setFilterDays(parseInt(e.target.value))}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value={7}>最近 7 天</option>
          <option value={30}>最近 30 天</option>
          <option value={90}>最近 90 天</option>
          <option value={365}>最近一年</option>
        </select>
      </div>

      {/* Records List */}
      <div className="space-y-2">
        {filteredRecords.map((record, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${typeColors[record.type]}`}>
                  {typeLabels[record.type]}
                </span>
                <span className="text-sm font-bold">
                  {new Date(record.date).toLocaleDateString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(record.date).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>⏱️ {record.duration} 分钟</span>
                <span>📚 {record.wordsStudied} 词</span>
                <span>✅ {record.accuracy}%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-emerald-600">{record.accuracy}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecords.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">暂无学习记录</p>
        </div>
      )}
    </div>
  );
}
