import React, { useState, useEffect } from 'react';
import { Calendar, Target, Clock, TrendingUp, CheckCircle, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface StudyPlan {
  id: string;
  name: string;
  dailyGoal: number;
  duration: number; // days
  startDate: Date;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  stats: {
    newWords: number;
    reviewWords: number;
    masteredWords: number;
  };
}

export default function StudyPlanGenerator() {
  const [plans, setPlans] = useState<StudyPlan[]>(() => {
    const saved = localStorage.getItem('studyPlans');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'startDate') return new Date(value);
      return value;
    }) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    dailyGoal: 20,
    duration: 30,
  });

  useEffect(() => {
    localStorage.setItem('studyPlans', JSON.stringify(plans));
  }, [plans]);

  const createPlan = () => {
    if (!newPlan.name.trim()) return;

    const plan: StudyPlan = {
      id: crypto.randomUUID(),
      name: newPlan.name,
      dailyGoal: newPlan.dailyGoal,
      duration: newPlan.duration,
      startDate: new Date(),
      progress: 0,
      status: 'active',
      stats: {
        newWords: Math.floor(newPlan.dailyGoal * 0.4),
        reviewWords: Math.floor(newPlan.dailyGoal * 0.4),
        masteredWords: Math.floor(newPlan.dailyGoal * 0.2),
      },
    };

    setPlans([plan, ...plans]);
    setNewPlan({ name: '', dailyGoal: 20, duration: 30 });
    setShowForm(false);
  };

  const togglePlanStatus = (id: string) => {
    setPlans(plans.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        status: p.status === 'active' ? 'paused' : 'active' as const,
      };
    }));
  };

  const deletePlan = (id: string) => {
    if (confirm('确定要删除这个学习计划？')) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  const activePlans = plans.filter(p => p.status === 'active');
  const completedPlans = plans.filter(p => p.status === 'completed');

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '📅 学习计划'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, '制定科学的学习计划'),
    ]),

    // Stats Overview
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-3 gap-3' }, [
      React.createElement('div', {
        key: 's1',
        className: 'bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg'
      }, [
        React.createElement('p', { key: 'l', className: 'text-white/70 text-xs font-bold uppercase' }, '进行中'),
        React.createElement('p', { key: 'v', className: 'text-2xl font-black mt-1' }, activePlans.length),
      ]),
      React.createElement('div', {
        key: 's2',
        className: 'bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg'
      }, [
        React.createElement('p', { key: 'l', className: 'text-white/70 text-xs font-bold uppercase' }, '已完成'),
        React.createElement('p', { key: 'v', className: 'text-2xl font-black mt-1' }, completedPlans.length),
      ]),
      React.createElement('div', {
        key: 's3',
        className: 'bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg'
      }, [
        React.createElement('p', { key: 'l', className: 'text-white/70 text-xs font-bold uppercase' }, '总计划'),
        React.createElement('p', { key: 'v', className: 'text-2xl font-black mt-1' }, plans.length),
      ]),
    ]),

    // Create Button
    React.createElement('button', {
      key: 'btn',
      onClick: () => setShowForm(!showForm),
      className: 'w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-4 font-bold hover:shadow-xl hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2'
    }, [
      React.createElement(Sparkles, { key: 'i', size: 20 }),
      '+ 创建新计划',
    ]),

    // Form
    showForm && React.createElement('div', {
      key: 'form',
      className: 'bg-white rounded-2xl p-5 border border-slate-200 shadow-lg space-y-4'
    }, [
      React.createElement('div', { key: 'name' }, [
        React.createElement('label', { key: 'l', className: 'text-sm font-bold text-slate-700 block mb-2' }, '计划名称'),
        React.createElement('input', {
          key: 'i',
          type: 'text',
          placeholder: '例如：高考冲刺计划',
          value: newPlan.name,
          onChange: (e: any) => setNewPlan({ ...newPlan, name: e.target.value }),
          className: 'w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
        }),
      ]),
      React.createElement('div', { key: 'goal', className: 'grid grid-cols-2 gap-3' }, [
        React.createElement('div', { key: 'daily' }, [
          React.createElement('label', { key: 'l', className: 'text-sm font-bold text-slate-700 block mb-2' }, '每日目标'),
          React.createElement('div', { key: 'w', className: 'relative' }, [
            React.createElement('input', {
              key: 'i',
              type: 'number',
              min: 5,
              max: 100,
              value: newPlan.dailyGoal,
              onChange: (e: any) => setNewPlan({ ...newPlan, dailyGoal: parseInt(e.target.value) || 20 }),
              className: 'w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12'
            }),
            React.createElement('span', { key: 'u', className: 'absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm' }, '词'),
          ]),
        ]),
        React.createElement('div', { key: 'duration' }, [
          React.createElement('label', { key: 'l', className: 'text-sm font-bold text-slate-700 block mb-2' }, '计划周期'),
          React.createElement('div', { key: 'w', className: 'relative' }, [
            React.createElement('input', {
              key: 'i',
              type: 'number',
              min: 7,
              max: 365,
              value: newPlan.duration,
              onChange: (e: any) => setNewPlan({ ...newPlan, duration: parseInt(e.target.value) || 30 }),
              className: 'w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12'
            }),
            React.createElement('span', { key: 'u', className: 'absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm' }, '天'),
          ]),
        ]),
      ]),
      React.createElement('div', { key: 'preview', className: 'bg-slate-50 rounded-xl p-4 space-y-2' }, [
        React.createElement('p', { key: 't', className: 'text-sm font-bold text-slate-700' }, '📊 计划预览'),
        React.createElement('div', { key: 'items', className: 'grid grid-cols-3 gap-2 text-center' }, [
          React.createElement('div', { key: 'n', className: 'bg-white rounded-lg p-2' }, [
            React.createElement('p', { key: 'v', className: 'text-lg font-black text-indigo-600' }, Math.floor(newPlan.dailyGoal * 0.4)),
            React.createElement('p', { key: 'l', className: 'text-xs text-slate-500' }, '新词'),
          ]),
          React.createElement('div', { key: 'r', className: 'bg-white rounded-lg p-2' }, [
            React.createElement('p', { key: 'v', className: 'text-lg font-black text-amber-600' }, Math.floor(newPlan.dailyGoal * 0.4)),
            React.createElement('p', { key: 'l', className: 'text-xs text-slate-500' }, '复习'),
          ]),
          React.createElement('div', { key: 'm', className: 'bg-white rounded-lg p-2' }, [
            React.createElement('p', { key: 'v', className: 'text-lg font-black text-emerald-600' }, Math.floor(newPlan.dailyGoal * 0.2)),
            React.createElement('p', { key: 'l', className: 'text-xs text-slate-500' }, '巩固'),
          ]),
        ]),
      ]),
      React.createElement('button', {
        key: 'submit',
        onClick: createPlan,
        className: 'w-full bg-indigo-600 text-white rounded-xl py-3 font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25'
      }, '创建计划'),
    ]),

    // Plans List
    React.createElement('div', { key: 'plans', className: 'space-y-4' },
      plans.map((plan, i) =>
        React.createElement('div', {
          key: i,
          className: `bg-white rounded-2xl border-2 overflow-hidden transition-all ${
            plan.status === 'active' ? 'border-indigo-200 shadow-lg shadow-indigo-500/10' : 
            plan.status === 'completed' ? 'border-emerald-200' : 'border-slate-200'
          }`
        }, [
          // Header
          React.createElement('div', {
            key: 'header',
            className: `p-5 ${
              plan.status === 'active' ? 'bg-gradient-to-r from-indigo-50 to-purple-50' :
              plan.status === 'completed' ? 'bg-emerald-50' : 'bg-slate-50'
            }`
          }, [
            React.createElement('div', { key: 'top', className: 'flex items-start justify-between mb-3' }, [
              React.createElement('div', { key: 'info' }, [
                React.createElement('p', { key: 'name', className: 'font-black text-lg text-slate-800' }, plan.name),
                React.createElement('p', { key: 'date', className: 'text-xs text-slate-500 mt-1' },
                  `开始于 ${plan.startDate.toLocaleDateString()}`
                ),
              ]),
              React.createElement('span', {
                key: 'status',
                className: `px-3 py-1 rounded-full text-xs font-bold ${
                  plan.status === 'active' ? 'bg-indigo-500 text-white' :
                  plan.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                }`
              }, plan.status === 'active' ? '进行中' : plan.status === 'completed' ? '已完成' : '已暂停'),
            ]),

            // Progress Bar
            React.createElement('div', { key: 'progress', className: 'mt-4' }, [
              React.createElement('div', { key: 'bar', className: 'bg-white rounded-full h-3 overflow-hidden shadow-inner' }, [
                React.createElement('div', {
                  key: 'fill',
                  className: `h-full rounded-full transition-all duration-500 ${
                    plan.status === 'active' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                    plan.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`,
                  style: { width: `${plan.progress}%` }
                }),
              ]),
              React.createElement('div', { key: 'text', className: 'flex justify-between mt-2 text-xs font-bold' }, [
                React.createElement('span', { key: 'p', className: 'text-slate-600' }, `进度 ${plan.progress}%`),
                React.createElement('span', { key: 'd', className: 'text-slate-500' }, `还剩 ${plan.duration - Math.floor(plan.duration * plan.progress / 100)} 天`),
              ]),
            ]),
          ]),

          // Stats
          React.createElement('div', { key: 'stats', className: 'p-5 grid grid-cols-3 gap-3 border-t border-slate-100' }, [
            React.createElement('div', { key: 'n', className: 'text-center' }, [
              React.createElement('p', { key: 'v', className: 'text-xl font-black text-indigo-600' }, plan.stats.newWords),
              React.createElement('p', { key: 'l', className: 'text-xs text-slate-500 mt-1' }, '新词/天'),
            ]),
            React.createElement('div', { key: 'r', className: 'text-center' }, [
              React.createElement('p', { key: 'v', className: 'text-xl font-black text-amber-600' }, plan.stats.reviewWords),
              React.createElement('p', { key: 'l', className: 'text-xs text-slate-500 mt-1' }, '复习/天'),
            ]),
            React.createElement('div', { key: 'm', className: 'text-center' }, [
              React.createElement('p', { key: 'v', className: 'text-xl font-black text-emerald-600' }, plan.stats.masteredWords),
              React.createElement('p', { key: 'l', className: 'text-xs text-slate-500 mt-1' }, '巩固/天'),
            ]),
          ]),

          // Actions
          React.createElement('div', { key: 'actions', className: 'p-5 pt-0 flex gap-2' }, [
            React.createElement('button', {
              key: 'toggle',
              onClick: () => togglePlanStatus(plan.id),
              className: `flex-1 py-2 rounded-xl font-bold transition-colors flex items-center justify-center gap-1 ${
                plan.status === 'active' 
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`
            }, [
              plan.status === 'active' ? React.createElement(Pause, { key: 'i', size: 16 }) : React.createElement(Play, { key: 'i', size: 16 }),
              plan.status === 'active' ? '暂停' : '继续',
            ]),
            React.createElement('button', {
              key: 'delete',
              onClick: () => deletePlan(plan.id),
              className: 'px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors'
            }, '🗑️'),
          ]),
        ])
      )
    ),

    // Empty State
    plans.length === 0 && !showForm && React.createElement('div', {
      key: 'empty',
      className: 'text-center py-16'
    }, [
      React.createElement('div', {
        key: 'icon',
        className: 'w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4'
      }, React.createElement(Calendar, { size: 40, className: 'text-slate-400' })),
      React.createElement('p', { key: 't', className: 'text-lg font-bold text-slate-700' }, '还没有学习计划'),
      React.createElement('p', { key: 'd', className: 'text-sm text-slate-500 mt-2' }, '创建一个计划，开始科学学习'),
    ]),
  ]);
}
