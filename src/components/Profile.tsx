import React from 'react';
import { User } from '../types';
import { 
  TrendingUp, Calendar, Trophy, Bell, Cloud, 
  BookOpen, Share2, Lock, Settings, ChevronRight, LogOut, GraduationCap
} from 'lucide-react';

interface ProfileProps {
  user: User | null;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export default function Profile({ user, onNavigate, onLogout }: ProfileProps) {
  const menuGroups = [
    {
      title: '学习与分析',
      items: [
        { id: 'diagnose', label: '能力诊断', icon: GraduationCap, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-500/20' },
        { id: 'analytics', label: '学习分析', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
        { id: 'plans', label: '学习计划', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
        { id: 'history', label: '学习历史', icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/20' },
      ]
    },
    {
      title: '成就与互动',
      items: [
        { id: 'achievements', label: '我的成就', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20' },
        { id: 'sharing', label: '成就分享', icon: Share2, color: 'text-pink-500', bg: 'bg-pink-100 dark:bg-pink-500/20' },
        { id: 'community', label: '词库社区', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
      ]
    },
    {
      title: '设置与管理',
      items: [
        { id: 'reminders', label: '学习提醒', icon: Bell, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20' },
        { id: 'backup', label: '云端备份', icon: Cloud, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-500/20' },
        { id: 'privacy', label: '隐私设置', icon: Lock, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-500/20' },
        { id: 'admin', label: '后台管理', icon: Settings, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-500/20' },
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto animate-in fade-in duration-500">
      {/* User Card */}
      <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
          {user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black text-foreground">{user?.email || '游客用户'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {user ? '已开启云端同步' : '登录以同步学习进度'}
          </p>
        </div>
      </div>

      {/* Menu Groups */}
      <div className="space-y-6">
        {menuGroups.map((group, i) => (
          <div key={i} className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4">
              {group.title}
            </h3>
            <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm">
              {group.items.map((item, j) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
                      j !== group.items.length - 1 ? 'border-b border-border/50' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className="flex-1 font-bold text-foreground">{item.label}</span>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      {user && (
        <button
          onClick={onLogout}
          className="w-full bg-card rounded-2xl p-4 text-destructive font-bold flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors border border-destructive/20 shadow-sm"
        >
          <LogOut size={20} />
          退出登录
        </button>
      )}
    </div>
  );
}
