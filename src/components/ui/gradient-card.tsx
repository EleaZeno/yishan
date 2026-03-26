import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GradientCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  gradient?: 'primary' | 'emerald' | 'amber' | 'purple' | 'rose';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const gradients = {
  primary: 'from-indigo-500 via-purple-500 to-pink-500',
  emerald: 'from-emerald-400 via-teal-500 to-cyan-500',
  amber: 'from-amber-400 via-orange-500 to-red-500',
  purple: 'from-purple-500 via-violet-500 to-indigo-500',
  rose: 'from-rose-400 via-pink-500 to-purple-500',
};

export default function GradientCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'primary',
  trend,
  trendValue,
}: GradientCardProps) {
  return React.createElement('div', {
    className: `relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradients[gradient]} p-6 text-white shadow-xl`
  }, [
    // Background decoration
    React.createElement('div', {
      key: 'bg',
      className: 'absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16'
    }),
    
    // Icon
    Icon && React.createElement('div', {
      key: 'icon',
      className: 'absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg'
    }, React.createElement(Icon, { size: 24, className: 'text-white' })),
    
    // Content
    React.createElement('div', { key: 'content', className: 'relative z-10' }, [
      React.createElement('p', {
        key: 'title',
        className: 'text-white/80 text-xs font-bold uppercase tracking-widest mb-2'
      }, title),
      
      React.createElement('div', {
        key: 'value',
        className: 'flex items-end gap-2'
      }, [
        React.createElement('span', {
          key: 'v',
          className: 'text-4xl font-black tracking-tight'
        }, value),
        
        subtitle && React.createElement('span', {
          key: 'sub',
          className: 'text-white/70 text-sm font-medium mb-1'
        }, subtitle),
      ]),
      
      trend && React.createElement('div', {
        key: 'trend',
        className: `flex items-center gap-1 mt-2 text-sm font-bold ${trend === 'up' ? 'text-emerald-300' : trend === 'down' ? 'text-red-300' : 'text-white/60'}`
      }, [
        React.createElement('span', { key: 'arrow' }, trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'),
        trendValue && React.createElement('span', { key: 'tv' }, trendValue),
      ]),
    ]),
  ]);
}
