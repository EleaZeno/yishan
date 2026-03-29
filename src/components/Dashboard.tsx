
import React, { useState, useEffect } from 'react';
import { Stats, Word } from '../types';
import StatsChart from './StatsChart';
import { WifiOff, Activity, ShieldCheck, Flame, Target, Zap, ArrowRight, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getWeakPoints } from '../services/assessment';

interface DashboardProps {
  stats: Stats;
  wordsForChart: Word[];
  isOnline: boolean;
  onStartStudy: () => void;
  onNavigateToPractice?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, wordsForChart, isOnline, onStartStudy, onNavigateToPractice }) => {
  // Mock gamification data
  const currentStreak = 12;
  const dailyGoal = 50;
  const dailyProgress = Math.min(stats.totalSignals, dailyGoal);
  const progressPercent = (dailyProgress / dailyGoal) * 100;

  const [weakPoints, setWeakPoints] = useState<any[]>([]);

  useEffect(() => {
    const loadWeak = async () => {
      const points = await getWeakPoints();
      setWeakPoints(points.slice(0, 2)); // Get top 2 weak points for quick access
    };
    loadWeak();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {!isOnline && (
          <div className="bg-muted text-muted-foreground px-4 py-3 rounded-xl border flex items-center gap-2 text-sm">
              <WifiOff size={16} />
              <span>本地暂存模式：交互数据将在连接建立后同步至云端。</span>
          </div>
      )}

      {/* Gamification Header */}
      <div className="flex items-center justify-between bg-card border rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
            <Flame size={24} className="fill-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">当前连续学习</p>
            <h2 className="text-2xl font-black text-foreground">{currentStreak} <span className="text-sm font-bold text-muted-foreground">天</span></h2>
          </div>
        </div>
        <div className="flex-1 max-w-[200px] ml-8 hidden sm:block">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-muted-foreground flex items-center gap-1"><Target size={12}/> 今日目标</span>
            <span className="text-primary">{dailyProgress} / {dailyGoal}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-20"><ShieldCheck size={40} /></div>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest opacity-80">待校准信号</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <h3 className="text-4xl font-black">{stats.fadingSignals}</h3>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-card">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">总词条负载</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <h3 className="text-3xl font-black text-foreground">{stats.totalSignals}</h3>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-card">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">预测记忆留存</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <h3 className="text-3xl font-black text-emerald-500">{stats.averageRecallProb}%</h3>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-card">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">高稳定性占比</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <h3 className="text-3xl font-black text-indigo-500">{stats.connectivity}%</h3>
          </CardContent>
        </Card>
      </div>

      {/* Quick Practice Section */}
      {weakPoints.length > 0 && (
        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="text-indigo-500" size={20} />
              <h3 className="font-bold text-lg">智能推荐复习</h3>
            </div>
            {onNavigateToPractice && (
              <Button variant="ghost" size="sm" onClick={onNavigateToPractice} className="text-muted-foreground text-xs">
                查看全部 <ArrowRight size={14} className="ml-1" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakPoints.map((wp, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border hover:bg-muted transition-colors">
                <div>
                  <p className="font-bold text-sm">{wp.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">掌握度: {Math.round(wp.mastery * 100)}%</p>
                </div>
                {onNavigateToPractice && (
                  <Button size="sm" variant="secondary" onClick={onNavigateToPractice}>
                    去突破
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <StatsChart words={wordsForChart} />

      <Card className="bg-slate-900 dark:bg-slate-950 text-white border-slate-800 rounded-3xl overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-inner">
                  <Zap size={32} className="fill-indigo-400" />
              </div>
              <div>
                  <h3 className="text-xl font-black tracking-tight text-white">贝叶斯自适应环境</h3>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      {stats.fadingSignals > 0 
                        ? `Flux-v5 引擎探测到 ${stats.fadingSignals} 个单词召回概率即将跌破 85% 阈值。` 
                        : "所有已知信号均处于贝叶斯预测的高置信度区间。"}
                  </p>
              </div>
          </div>
          <Button 
              onClick={onStartStudy}
              size="lg"
              className="px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 w-full md:w-auto text-lg"
          >
              启动交互流
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

