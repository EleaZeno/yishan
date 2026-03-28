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
        { id: 'diagnose', label: '能力诊断', icon: GraduationCap, color: 'text-rose-500', bg: 'bg-rose-100' },
        { id: 'analytics', label: '学习分析', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-100' },
        { id: 'plans', label: '学习计划', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-100' },
        { id: 'history', label: '学习历史', icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-100' },
      ]
    },
    {
      title: '成就与互动',
      items: [
        { id: 'achievements', label: '我的成就', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100' },
        { id: 'sharing', label: '成就分享', icon: Share2, color: 'text-pink-500', bg: 'bg-pink-100' },
        { id: 'community', label: '词库社区', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-100' },
      ]
    },
    {
      title: '设置与管理',
      items: [
        { id: 'reminders', label: '学习提醒', icon: Bell, color: 'text-orange-500', bg: 'bg-orange-100' },
        { id: 'backup', label: '云端备份', icon: Cloud, color: 'text-cyan-500', bg: 'bg-cyan-100' },
        { id: 'privacy', label: '隐私设置', icon: Lock, color: 'text-slate-500', bg: 'bg-slate-100' },
        { id: 'admin', label: '后台管理', icon: Settings, color: 'text-rose-500', bg: 'bg-rose-100' },
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* User Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
          {user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black">{user?.email || '游客用户'}</h2>
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
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              {group.items.map((item, j) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left ${
                      j !== group.items.length - 1 ? 'border-b border-slate-50' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className="flex-1 font-bold text-slate-700">{item.label}</span>
                    <ChevronRight size={20} className="text-slate-300" />
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
          className="w-full bg-white rounded-2xl p-4 text-destructive font-bold flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors border border-destructive/10"
        >
          <LogOut size={20} />
          退出登录
        </button>
      )}
    </div>
  );
}
