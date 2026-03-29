import React from 'react';
import { User } from '../types';
import { 
  TrendingUp, Calendar, Trophy, Bell, Cloud, 
  BookOpen, Share2, Lock, Settings, ChevronRight, LogOut, GraduationCap, RefreshCw, Moon, Sun
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeProvider';
import { useTranslation } from 'react-i18next';

interface ProfileProps {
  user: User | null;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export default function Profile({ user, onNavigate, onLogout }: ProfileProps) {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const handleClearCache = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      toast('缓存已清除，页面将刷新...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      console.error('Clear cache error:', e);
      toast.error('清除缓存失败');
    }
  };

  const menuItems = [
    { id: 'diagnose', label: '能力诊断', icon: GraduationCap },
    { id: 'analytics', label: '学习分析', icon: TrendingUp },
    { id: 'plans', label: '学习计划', icon: Calendar },
    { id: 'history', label: '学习历史', icon: BookOpen },
    { id: 'achievements', label: '我的成就', icon: Trophy },
    { id: 'sharing', label: '成就分享', icon: Share2 },
    { id: 'community', label: '词库社区', icon: TrendingUp },
    { id: 'reminders', label: '学习提醒', icon: Bell },
    { id: 'backup', label: '云端备份', icon: Cloud },
    { id: 'privacy', label: '隐私设置', icon: Lock },
    { id: 'admin', label: '后台管理', icon: Settings },
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

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="bg-card rounded-2xl p-4 hover:bg-muted/50 transition-colors text-left border border-border shadow-sm flex flex-col gap-2"
            >
              <Icon size={24} className="text-primary" />
              <span className="font-bold text-sm text-foreground">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Language Toggle */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">{t('settings_language')}</span>
            <div className="flex gap-2">
              {[
                { code: 'zh', label: '中文' },
                { code: 'en', label: 'English' },
                { code: 'ja', label: '日本語' },
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    i18n.language === lang.code
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground flex items-center gap-2">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              {t('settings_theme')}
            </span>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    theme === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {t === 'light' ? '浅色' : t === 'dark' ? '深色' : '自动'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleClearCache}
          className="w-full bg-card rounded-2xl p-4 text-amber-600 font-bold flex items-center justify-center gap-2 hover:bg-amber-500/10 transition-colors border border-amber-500/20 shadow-sm"
        >
          <RefreshCw size={20} />
          {t('settings_clear_cache')}
        </button>

        {user && (
          <button
            onClick={onLogout}
            className="w-full bg-card rounded-2xl p-4 text-destructive font-bold flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors border border-destructive/20 shadow-sm"
          >
            <LogOut size={20} />
            {t('settings_logout')}
          </button>
        )}
      </div>
    </div>
  );
}
