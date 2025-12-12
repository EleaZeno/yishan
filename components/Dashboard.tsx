import React from 'react';
import { Stats, Word } from '../types';
import StatsChart from './StatsChart';
import { WifiOff } from 'lucide-react';

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
          <div className="bg-orange-50 text-orange-800 px-4 py-3 rounded-xl border border-orange-100 flex items-center gap-2 text-sm">
              <WifiOff size={16} />
              <span>离线模式：您可以继续学习，进度将在恢复网络后自动同步。</span>
          </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
          <p className="text-indigo-100 text-sm font-medium mb-1">待复习</p>
          <h3 className="text-4xl font-bold">{stats.dueToday}</h3>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">总词汇量 (Est.)</p>
          <h3 className="text-3xl font-bold text-gray-800">{stats.totalWords}</h3>
        </div>
         <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">已掌握</p>
          <h3 className="text-3xl font-bold text-emerald-600">{stats.learned}</h3>
        </div>
         <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">记忆留存率</p>
          <h3 className="text-3xl font-bold text-amber-500">{stats.retentionRate}%</h3>
        </div>
      </div>

      <StatsChart words={wordsForChart} />

      <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
              <h3 className="text-lg font-bold text-indigo-900">今日目标</h3>
              <p className="text-indigo-700 mt-1">
                  {stats.dueToday > 0 ? `还有 ${stats.dueToday} 个单词等待巩固。` : "今日任务已完成！"}
              </p>
          </div>
          <button 
              onClick={onStartStudy}
              disabled={stats.dueToday === 0}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md active:scale-95 w-full md:w-auto"
          >
              {stats.dueToday > 0 ? "开始复习" : "再来一组"}
          </button>
      </div>
    </div>
  );
};

export default Dashboard;