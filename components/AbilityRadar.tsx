import React, { useEffect, useRef } from 'react';

interface AbilityRadarProps {
  abilities: {
    vocabulary: number;
    grammar: number;
    reading: number;
    listening: number;
    writing: number;
  };
  size?: number;
}

const ABILITY_LABELS = [
  { key: 'vocabulary', label: '词汇', short: '词' },
  { key: 'grammar', label: '语法', short: '语' },
  { key: 'reading', label: '阅读', short: '读' },
  { key: 'listening', label: '听力', short: '听' },
  { key: 'writing', label: '写作', short: '写' }
];

const COLORS = {
  vocabulary: '#8B5CF6',
  grammar: '#3B82F6',
  reading: '#10B981',
  listening: '#F59E0B',
  writing: '#EF4444'
};

export const AbilityRadar: React.FC<AbilityRadarProps> = ({ abilities, size = 280 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;
    const numPoints = 5;

    // 清空画布
    ctx.clearRect(0, 0, size, size);

    // 绘制背景网格
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;

    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const r = (radius * i) / 5;
      for (let j = 0; j <= numPoints; j++) {
        const angle = (Math.PI * 2 * j) / numPoints - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 绘制轴线
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
      ctx.stroke();
    }

    // 绘制数据区域
    const values = [
      abilities.vocabulary,
      abilities.grammar,
      abilities.reading,
      abilities.listening,
      abilities.writing
    ];

    // 填充区域
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const idx = i % numPoints;
      const angle = (Math.PI * 2 * idx) / numPoints - Math.PI / 2;
      const r = radius * values[idx];
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.fill();

    // 描边
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制数据点
    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
      const r = radius * values[i];
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[ABILITY_LABELS[i].key as keyof typeof COLORS];
      ctx.fill();
    }

    // 绘制标签
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < numPoints; i++) {
      const angle = (Math.PI * 2 * i) / numPoints - Math.PI / 2;
      const labelRadius = radius + 20;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      
      ctx.fillStyle = COLORS[ABILITY_LABELS[i].key as keyof typeof COLORS];
      ctx.fillText(ABILITY_LABELS[i].label, x, y);
    }

  }, [abilities, size]);

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
};

export default AbilityRadar;
