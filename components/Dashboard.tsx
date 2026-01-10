
import React from 'react';
import { Stats, Word } from '../types';
import StatsChart from './StatsChart';
import { WifiOff, Activity, ShieldCheck } from 'lucide-react';

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
          <div className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl border border-slate-200 flex items-center gap-2 text-sm">
              <WifiOff size={16} />
              <span>本地暂存模式：交互数据将在连接建立后同步至云端。</span>
          </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-20"><ShieldCheck size={40} /></div>
          <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">待校准信号</p>
          <h3 className="text-4xl font-black">{stats.fadingSignals}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">总词条负载</p>
          <h3 className="text-3xl font-black text-slate-800">{stats.totalSignals}</h3>
        </div>
         <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">预测记忆留存</p>
          <h3 className="text-3xl font-black text-emerald-500">{stats.averageRecallProb}%</h3>
        </div>
         <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">高稳定性占比</p>
          <h3 className="text-3xl font-black text-indigo-500">{stats.connectivity}%</h3>
        </div>
      </div>

      <StatsChart words={wordsForChart} />

      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
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
          <button 
              onClick={onStartStudy}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-900/20 active:scale-95 w-full md:w-auto text-lg"
          >
              启动交互流
          </button>
      </div>
    </div>
  );
};

export default Dashboard;
