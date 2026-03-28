import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { StudentAbility } from '../services/assessment';

interface AbilityRadarProps {
  abilities: StudentAbility;
  size?: number;
}

export default function AbilityRadar({ abilities, size = 250 }: AbilityRadarProps) {
  const data = [
    { subject: '词汇', A: Math.round(abilities.vocabulary * 100), fullMark: 100 },
    { subject: '语法', A: Math.round(abilities.grammar * 100), fullMark: 100 },
    { subject: '阅读', A: Math.round(abilities.reading * 100), fullMark: 100 },
    { subject: '听力', A: Math.round(abilities.listening * 100), fullMark: 100 },
    { subject: '写作', A: Math.round(abilities.writing * 100), fullMark: 100 },
  ];

  return (
    <div style={{ width: '100%', height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Ability" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
