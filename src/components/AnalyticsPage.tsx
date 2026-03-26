import React, { useState, useEffect } from 'react';
import { db } from '../services/storage';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, Calendar, Target, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const words = await db.getAllWordsForStats();
        
        // 按创建日期分组
        const byDate: any = {};
        words.forEach(w => {
          const date = new Date(w.createdAt || 0).toISOString().split('T')[0];
          byDate[date] = (byDate[date] || 0) + 1;
        });
        
        const dateData = Object.entries(byDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-30)
          .map(([date, count]) => ({ date, count }));

        // 按难度分布
        const levels = [
          { name: '新词', count: words.filter(w => (w.totalExposure || 0) === 0).length, color: '#94a3b8' },
          { name: '学习中', count: words.filter(w => (w.halflife || 0) > 2880 && (w.halflife || 0) <= 20160).length, color: '#f59e0b' },
          { name: '已掌握', count: words.filter(w => (w.halflife || 0) > 20160).length, color: '#10b981' },
        ];

        // 按标签分布
        const byTag: any = {};
        words.forEach(w => {
          (w.tags || []).forEach((tag: string) => {
            byTag[tag] = (byTag[tag] || 0) + 1;
          });
        });
        
        const tagData = Object.entries(byTag)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count }));

        setData({
          dateData,
          levels,
          tagData,
          total: words.length,
          avgExposure: Math.round(words.reduce((sum, w) => sum + (w.totalExposure || 0), 0) / words.length),
        });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return React.createElement('div', { className: 'flex items-center justify-center py-12' }, [
      React.createElement(Loader2, { className: 'animate-spin text-muted-foreground', size: 24 }),
    ]);
  }

  if (!data) {
    return React.createElement('div', { className: 'text-center py-12 text-muted-foreground' }, [
      React.createElement('p', { key: 'p' }, '暂无数据'),
    ]);
  }

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '📈 学习分析'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, '深度学习数据分析'),
    ]),

    // Stats
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-2 md:grid-cols-4 gap-3' }, [
      React.createElement('div', { key: 's1', className: 'bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center justify-between' }, [
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'l', className: 'text-xs font-bold opacity-80' }, '总词数'),
            React.createElement('p', { key: 'v', className: 'text-2xl font-black mt-1' }, data.total),
          ]),
          React.createElement(Target, { key: 'i', size: 20, className: 'opacity-50' }),
        ]),
      ]),
      React.createElement('div', { key: 's2', className: 'bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center justify-between' }, [
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'l', className: 'text-xs font-bold opacity-80' }, '平均复习'),
            React.createElement('p', { key: 'v', className: 'text-2xl font-black mt-1' }, data.avgExposure),
          ]),
          React.createElement(Zap, { key: 'i', size: 20, className: 'opacity-50' }),
        ]),
      ]),
      React.createElement('div', { key: 's3', className: 'bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center justify-between' }, [
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'l', className: 'text-xs font-bold opacity-80' }, '学习中'),
            React.createElement('p', { key: 'v', className: 'text-2xl font-black mt-1' }, data.levels[1].count),
          ]),
          React.createElement(TrendingUp, { key: 'i', size: 20, className: 'opacity-50' }),
        ]),
      ]),
      React.createElement('div', { key: 's4', className: 'bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center justify-between' }, [
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'l', className: 'text-xs font-bold opacity-80' }, '已掌握'),
            React.createElement('p', { key: 'v', className: 'text-2xl font-black mt-1' }, data.levels[2].count),
          ]),
          React.createElement(Calendar, { key: 'i', size: 20, className: 'opacity-50' }),
        ]),
      ]),
    ]),

    // Charts
    React.createElement('div', { key: 'charts', className: 'grid md:grid-cols-2 gap-4' }, [
      // Line Chart
      React.createElement('div', { key: 'line', className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
        React.createElement('p', { key: 't', className: 'text-sm font-bold mb-3' }, '📅 最近30天新增'),
        React.createElement(ResponsiveContainer, { key: 'chart', width: '100%', height: 300 }, [
          React.createElement(LineChart, { data: data.dateData }, [
            React.createElement(CartesianGrid, { key: 'grid', strokeDasharray: '3 3' }),
            React.createElement(XAxis, { key: 'x', dataKey: 'date', tick: { fontSize: 12 } }),
            React.createElement(YAxis, { key: 'y', tick: { fontSize: 12 } }),
            React.createElement(Tooltip, { key: 'tooltip' }),
            React.createElement(Line, { key: 'line', type: 'monotone', dataKey: 'count', stroke: '#4f46e5', strokeWidth: 2, dot: false }),
          ]),
        ]),
      ]),

      // Pie Chart
      React.createElement('div', { key: 'pie', className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
        React.createElement('p', { key: 't', className: 'text-sm font-bold mb-3' }, '🎯 熟练度分布'),
        React.createElement(ResponsiveContainer, { key: 'chart', width: '100%', height: 300 }, [
          React.createElement(PieChart, {}, [
            React.createElement(Pie, { 
              key: 'pie',
              data: data.levels,
              dataKey: 'count',
              nameKey: 'name',
              cx: '50%',
              cy: '50%',
              outerRadius: 80,
              label: true
            }, data.levels.map((entry: any, index: number) =>
              React.createElement(Cell, { key: index, fill: entry.color })
            )),
            React.createElement(Tooltip, { key: 'tooltip' }),
            React.createElement(Legend, { key: 'legend' }),
          ]),
        ]),
      ]),

      // Bar Chart
      React.createElement('div', { key: 'bar', className: 'bg-white rounded-2xl p-4 border border-slate-200 md:col-span-2' }, [
        React.createElement('p', { key: 't', className: 'text-sm font-bold mb-3' }, '🏷️ 标签分布 (Top 10)'),
        React.createElement(ResponsiveContainer, { key: 'chart', width: '100%', height: 300 }, [
          React.createElement(BarChart, { data: data.tagData }, [
            React.createElement(CartesianGrid, { key: 'grid', strokeDasharray: '3 3' }),
            React.createElement(XAxis, { key: 'x', dataKey: 'tag', tick: { fontSize: 12 } }),
            React.createElement(YAxis, { key: 'y', tick: { fontSize: 12 } }),
            React.createElement(Tooltip, { key: 'tooltip' }),
            React.createElement(Bar, { key: 'bar', dataKey: 'count', fill: '#4f46e5' }),
          ]),
        ]),
      ]),
    ]),
  ]);
}
