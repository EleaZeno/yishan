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
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">📈 学习分析</h1>
        <p className="text-sm text-muted-foreground mt-1">深度学习数据分析</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80">总词数</p>
              <p className="text-2xl font-black mt-1">{data.total}</p>
            </div>
            <Target size={20} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80">平均复习</p>
              <p className="text-2xl font-black mt-1">{data.avgExposure}</p>
            </div>
            <Zap size={20} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80">学习中</p>
              <p className="text-2xl font-black mt-1">{data.levels[1].count}</p>
            </div>
            <TrendingUp size={20} className="opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80">已掌握</p>
              <p className="text-2xl font-black mt-1">{data.levels[2].count}</p>
            </div>
            <Calendar size={20} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Line Chart */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <p className="text-sm font-bold mb-3">📅 最近30天新增</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <p className="text-sm font-bold mb-3">🎯 熟练度分布</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.levels}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.levels.map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 md:col-span-2">
          <p className="text-sm font-bold mb-3">🏷️ 标签分布 (Top 10)</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.tagData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tag" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
