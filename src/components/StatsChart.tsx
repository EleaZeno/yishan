
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Word } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="shadow-sm h-80 w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-black text-foreground tracking-tight">贝叶斯记忆层级</CardTitle>
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Confidence Interval Matrix</span>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 11, fill: 'currentColor', fontWeight: 800}} 
              className="text-muted-foreground"
            />
            <YAxis hide />
            <Tooltip 
              cursor={{fill: 'var(--muted)'}}
              contentStyle={{borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--card-foreground)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '12px'}}
            />
            <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StatsChart;

