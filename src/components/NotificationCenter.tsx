import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, Clock, BookOpen, Trophy, Zap,
  CheckCircle2, X, Settings, Volume2, VolumeX,
  ChevronRight, Calendar, RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { db } from '../services/storage';

interface NotificationItem {
  id: string;
  type: 'review' | 'achievement' | 'reminder' | 'sync' | 'tip';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationCenterProps {
  wordsCount?: number;
  dueCount?: number;
  streakDays?: number;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'welcome',
    type: 'tip',
    title: '欢迎使用忆闪',
    body: '开启你的科学记忆之旅，每天坚持学习，效果远超传统背诵。',
    timestamp: Date.now() - 3600000,
    read: true,
  },
];

// ============================================================
// Push Notification Manager
// ============================================================
class PushNotificationManager {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async init(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      
      // Check if push permission granted
      const permission = Notification.permission;
      if (permission === 'granted') {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async scheduleReminder(time: string, message: string): Promise<void> {
    const stored = localStorage.getItem('yishan_reminders') || '[]';
    const reminders = JSON.parse(stored);
    reminders.push({ time, message, enabled: true, id: crypto.randomUUID() });
    localStorage.setItem('yishan_reminders', JSON.stringify(reminders));
  }

  getReminders(): { time: string; message: string; enabled: boolean; id: string }[] {
    const stored = localStorage.getItem('yishan_reminders') || '[]';
    return JSON.parse(stored);
  }

  removeReminder(id: string): void {
    const reminders = this.getReminders().filter(r => r.id !== id);
    localStorage.setItem('yishan_reminders', JSON.stringify(reminders));
  }
}

export const pushManager = new PushNotificationManager();

// ============================================================
// Notification Toast (in-app)
// ============================================================
interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'achievement';
  title: string;
  body?: string;
  duration?: number;
  icon?: React.ReactNode;
}

const toastListeners: ((toast: ToastNotification) => void)[] = [];

export const showToast = (toast: Omit<ToastNotification, 'id'>) => {
  const id = crypto.randomUUID();
  toastListeners.forEach(listener => listener({ ...toast, id }));
};

// ============================================================
// Toast Container
// ============================================================
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const listener = (toast: ToastNotification) => {
      setToasts(prev => [...prev, toast]);
      
      // Auto dismiss
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration || 4000);
    };

    toastListeners.push(listener);
    return () => {
      const idx = toastListeners.indexOf(listener);
      if (idx > -1) toastListeners.splice(idx, 1);
    };
  }, []);

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const bgColors: Record<string, string> = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    achievement: 'bg-gradient-to-r from-indigo-500 to-purple-600',
  };

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 size={20} />,
    warning: <Bell size={20} />,
    info: <Bell size={20} />,
    achievement: <Trophy size={20} />,
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`${bgColors[toast.type]} text-white rounded-2xl shadow-xl p-4`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">{icons[toast.type]}</div>
              <div className="flex-1">
                <p className="font-bold text-sm">{toast.title}</p>
                {toast.body && <p className="text-xs opacity-90 mt-1">{toast.body}</p>}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================================
// Notification Center (Bell icon panel)
// ============================================================
const NotificationCenter: React.FC<NotificationCenterProps> = ({
  wordsCount = 0,
  dueCount = 0,
  streakDays = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const stored = localStorage.getItem('yishan_notifications');
    return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS;
  });
  const [pushEnabled, setPushEnabled] = useState(Notification.permission === 'granted');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('yishan_sound') !== 'off';
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Save notifications
  useEffect(() => {
    localStorage.setItem('yishan_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Generate periodic review reminders
  useEffect(() => {
    if (dueCount > 0 && !notifications.find(n => n.type === 'review' && !n.read)) {
      const reviewNotification: NotificationItem = {
        id: crypto.randomUUID(),
        type: 'review',
        title: '📚 该复习了',
        body: `你有 ${dueCount} 个信号节点即将进入遗忘区。`,
        timestamp: Date.now(),
        read: false,
        action: {
          label: '立即复习',
          onClick: () => {
            setIsOpen(false);
            window.dispatchEvent(new CustomEvent('yishan:start-study'));
          },
        },
      };
      setNotifications(prev => [reviewNotification, ...prev.slice(0, 9)]);
    }
  }, [dueCount]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const togglePush = async () => {
    if (pushEnabled) {
      // Can't really disable push, just update state
      setPushEnabled(false);
    } else {
      const granted = await pushManager.requestPermission();
      setPushEnabled(granted);
      if (granted) {
        showToast({ type: 'success', title: '推送通知已开启' });
      }
    }
  };

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('yishan_sound', newVal ? 'on' : 'off');
  };

  const formatTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  const typeIcons: Record<string, React.ReactNode> = {
    review: <BookOpen size={14} className="text-blue-500" />,
    achievement: <Trophy size={14} className="text-amber-500" />,
    reminder: <Bell size={14} className="text-purple-500" />,
    sync: <RefreshCw size={14} className="text-green-500" />,
    tip: <Zap size={14} className="text-indigo-500" />,
  };

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-muted rounded-xl transition-colors"
      >
        {pushEnabled ? <Bell size={20} /> : <BellOff size={20} />}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-hidden"
          >
            <Card className="shadow-xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    通知中心
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex gap-1">
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 hover:bg-muted rounded-lg text-xs text-muted-foreground"
                      title="全部已读"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <button
                      onClick={clearAll}
                      className="p-1.5 hover:bg-muted rounded-lg text-xs text-muted-foreground"
                      title="清空"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Quick Settings */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={togglePush}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      pushEnabled
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {pushEnabled ? <Bell size={12} /> : <BellOff size={12} />}
                    推送
                  </button>
                  <button
                    onClick={toggleSound}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      soundEnabled
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                    声音
                  </button>
                </div>
              </CardHeader>

              <CardContent className="max-h-64 overflow-y-auto p-0">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">暂无通知</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {typeIcons[notif.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm font-medium ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                {formatTime(notif.timestamp)}
                              </span>
                            </div>
                            {notif.body && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {notif.body}
                              </p>
                            )}
                            {notif.action && !notif.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notif.action?.onClick();
                                }}
                                className="mt-2 text-xs text-primary font-medium hover:underline"
                              >
                                {notif.action.label}
                              </button>
                            )}
                          </div>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;
