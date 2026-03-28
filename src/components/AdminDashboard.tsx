import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/storage';
import { Button } from './ui/button';
import { Loader2, Database, BookOpen, Brain, TrendingUp, RefreshCw, Download, Upload, Trash2, Edit3, Plus, BarChart3, Zap, Search, Filter, Settings } from 'lucide-react';
import { toast } from 'sonner';

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

  const deleteWord = (id: string) => {
    toast('确定删除此词汇？', {
      action: {
        label: '确定',
        onClick: async () => {
          await db.deleteWord(id);
          loadData();
        }
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">📊 后台管理</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">实时数据看板 • IndexedDB 连接</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw size={14} className="mr-1" /> 刷新
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download size={14} className="mr-1" /> 导出
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80">词库总量</p>
              <p className="text-3xl font-black mt-1">{total}</p>
            </div>
            <Database size={24} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80">已掌握</p>
              <p className="text-3xl font-black mt-1">{mastered}</p>
            </div>
            <Brain size={24} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80">学习中</p>
              <p className="text-3xl font-black mt-1">{learning}</p>
            </div>
            <TrendingUp size={24} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80">新词</p>
              <p className="text-3xl font-black mt-1">{fresh}</p>
            </div>
            <Zap size={24} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <p className="text-sm font-bold mb-3">熟练度分布</p>
        <div className="flex h-4 rounded-full overflow-hidden gap-1 bg-slate-100">
          {total > 0 && (
            <div
              className="bg-slate-300 rounded-l-full transition-all"
              style={{ width: `${Math.max(2, (fresh / total) * 100)}%` }}
            />
          )}
          {total > 0 && (
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${Math.max(2, (learning / total) * 100)}%` }}
            />
          )}
          {total > 0 && (
            <div
              className="bg-emerald-500 rounded-r-full transition-all"
              style={{ width: `${Math.max(2, (mastered / total) * 100)}%` }}
            />
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-bold mt-2">
          <span>新词 {fresh} ({total > 0 ? Math.round((fresh / total) * 100) : 0}%)</span>
          <span>学习中 {learning} ({total > 0 ? Math.round((learning / total) * 100) : 0}%)</span>
          <span>掌握 {mastered} ({total > 0 ? Math.round((mastered / total) * 100) : 0}%)</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="搜索词汇..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">全部</option>
            <option value="fresh">新词</option>
            <option value="learning">学习中</option>
            <option value="mastered">已掌握</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="recent">最新</option>
            <option value="term">字母序</option>
            <option value="level">熟练度</option>
          </select>
        </div>
      </div>

      {/* Word List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <p className="text-sm font-bold">📚 词库列表 ({filteredWords.length}/{total})</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-medium">暂无词汇</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredWords.slice(0, 50).map((w, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <p className="font-bold text-sm">{w.term || '?'}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{(w.definition || '').substring(0, 50)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                    (w.totalExposure || 0) === 0 ? 'bg-slate-200 text-slate-600' :
                    (w.halflife || 0) > 20160 ? 'bg-emerald-100 text-emerald-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    Lv.{w.totalExposure || 0}
                  </span>
                  <button
                    onClick={() => deleteWord(w.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <p>💡 后台直接连接 IndexedDB，实时显示学习数据。支持搜索、筛选、排序和删除操作。</p>
      </div>
    </div>
  );
}
