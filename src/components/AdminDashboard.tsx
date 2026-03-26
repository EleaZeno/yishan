import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/storage';
import { Button } from './ui/button';
import { Loader2, Database, BookOpen, Brain, TrendingUp, RefreshCw, Download, Upload, Trash2, Edit3, Plus, BarChart3, Zap, Search, Filter, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const [total, setTotal] = useState(0);
  const [mastered, setMastered] = useState(0);
  const [learning, setLearning] = useState(0);
  const [fresh, setFresh] = useState(0);
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const all = await db.getAllWordsForStats();
      setWords(all);
      setTotal(all.length);
      setMastered(all.filter(w => (w.halflife || 0) > 20160).length);
      setLearning(all.filter(w => (w.halflife || 0) > 2880 && (w.halflife || 0) <= 20160).length);
      setFresh(all.filter(w => (w.totalExposure || 0) === 0).length);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredWords = words
    .filter(w => {
      if (searchTerm && !w.term?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterLevel === 'mastered' && (w.halflife || 0) <= 20160) return false;
      if (filterLevel === 'learning' && ((w.halflife || 0) <= 2880 || (w.halflife || 0) > 20160)) return false;
      if (filterLevel === 'fresh' && (w.totalExposure || 0) !== 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'term') return (a.term || '').localeCompare(b.term || '');
      if (sortBy === 'level') return (b.halflife || 0) - (a.halflife || 0);
      return 0;
    });

  const exportData = async () => {
    const blob = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yishan-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteWord = async (id: string) => {
    if (confirm('确定删除此词汇？')) {
      await db.deleteWord(id);
      loadData();
    }
  };

  return React.createElement('div', { className: 'space-y-6 max-w-6xl mx-auto px-2 py-4' }, [
    // Header
    React.createElement('div', { key: 'header', className: 'flex items-center justify-between' }, [
      React.createElement('div', { key: 'title' }, [
        React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '📊 后台管理'),
        React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground font-medium mt-1' }, '实时数据看板 • IndexedDB 连接'),
      ]),
      React.createElement('div', { key: 'actions', className: 'flex gap-2' }, [
        React.createElement(Button, { key: 'refresh', variant: 'outline', size: 'sm', onClick: loadData }, [
          React.createElement(RefreshCw, { key: 'i', size: 14 }),
          ' 刷新',
        ]),
        React.createElement(Button, { key: 'export', variant: 'outline', size: 'sm', onClick: exportData }, [
          React.createElement(Download, { key: 'i', size: 14 }),
          ' 导出',
        ]),
      ]),
    ]),

    // Stats Grid
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-2 md:grid-cols-4 gap-3' }, [
      React.createElement('div', { key: 's1', className: 'bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center justify-between' }, [
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'l', className: 'text-xs font-bold opacity-80' }, '词库总量'),
            React.createElement('p', { key: 'v', className: 'text-3xl font-black mt-1' }, total),
          ]),
          React.createElement(Database, { key: 'i', size: 24, className: 'opacity-50' }),
        ]),
      ]),
      React.createElement('div', { key: 's2', className: 'bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center justify-between' }, [
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'l', className: 'text-xs font-bold opacity-80' }, '已掌握'),
            React.createElement('p', { key: 'v', className: 'text-3xl font-black mt-1' }, mastered),
          ]),
          React.createElement(Brain, { key: 'i', size: 24, className: 'opacity-50' }),
        ]),
      ]),
      React.createElement('div', { key: 's3', className: 'bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center justify-between' }, [
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'l', className: 'text-xs font-bold opacity-80' }, '学习中'),
            React.createElement('p', { key: 'v', className: 'text-3xl font-black mt-1' }, learning),
          ]),
          React.createElement(TrendingUp, { key: 'i', size: 24, className: 'opacity-50' }),
        ]),
      ]),
      React.createElement('div', { key: 's4', className: 'bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center justify-between' }, [
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'l', className: 'text-xs font-bold opacity-80' }, '新词'),
            React.createElement('p', { key: 'v', className: 'text-3xl font-black mt-1' }, fresh),
          ]),
          React.createElement(Zap, { key: 'i', size: 24, className: 'opacity-50' }),
        ]),
      ]),
    ]),

    // Progress Bar
    React.createElement('div', { key: 'progress', className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
      React.createElement('p', { key: 't', className: 'text-sm font-bold mb-3' }, '熟练度分布'),
      React.createElement('div', { key: 'bar', className: 'flex h-4 rounded-full overflow-hidden gap-1 bg-slate-100' }, [
        total > 0 && React.createElement('div', { key: 'f', className: 'bg-slate-300 rounded-l-full transition-all', style: { width: Math.max(2, fresh / total * 100) + '%' } }),
        total > 0 && React.createElement('div', { key: 'l', className: 'bg-amber-400 transition-all', style: { width: Math.max(2, learning / total * 100) + '%' } }),
        total > 0 && React.createElement('div', { key: 'm', className: 'bg-emerald-500 rounded-r-full transition-all', style: { width: Math.max(2, mastered / total * 100) + '%' } }),
      ]),
      React.createElement('div', { key: 'leg', className: 'flex justify-between text-xs text-muted-foreground font-bold mt-2' }, [
        React.createElement('span', { key: '1' }, `新词 ${fresh} (${total > 0 ? Math.round(fresh/total*100) : 0}%)`),
        React.createElement('span', { key: '2' }, `学习中 ${learning} (${total > 0 ? Math.round(learning/total*100) : 0}%)`),
        React.createElement('span', { key: '3' }, `掌握 ${mastered} (${total > 0 ? Math.round(mastered/total*100) : 0}%)`),
      ]),
    ]),

    // Search & Filter
    React.createElement('div', { key: 'controls', className: 'bg-white rounded-2xl p-4 border border-slate-200 space-y-3' }, [
      React.createElement('div', { key: 'search', className: 'flex gap-2' }, [
        React.createElement('input', { 
          key: 'input',
          type: 'text',
          placeholder: '搜索词汇...',
          value: searchTerm,
          onChange: (e: any) => setSearchTerm(e.target.value),
          className: 'flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
        }),
        React.createElement('select', {
          key: 'filter',
          value: filterLevel,
          onChange: (e: any) => setFilterLevel(e.target.value),
          className: 'px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
        }, [
          React.createElement('option', { key: 'all', value: 'all' }, '全部'),
          React.createElement('option', { key: 'fresh', value: 'fresh' }, '新词'),
          React.createElement('option', { key: 'learning', value: 'learning' }, '学习中'),
          React.createElement('option', { key: 'mastered', value: 'mastered' }, '已掌握'),
        ]),
        React.createElement('select', {
          key: 'sort',
          value: sortBy,
          onChange: (e: any) => setSortBy(e.target.value),
          className: 'px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
        }, [
          React.createElement('option', { key: 'recent', value: 'recent' }, '最新'),
          React.createElement('option', { key: 'term', value: 'term' }, '字母序'),
          React.createElement('option', { key: 'level', value: 'level' }, '熟练度'),
        ]),
      ]),
    ]),

    // Word List
    React.createElement('div', { key: 'list', className: 'bg-white rounded-2xl border border-slate-200 overflow-hidden' }, [
      React.createElement('div', { key: 'header', className: 'px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center' }, [
        React.createElement('p', { key: 't', className: 'text-sm font-bold' }, `📚 词库列表 (${filteredWords.length}/${total})`),
      ]),
      loading ? React.createElement('div', { key: 'loading', className: 'flex items-center justify-center py-12' }, [
        React.createElement(Loader2, { key: 'i', className: 'animate-spin text-muted-foreground', size: 24 }),
      ]) : filteredWords.length === 0 ? React.createElement('div', { key: 'empty', className: 'text-center py-12 text-muted-foreground' }, [
        React.createElement('p', { key: 'p', className: 'font-medium' }, '暂无词汇'),
      ]) : React.createElement('div', { key: 'words', className: 'divide-y divide-slate-100 max-h-96 overflow-y-auto' },
        filteredWords.slice(0, 50).map((w, i) =>
          React.createElement('div', { key: i, className: 'px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors' }, [
            React.createElement('div', { key: 'l', className: 'flex-1' }, [
              React.createElement('p', { key: 't', className: 'font-bold text-sm' }, w.term || '?'),
              React.createElement('p', { key: 'd', className: 'text-xs text-muted-foreground truncate max-w-xs' }, (w.definition || '').substring(0, 50)),
            ]),
            React.createElement('div', { key: 'r', className: 'flex items-center gap-2' }, [
              React.createElement('span', { key: 'lvl', className: `text-xs px-2 py-1 rounded-lg font-bold ${
                (w.totalExposure || 0) === 0 ? 'bg-slate-200 text-slate-600' :
                (w.halflife || 0) > 20160 ? 'bg-emerald-100 text-emerald-700' :
                'bg-amber-100 text-amber-700'
              }` }, `Lv.${w.totalExposure || 0}`),
              React.createElement('button', {
                key: 'del',
                onClick: () => deleteWord(w.id),
                className: 'p-1 hover:bg-red-100 rounded text-red-600 transition-colors'
              }, React.createElement(Trash2, { size: 14 })),
            ]),
          ])
        )
      ),
    ]),

    // Footer
    React.createElement('div', { key: 'footer', className: 'text-center text-xs text-muted-foreground py-4' }, [
      React.createElement('p', { key: 'p' }, '💡 后台直接连接 IndexedDB，实时显示学习数据。支持搜索、筛选、排序和删除操作。'),
    ]),
  ]);
}
