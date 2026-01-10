
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Word } from '../types';

interface StatsChartProps {
  words: Word[];
}

const StatsChart: React.FC<StatsChartProps> = ({ words }) => {
  // 基于贝叶斯半衰期分布计算
  const data = React.useMemo(() => {
    let fresh = 0;      // 刚加入，尚未交互
    let unstable = 0;   // halflife < 2天 (2880 min)
    let memory = 0;     // halflife < 14天 (20160 min)
    let deepMemory = 0; // halflife >= 14天

    words.forEach(w => {
      if (w.totalExposure === 0) fresh++;
      else if (w.halflife < 2880) unstable++;
      else if (w.halflife < 20160) memory++;
      else deepMemory++;
    });

    return [
      { name: '初识', value: fresh, color: '#94a3b8' },
      { name: '浅层', value: unstable, color: '#f43f5e' },
      { name: '稳固', value: memory, color: '#6366f1' },
      { name: '永久', value: deepMemory, color: '#10b981' },
    ];
  }, [words]);

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-80 w-full">
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-800 tracking-tight">贝叶斯记忆层级</h3>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Confidence Interval Matrix</span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 800}} 
          />
          <YAxis hide />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '12px'}}
          />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsChart;
