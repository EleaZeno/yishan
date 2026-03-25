import React from 'react';
import { db } from '../services/storage';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, Database, BookOpen, Brain, TrendingUp, Trash2, Edit3, Plus, RefreshCw, Download, Search, BarChart3, Zap, Upload } from 'lucide-react';

export default function AdminDashboard() {
  return React.createElement('div', { className: 'space-y-6 max-w-5xl mx-auto px-2 py-4' }, [
    React.createElement('div', { key: 'header', className: 'flex items-center justify-between' }, [
      React.createElement('div', { key: 'title' }, [
        React.createElement('h1', { key: 'h1', className: 'text-2xl font-black tracking-tight' }, '后台管理'),
        React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground font-medium mt-1' }, '实时连接 IndexedDB'),
      ]),
      React.createElement('div', { key: 'actions', className: 'flex gap-2' }, [
        React.createElement(Button, { key: 'refresh', variant: 'outline', size: 'sm', onClick: () => window.location.reload() }, [
          React.createElement(RefreshCw, { key: 'icon', size: 14 }),
          ' 刷新',
        ]),
        React.createElement(Button, { key: 'export', variant: 'outline', size: 'sm', onClick: async () => {
          const words = await db.getAllWordsForStats();
          const blob = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'yishan-words.json';
          a.click();
          URL.revokeObjectURL(url);
        }}, [
          React.createElement(Download, { key: 'icon', size: 14 }),
          ' 导出',
        ]),
      ]),
    ]),

    // Stats Cards
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-2 md:grid-cols-4 gap-3' }, [
      React.createElement(Card, { key: 'total' }, [
        React.createElement(CardContent, { key: 'c', className: 'p-4' }, [
          React.createElement('div', { key: 'd', className: 'flex items-center gap-3' }, [
            React.createElement('div', { key: 'icon', className: 'w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center' }, [
              React.createElement(Database, { key: 'i', size: 18, className: 'text-white' }),
            ]),
            React.createElement('div', { key: 'text' }, [
              React.createElement('p', { key: 'v', className: 'text-2xl font-black', id: 'stat-total' }, '—'),
              React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground font-semibold' }, '词库总量'),
            ]),
          ]),
        ]),
      ]),
      React.createElement(Card, { key: 'mastered' }, [
        React.createElement(CardContent, { key: 'c', className: 'p-4' }, [
          React.createElement('div', { key: 'd', className: 'flex items-center gap-3' }, [
            React.createElement('div', { key: 'icon', className: 'w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center' }, [
              React.createElement(Brain, { key: 'i', size: 18, className: 'text-white' }),
            ]),
            React.createElement('div', { key: 'text' }, [
              React.createElement('p', { key: 'v', className: 'text-2xl font-black', id: 'stat-mastered' }, '—'),
              React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground font-semibold' }, '已掌握'),
            ]),
          ]),
        ]),
      ]),
      React.createElement(Card, { key: 'learning' }, [
        React.createElement(CardContent, { key: 'c', className: 'p-4' }, [
          React.createElement('div', { key: 'd', className: 'flex items-center gap-3' }, [
            React.createElement('div', { key: 'icon', className: 'w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center' }, [
              React.createElement(TrendingUp, { key: 'i', size: 18, className: 'text-white' }),
            ]),
            React.createElement('div', { key: 'text' }, [
              React.createElement('p', { key: 'v', className: 'text-2xl font-black', id: 'stat-learning' }, '—'),
              React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground font-semibold' }, '学习中'),
            ]),
          ]),
        ]),
      ]),
      React.createElement(Card, { key: 'fresh' }, [
        React.createElement(CardContent, { key: 'c', className: 'p-4' }, [
          React.createElement('div', { key: 'd', className: 'flex items-center gap-3' }, [
            React.createElement('div', { key: 'icon', className: 'w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center' }, [
              React.createElement(Zap, { key: 'i', size: 18, className: 'text-white' }),
            ]),
            React.createElement('div', { key: 'text' }, [
              React.createElement('p', { key: 'v', className: 'text-2xl font-black', id: 'stat-fresh' }, '—'),
              React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground font-semibold' }, '新词'),
            ]),
          ]),
        ]),
      ]),
    ]),

    // Word count info
    React.createElement(Card, { key: 'info' }, [
      React.createElement(CardHeader, { key: 'h', className: 'pb-3' }, [
        React.createElement(CardTitle, { key: 't', className: 'text-base font-black flex items-center gap-2' }, [
          React.createElement(BookOpen, { key: 'i', size: 16 }),
          ' 词库管理',
        ]),
      ]),
      React.createElement(CardContent, { key: 'c' }, [
        React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground' }, 
          '点击下方按钮查看词库统计，或使用顶部的刷新和导出功能。'
        ),
        React.createElement('div', { key: 'btn', className: 'mt-4' }, [
          React.createElement(Button, { key: 'load', onClick: async () => {
            const words = await db.getAllWordsForStats();
            const total = words.length;
            const mastered = words.filter((w: any) => (w.halflife || 0) > 20160).length;
            const learning = words.filter((w: any) => (w.halflife || 0) > 2880 && (w.halflife || 0) <= 20160).length;
            const fresh = total - mastered - learning;
            const el = document.getElementById('word-list');
            if (el) {
              el.innerHTML = `<p class="text-sm font-bold mb-2">共 ${total} 个词</p>` +
                words.slice(0, 50).map((w: any) => 
                  `<div class="flex justify-between py-1 border-b border-slate-100 text-sm">
                    <span class="font-bold">${w.term || '?'}</span>
                    <span class="text-muted-foreground">${(w.definition || '').substring(0, 30)}</span>
                    <span class="text-xs px-2 py-0.5 rounded ${
                      (w.totalExposure || 0) === 0 ? 'bg-slate-200' :
                      (w.halflife || 0) > 20160 ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }">Lv.${w.totalExposure || 0}</span>
                  </div>`
                ).join('');
            }
            const totalEl = document.getElementById('stat-total');
            const masteredEl = document.getElementById('stat-mastered');
            const learningEl = document.getElementById('stat-learning');
            const freshEl = document.getElementById('stat-fresh');
            if (totalEl) totalEl.textContent = String(total);
            if (masteredEl) masteredEl.textContent = String(mastered);
            if (learningEl) learningEl.textContent = String(learning);
            if (freshEl) freshEl.textContent = String(fresh);
          }}, [
            React.createElement(Database, { key: 'i', size: 14 }),
            ' 加载词库数据',
          ]),
        ]),
        React.createElement('div', { key: 'list', id: 'word-list', className: 'mt-4 max-h-96 overflow-y-auto' }, []),
      ]),
    ]),

    // Help card
    React.createElement(Card, { key: 'help' }, [
      React.createElement(CardContent, { key: 'c', className: 'p-4' }, [
        React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground' }, [
          '💡 后台直接连接 IndexedDB，实时显示学习数据。支持词库导入、导出和统计。',
        ]),
      ]),
    ]),
  ]);
}
