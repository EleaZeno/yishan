
import React from 'react';
import { Stats, Word } from '../types';
import StatsChart from './StatsChart';
import { WifiOff, Activity, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  stats: Stats;
  wordsForChart: Word[];
  isOnline: boolean;
  onStartStudy: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, wordsForChart, isOnline, onStartStudy }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {!isOnline && (
          <div className="bg-muted text-muted-foreground px-4 py-3 rounded-xl border flex items-center gap-2 text-sm">
              <WifiOff size={16} />
              <span>本地暂存模式：交互数据将在连接建立后同步至云端。</span>
          </div>
      )}

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

        <Card className="shadow-sm">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">总词条负载</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <h3 className="text-3xl font-black text-foreground">{stats.totalSignals}</h3>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">预测记忆留存</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <h3 className="text-3xl font-black text-emerald-500">{stats.averageRecallProb}%</h3>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">高稳定性占比</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <h3 className="text-3xl font-black text-indigo-500">{stats.connectivity}%</h3>
          </CardContent>
        </Card>
      </div>

      <StatsChart words={wordsForChart} />

      <Card className="bg-slate-900 text-white border-slate-800 rounded-3xl overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <Activity size={32} />
              </div>
              <div>
                  <h3 className="text-xl font-black tracking-tight">贝叶斯自适应环境</h3>
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
              className="px-10 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-900/20 active:scale-95 w-full md:w-auto text-lg"
          >
              启动交互流
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
