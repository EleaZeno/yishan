import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, X, Plus, Calendar, Repeat, Volume2, VolumeX } from 'lucide-react';

interface Reminder {
  id: string;
  type: 'daily' | 'weekly' | 'custom';
  time: string;
  message: string;
  enabled: boolean;
  daysOfWeek?: number[];
  soundEnabled: boolean;
}

const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];

export default function ReminderSystem() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        type: 'daily',
        time: '09:00',
        message: '早上好！开始今天的学习吧 ☀️',
        enabled: true,
        soundEnabled: true,
      },
      {
        id: '2',
        type: 'daily',
        time: '14:00',
        message: '下午复习时间到了 📚',
        enabled: true,
        soundEnabled: true,
      },
      {
        id: '3',
        type: 'daily',
        time: '20:00',
        message: '晚上学习时间，坚持就是胜利 💪',
        enabled: true,
        soundEnabled: true,
      },
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    time: '09:00',
    message: '',
    type: 'daily' as const,
    soundEnabled: true,
    selectedDays: [1, 2, 3, 4, 5],
  });

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [reminders]);

  const addReminder = () => {
    if (!newReminder.message.trim()) return;

    const reminder: Reminder = {
      id: crypto.randomUUID(),
      type: newReminder.type,
      time: newReminder.time,
      message: newReminder.message,
      enabled: true,
      soundEnabled: newReminder.soundEnabled,
      daysOfWeek: newReminder.type === 'weekly' ? newReminder.selectedDays : undefined,
    };

    setReminders([...reminders, reminder]);
    setNewReminder({ time: '09:00', message: '', type: 'daily', soundEnabled: true, selectedDays: [1, 2, 3, 4, 5] });
    setShowForm(false);
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const toggleSound = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, soundEnabled: !r.soundEnabled } : r
    ));
  };

  const deleteReminder = (id: string) => {
    if (confirm('确定要删除此提醒？')) {
      setReminders(reminders.filter(r => r.id !== id));
    }
  };

  const sendTestNotification = (reminder: Reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 忆闪提醒', {
        body: reminder.message,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%234f46e5" width="100" height="100"/><text x="50" y="50" font-size="70" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="central">Yi</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%234f46e5" width="100" height="100"/></svg>',
      });
    } else {
      alert('请先允许浏览器通知权限');
    }
  };

  const enabledCount = reminders.filter(r => r.enabled).length;

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '🔔 学习提醒'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, '设置学习提醒，养成好习惯'),
    ]),

    // Stats
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-2 gap-3' }, [
      React.createElement('div', {
        key: 's1',
        className: 'bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg'
      }, [
        React.createElement('div', { key: 'top', className: 'flex items-center justify-between' }, [
          React.createElement('div', { key: 'info' }, [
            React.createElement('p', { key: 'l', className: 'text-white/70 text-xs font-bold uppercase' }, '已启用'),
            React.createElement('p', { key: 'v', className: 'text-3xl font-black mt-1' }, enabledCount),
          ]),
          React.createElement('div', {
            key: 'icon',
            className: 'w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'
          }, React.createElement(Bell, { size: 24, className: 'text-white' })),
        ]),
      ]),
      React.createElement('div', {
        key: 's2',
        className: 'bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg'
      }, [
        React.createElement('div', { key: 'top', className: 'flex items-center justify-between' }, [
          React.createElement('div', { key: 'info' }, [
            React.createElement('p', { key: 'l', className: 'text-white/70 text-xs font-bold uppercase' }, '总提醒'),
            React.createElement('p', { key: 'v', className: 'text-3xl font-black mt-1' }, reminders.length),
          ]),
          React.createElement('div', {
            key: 'icon',
            className: 'w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center'
          }, React.createElement(Clock, { size: 24, className: 'text-white' })),
        ]),
      ]),
    ]),

    // Add Button
    React.createElement('button', {
      key: 'btn',
      onClick: () => setShowForm(!showForm),
      className: 'w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-4 font-bold hover:shadow-xl hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2'
    }, [
      React.createElement(Plus, { key: 'i', size: 20 }),
      '添加提醒',
    ]),

    // Form
    showForm && React.createElement('div', {
      key: 'form',
      className: 'bg-white rounded-2xl p-5 border border-slate-200 shadow-lg space-y-4'
    }, [
      React.createElement('div', { key: 'type' }, [
        React.createElement('label', { key: 'l', className: 'text-sm font-bold text-slate-700 block mb-2' }, '提醒类型'),
        React.createElement('div', { key: 'options', className: 'grid grid-cols-3 gap-2' }, [
          React.createElement('button', {
            key: 'daily',
            onClick: () => setNewReminder({ ...newReminder, type: 'daily' }),
            className: `py-2 rounded-xl font-bold text-sm transition-colors ${newReminder.type === 'daily' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
          }, '每日'),
          React.createElement('button', {
            key: 'weekly',
            onClick: () => setNewReminder({ ...newReminder, type: 'weekly' }),
            className: `py-2 rounded-xl font-bold text-sm transition-colors ${newReminder.type === 'weekly' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
          }, '每周'),
          React.createElement('button', {
            key: 'custom',
            onClick: () => setNewReminder({ ...newReminder, type: 'custom' }),
            className: `py-2 rounded-xl font-bold text-sm transition-colors ${newReminder.type === 'custom' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
          }, '自定义'),
        ]),
      ]),

      newReminder.type === 'weekly' && React.createElement('div', { key: 'days' }, [
        React.createElement('label', { key: 'l', className: 'text-sm font-bold text-slate-700 block mb-2' }, '选择日期'),
        React.createElement('div', { key: 'options', className: 'flex gap-2' },
          daysOfWeek.map((day, i) =>
            React.createElement('button', {
              key: i,
              onClick: () => {
                const newDays = newReminder.selectedDays.includes(i)
                  ? newReminder.selectedDays.filter(d => d !== i)
                  : [...newReminder.selectedDays, i];
                setNewReminder({ ...newReminder, selectedDays: newDays });
              },
              className: `w-10 h-10 rounded-xl font-bold text-sm transition-colors ${newReminder.selectedDays.includes(i) ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
            }, day)
          )
        ),
      ]),

      React.createElement('div', { key: 'time' }, [
        React.createElement('label', { key: 'l', className: 'text-sm font-bold text-slate-700 block mb-2' }, '提醒时间'),
        React.createElement('input', {
          key: 'i',
          type: 'time',
          value: newReminder.time,
          onChange: (e: any) => setNewReminder({ ...newReminder, time: e.target.value }),
          className: 'w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg font-bold text-center'
        }),
      ]),

      React.createElement('div', { key: 'message' }, [
        React.createElement('label', { key: 'l', className: 'text-sm font-bold text-slate-700 block mb-2' }, '提醒内容'),
        React.createElement('textarea', {
          key: 'i',
          placeholder: '例如：该学习了！',
          value: newReminder.message,
          onChange: (e: any) => setNewReminder({ ...newReminder, message: e.target.value }),
          className: 'w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none h-20'
        }),
      ]),

      React.createElement('div', { key: 'sound', className: 'flex items-center justify-between p-3 bg-slate-50 rounded-xl' }, [
        React.createElement('div', { key: 'left', className: 'flex items-center gap-2' }, [
          React.createElement(newReminder.soundEnabled ? Volume2 : VolumeX, { key: 'i', size: 20, className: 'text-slate-600' }),
          React.createElement('span', { key: 't', className: 'font-bold text-slate-700' }, '声音提醒'),
        ]),
        React.createElement('button', {
          key: 'toggle',
          onClick: () => setNewReminder({ ...newReminder, soundEnabled: !newReminder.soundEnabled }),
          className: `w-12 h-6 rounded-full transition-colors ${newReminder.soundEnabled ? 'bg-indigo-500' : 'bg-slate-300'}`
        }),
      ]),

      React.createElement('button', {
        key: 'submit',
        onClick: addReminder,
        className: 'w-full bg-indigo-600 text-white rounded-xl py-3 font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25'
      }, '添加提醒'),
    ]),

    // Reminders List
    React.createElement('div', { key: 'list', className: 'space-y-3' },
      reminders.map((reminder, i) =>
        React.createElement('div', {
          key: i,
          className: `bg-white rounded-2xl border-2 overflow-hidden transition-all ${reminder.enabled ? 'border-indigo-200 shadow-lg shadow-indigo-500/10' : 'border-slate-200 opacity-60'}`
        }, [
          React.createElement('div', {
            key: 'content',
            className: `p-5 ${reminder.enabled ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : 'bg-slate-50'}`
          }, [
            React.createElement('div', { key: 'header', className: 'flex items-start justify-between mb-3' }, [
              React.createElement('div', { key: 'left', className: 'flex items-center gap-3' }, [
                React.createElement('div', {
                  key: 'time',
                  className: `w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${reminder.enabled ? 'bg-indigo-500 text-white' : 'bg-slate-300 text-white'}`
                }, reminder.time),
                React.createElement('div', { key: 'info' }, [
                  React.createElement('p', { key: 'msg', className: 'font-bold text-slate-800' }, reminder.message),
                  React.createElement('div', { key: 'meta', className: 'flex items-center gap-2 mt-1' }, [
                    React.createElement('span', {
                      key: 'type',
                      className: 'text-xs px-2 py-0.5 rounded-lg bg-white/80 text-slate-600 font-bold'
                    }, reminder.type === 'daily' ? '每日' : reminder.type === 'weekly' ? '每周' : '自定义'),
                    reminder.daysOfWeek && React.createElement('span', {
                      key: 'days',
                      className: 'text-xs text-slate-500'
                    }, reminder.daysOfWeek.map(d => daysOfWeek[d]).join(', ')),
                  ]),
                ]),
              ]),
              React.createElement('div', { key: 'actions', className: 'flex gap-1' }, [
                React.createElement('button', {
                  key: 'sound',
                  onClick: () => toggleSound(reminder.id),
                  className: `p-2 rounded-xl transition-colors ${reminder.soundEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`
                }, reminder.soundEnabled ? React.createElement(Volume2, { size: 18 }) : React.createElement(VolumeX, { size: 18 })),
                React.createElement('button', {
                  key: 'toggle',
                  onClick: () => toggleReminder(reminder.id),
                  className: `p-2 rounded-xl transition-colors ${reminder.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`
                }, React.createElement(CheckCircle, { size: 18 })),
                React.createElement('button', {
                  key: 'delete',
                  onClick: () => deleteReminder(reminder.id),
                  className: 'p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors'
                }, React.createElement(X, { size: 18 })),
              ]),
            ]),

            React.createElement('button', {
              key: 'test',
              onClick: () => sendTestNotification(reminder),
              className: 'w-full mt-3 py-2 bg-white rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors border border-indigo-200'
            }, '🔔 测试提醒'),
          ]),
        ])
      )
    ),

    // Empty State
    reminders.length === 0 && !showForm && React.createElement('div', {
      key: 'empty',
      className: 'text-center py-16'
    }, [
      React.createElement('div', {
        key: 'icon',
        className: 'w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4'
      }, React.createElement(Bell, { size: 40, className: 'text-slate-400' })),
      React.createElement('p', { key: 't', className: 'text-lg font-bold text-slate-700' }, '还没有提醒'),
      React.createElement('p', { key: 'd', className: 'text-sm text-slate-500 mt-2' }, '添加提醒，养成学习习惯'),
    ]),

    // Info
    React.createElement('div', {
      key: 'info',
      className: 'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200'
    }, [
      React.createElement('p', { key: 't', className: 'font-bold text-blue-900 mb-2' }, '💡 提示'),
      React.createElement('p', { key: 'd', className: 'text-sm text-blue-700' }, '需要浏览器通知权限才能接收提醒。请在浏览器设置中允许通知。'),
    ]),
  ]);
}
