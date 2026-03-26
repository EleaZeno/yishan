import React, { useState } from 'react';
import { db } from '../services/storage';
import { Calendar, Target, Zap, BookOpen } from 'lucide-react';

interface StudyPlan {
  id: string;
  name: string;
  dailyGoal: number;
  duration: number; // days
  startDate: Date;
  endDate: Date;
  words: string[];
  progress: number;
  status: 'active' | 'completed' | 'paused';
}

export default function StudyPlanGenerator() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dailyGoal: 10,
    duration: 30,
  });

  const generatePlan = async () => {
    try {
      const allWords = await db.getAllWordsForStats();
      
      // 按难度分组
      const newWords = allWords.filter(w => (w.totalExposure || 0) === 0);
      const learningWords = allWords.filter(w => (w.halflife || 0) > 2880 && (w.halflife || 0) <= 20160);
      const masteredWords = allWords.filter(w => (w.halflife || 0) > 20160);

      // 生成学习计划
      const totalDays = formData.duration;
      const wordsPerDay = formData.dailyGoal;
      const totalWords = totalDays * wordsPerDay;

      // 分配词汇：新词 40%，学习中 40%，复习 20%
      const newWordsCount = Math.floor(totalWords * 0.4);
      const learningWordsCount = Math.floor(totalWords * 0.4);
      const reviewWordsCount = totalWords - newWordsCount - learningWordsCount;

      const selectedWords = [
        ...newWords.slice(0, newWordsCount).map(w => w.id),
        ...learningWords.slice(0, learningWordsCount).map(w => w.id),
        ...masteredWords.slice(0, reviewWordsCount).map(w => w.id),
      ];

      const plan: StudyPlan = {
        id: crypto.randomUUID(),
        name: formData.name || `Study Plan ${new Date().toLocaleDateString()}`,
        dailyGoal: formData.dailyGoal,
        duration: formData.duration,
        startDate: new Date(),
        endDate: new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000),
        words: selectedWords,
        progress: 0,
        status: 'active',
      };

      setPlans([...plans, plan]);
      localStorage.setItem('studyPlans', JSON.stringify([...plans, plan]));
      setShowForm(false);
      setFormData({ name: '', dailyGoal: 10, duration: 30 });
    } catch (e) {
      console.error(e);
    }
  };

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '📅 学习计划'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, '智能生成个性化学习计划'),
    ]),

    // Create Plan Button
    React.createElement('button', {
      key: 'btn',
      onClick: () => setShowForm(!showForm),
      className: 'w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl p-4 font-bold hover:shadow-lg transition-all'
    }, '+ 生成新计划'),

    // Form
    showForm && React.createElement('div', { key: 'form', className: 'bg-white rounded-2xl p-4 border border-slate-200 space-y-3' }, [
      React.createElement('input', {
        key: 'name',
        type: 'text',
        placeholder: '计划名称（可选）',
        value: formData.name,
        onChange: (e: any) => setFormData({ ...formData, name: e.target.value }),
        className: 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
      }),
      React.createElement('div', { key: 'row', className: 'grid grid-cols-2 gap-2' }, [
        React.createElement('div', { key: 'daily' }, [
          React.createElement('label', { key: 'l', className: 'text-xs font-bold text-muted-foreground' }, '每日目标'),
          React.createElement('input', {
            key: 'i',
            type: 'number',
            min: 1,
            max: 100,
            value: formData.dailyGoal,
            onChange: (e: any) => setFormData({ ...formData, dailyGoal: parseInt(e.target.value) }),
            className: 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
          }),
        ]),
        React.createElement('div', { key: 'duration' }, [
          React.createElement('label', { key: 'l', className: 'text-xs font-bold text-muted-foreground' }, '计划天数'),
          React.createElement('input', {
            key: 'i',
            type: 'number',
            min: 1,
            max: 365,
            value: formData.duration,
            onChange: (e: any) => setFormData({ ...formData, duration: parseInt(e.target.value) }),
            className: 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
          }),
        ]),
      ]),
      React.createElement('button', {
        key: 'submit',
        onClick: generatePlan,
        className: 'w-full bg-indigo-500 text-white rounded-lg py-2 font-bold hover:bg-indigo-600 transition-colors'
      }, '生成计划'),
    ]),

    // Plans List
    React.createElement('div', { key: 'list', className: 'space-y-3' },
      plans.map((plan, i) =>
        React.createElement('div', { key: i, className: 'bg-white rounded-2xl p-4 border border-slate-200' }, [
          React.createElement('div', { key: 'header', className: 'flex items-center justify-between mb-3' }, [
            React.createElement('div', { key: 'title' }, [
              React.createElement('p', { key: 'n', className: 'font-bold' }, plan.name),
              React.createElement('p', { key: 'd', className: 'text-xs text-muted-foreground' }, 
                `${plan.startDate.toLocaleDateString()} - ${plan.endDate.toLocaleDateString()}`
              ),
            ]),
            React.createElement('span', { key: 'status', className: `text-xs px-2 py-1 rounded-lg font-bold ${
              plan.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
              plan.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-700'
            }` }, plan.status),
          ]),
          React.createElement('div', { key: 'stats', className: 'grid grid-cols-3 gap-2 text-sm' }, [
            React.createElement('div', { key: 's1', className: 'text-center' }, [
              React.createElement('p', { key: 'v', className: 'font-bold text-lg' }, plan.dailyGoal),
              React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground' }, '每日目标'),
            ]),
            React.createElement('div', { key: 's2', className: 'text-center' }, [
              React.createElement('p', { key: 'v', className: 'font-bold text-lg' }, plan.duration),
              React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground' }, '天数'),
            ]),
            React.createElement('div', { key: 's3', className: 'text-center' }, [
              React.createElement('p', { key: 'v', className: 'font-bold text-lg' }, plan.words.length),
              React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground' }, '词汇'),
            ]),
          ]),
          React.createElement('div', { key: 'progress', className: 'mt-3' }, [
            React.createElement('div', { key: 'bar', className: 'w-full h-2 bg-slate-200 rounded-full overflow-hidden' }, [
              React.createElement('div', { key: 'fill', className: 'h-full bg-indigo-500 transition-all', style: { width: plan.progress + '%' } }),
            ]),
            React.createElement('p', { key: 'text', className: 'text-xs text-muted-foreground mt-1' }, `进度: ${plan.progress}%`),
          ]),
        ])
      )
    ),

    // Empty State
    plans.length === 0 && !showForm && React.createElement('div', { key: 'empty', className: 'text-center py-12 text-muted-foreground' }, [
      React.createElement('p', { key: 'p', className: 'font-medium' }, '暂无学习计划'),
    ]),
  ]);
}
