
import React from 'react';
import { Stats, Word } from '../types';
import StatsChart from './StatsChart';
import { WifiOff, Activity } from 'lucide-react';

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
        <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100">
          <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">衰减中的连接</p>
          <h3 className="text-4xl font-bold">{stats.fadingSignals}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">总探测信息位</p>
          <h3 className="text-3xl font-bold text-slate-800">{stats.totalSignals}</h3>
        </div>
         <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">已稳定信号</p>
          <h3 className="text-3xl font-bold text-emerald-500">{stats.stabilizedSignals}</h3>
        </div>
         <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">平均连接强度</p>
          <h3 className="text-3xl font-bold text-indigo-500">{stats.connectivity}%</h3>
        </div>
      </div>

      <StatsChart words={wordsForChart} />

      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                  <Activity size={24} />
              </div>
              <div>
                  <h3 className="text-lg font-bold">认知流环境</h3>
                  <p className="text-slate-400 text-sm mt-1">
                      {stats.fadingSignals > 0 ? `当前有 ${stats.fadingSignals} 个信号点需要再次暴露以防止衰减。` : "当前认知环境处于高稳定状态。"}
                  </p>
              </div>
          </div>
          <button 
              onClick={onStartStudy}
              className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 w-full md:w-auto"
          >
              进入交互流
          </button>
      </div>
    </div>
  );
};

export default Dashboard;
