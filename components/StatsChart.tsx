import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Word } from '../types';

interface StatsChartProps {
  words: Word[];
}

const StatsChart: React.FC<StatsChartProps> = ({ words }) => {
  // Compute distribution of intervals (Learning, Reviewing, Mastered)
  const data = React.useMemo(() => {
    let newWords = 0;
    let learning = 0; // interval <= 3
    let reviewing = 0; // interval > 3 && <= 14
    let mastered = 0; // interval > 14

    words.forEach(w => {
      if (w.repetitions === 0) newWords++;
      else if (w.interval <= 3) learning++;
      else if (w.interval <= 14) reviewing++;
      else mastered++;
    });

    return [
      { name: '新词', value: newWords, color: '#94a3b8' },
      { name: '学习中', value: learning, color: '#6366f1' },
      { name: '复习中', value: reviewing, color: '#8b5cf6' },
      { name: '已掌握', value: mastered, color: '#10b981' },
    ];
  }, [words]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64 w-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">掌握程度分布</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: '#64748b'}} 
          />
          <YAxis hide />
          <Tooltip 
            cursor={{fill: '#f1f5f9'}}
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
