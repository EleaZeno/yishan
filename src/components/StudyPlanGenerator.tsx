import React, { useState, useEffect } from 'react';
import { db } from '../services/storage';
import { Calendar, Target, Zap, BookOpen, Brain } from 'lucide-react';
import { getWeakPoints } from '../services/assessment';

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

  useEffect(() => {
    const saved = localStorage.getItem('studyPlans');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlans(parsed.map((p: any) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate)
        })));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const generateSmartPlan = async () => {
    try {
      const weakPoints = await getWeakPoints();
      const topWeak = weakPoints.slice(0, 3).map(wp => wp.name).join(', ');
      
      const plan: StudyPlan = {
        id: crypto.randomUUID(),
        name: `BKT 智能攻克: ${topWeak}`,
        dailyGoal: 15,
        duration: 14,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        words: [], // In a real app, we would fetch words related to these weak points
        progress: 0,
        status: 'active',
      };

      const newPlans = [...plans, plan];
      setPlans(newPlans);
      localStorage.setItem('studyPlans', JSON.stringify(newPlans));
    } catch (e) {
      console.error(e);
    }
  };

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
        name: formData.name || `常规计划 ${new Date().toLocaleDateString()}`,
        dailyGoal: formData.dailyGoal,
        duration: formData.duration,
        startDate: new Date(),
        endDate: new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000),
        words: selectedWords,
        progress: 0,
        status: 'active',
      };

      const newPlans = [...plans, plan];
      setPlans(newPlans);
      localStorage.setItem('studyPlans', JSON.stringify(newPlans));
      setShowForm(false);
      setFormData({ name: '', dailyGoal: 10, duration: 30 });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">📅 学习计划</h1>
        <p className="text-sm text-muted-foreground mt-1">智能生成个性化学习计划</p>
      </div>

      {/* Create Plan Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={generateSmartPlan}
          className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-2xl p-4 font-bold hover:bg-indigo-500/20 transition-all flex flex-col items-center justify-center gap-2"
        >
          <Brain size={24} />
          <span>BKT 智能生成</span>
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-card border border-border text-foreground rounded-2xl p-4 font-bold hover:bg-muted transition-all flex flex-col items-center justify-center gap-2"
        >
          <Calendar size={24} />
          <span>自定义计划</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-2xl p-4 border border-border space-y-3 animate-in slide-in-from-top-2">
          <input
            type="text"
            placeholder="计划名称（可选）"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground">每日目标</label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.dailyGoal}
                onChange={(e) => setFormData({ ...formData, dailyGoal: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">计划天数</label>
              <input
                type="number"
                min={1}
                max={365}
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <button
            onClick={generatePlan}
            className="w-full bg-primary text-primary-foreground rounded-lg py-2 font-bold hover:bg-primary/90 transition-colors"
          >
            生成计划
          </button>
        </div>
      )}

      {/* Plans List */}
      <div className="space-y-3">
        {plans.map((plan, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-foreground">{plan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {plan.startDate.toLocaleDateString()} - {plan.endDate.toLocaleDateString()}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                plan.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                plan.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                'bg-muted text-muted-foreground'
              }`}>
                {plan.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <p className="font-bold text-lg text-foreground">{plan.dailyGoal}</p>
                <p className="text-xs text-muted-foreground">每日目标</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-foreground">{plan.duration}</p>
                <p className="text-xs text-muted-foreground">天数</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-foreground">{plan.words.length}</p>
                <p className="text-xs text-muted-foreground">词汇</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${plan.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">进度: {plan.progress}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {plans.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">暂无学习计划</p>
        </div>
      )}
    </div>
  );
}
