import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, X } from 'lucide-react';

interface Reminder {
  id: string;
  type: 'daily' | 'weekly' | 'custom';
  time: string;
  message: string;
  enabled: boolean;
  daysOfWeek?: number[]; // 0-6, 0 = Sunday
}

export default function ReminderSystem() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        type: 'daily',
        time: '09:00',
        message: '早上好！开始今天的学习吧',
        enabled: true,
      },
      {
        id: '2',
        type: 'daily',
        time: '14:00',
        message: '下午复习时间到了',
        enabled: true,
      },
      {
        id: '3',
        type: 'daily',
        time: '20:00',
        message: '晚上学习时间，坚持就是胜利',
        enabled: true,
      },
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    time: '09:00',
    message: '',
    type: 'daily' as const,
  });

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
    
    // 设置浏览器通知权限
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
    };
    
    setReminders([...reminders, reminder]);
    setNewReminder({ time: '09:00', message: '', type: 'daily' });
    setShowForm(false);
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const sendTestNotification = (reminder: Reminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('忆闪提醒', {
        body: reminder.message,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%234f46e5" width="100" height="100"/><text x="50" y="50" font-size="70" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="central">Yi</text></svg>',
      });
    }
  };

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '🔔 学习提醒'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, '设置学习提醒，养成好习惯'),
    ]),

    // Add Reminder Button
    React.createElement('button', {
      key: 'btn',
      onClick: () => setShowForm(!showForm),
      className: 'w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl p-4 font-bold hover:shadow-lg transition-all'
    }, '+ 添加提醒'),

    // Form
    showForm && React.createElement('div', { key: 'form', className: 'bg-white rounded-2xl p-4 border border-slate-200 space-y-3' }, [
      React.createElement('select', {
        key: 'type',
        value: newReminder.type,
        onChange: (e: any) => setNewReminder({ ...newReminder, type: e.target.value }),
        className: 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
      }, [
        React.createElement('option', { key: 'daily', value: 'daily' }, '每日提醒'),
        React.createElement('option', { key: 'weekly', value: 'weekly' }, '每周提醒'),
        React.createElement('option', { key: 'custom', value: 'custom' }, '自定义'),
      ]),
      React.createElement('input', {
        key: 'time',
        type: 'time',
        value: newReminder.time,
        onChange: (e: any) => setNewReminder({ ...newReminder, time: e.target.value }),
        className: 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
      }),
      React.createElement('textarea', {
        key: 'message',
        placeholder: '提醒内容...',
        value: newReminder.message,
        onChange: (e: any) => setNewReminder({ ...newReminder, message: e.target.value }),
        className: 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20'
      }),
      React.createElement('button', {
        key: 'submit',
        onClick: addReminder,
        className: 'w-full bg-indigo-500 text-white rounded-lg py-2 font-bold hover:bg-indigo-600 transition-colors'
      }, '添加'),
    ]),

    // Reminders List
    React.createElement('div', { key: 'list', className: 'space-y-3' },
      reminders.map((reminder, i) =>
        React.createElement('div', { key: i, className: `bg-white rounded-2xl p-4 border border-slate-200 ${!reminder.enabled ? 'opacity-50' : ''}` }, [
          React.createElement('div', { key: 'header', className: 'flex items-start justify-between mb-2' }, [
            React.createElement('div', { key: 'left', className: 'flex-1' }, [
              React.createElement('div', { key: 'time', className: 'flex items-center gap-2 mb-1' }, [
                React.createElement(Clock, { key: 'i', size: 16, className: 'text-indigo-500' }),
                React.createElement('span', { key: 't', className: 'font-bold' }, reminder.time),
                React.createElement('span', { key: 'type', className: 'text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600' }, 
                  reminder.type === 'daily' ? '每日' : reminder.type === 'weekly' ? '每周' : '自定义'
                ),
              ]),
              React.createElement('p', { key: 'msg', className: 'text-sm text-muted-foreground' }, reminder.message),
            ]),
            React.createElement('div', { key: 'actions', className: 'flex gap-2' }, [
              React.createElement('button', {
                key: 'test',
                onClick: () => sendTestNotification(reminder),
                className: 'p-2 hover:bg-slate-100 rounded-lg transition-colors',
                title: '测试通知'
              }, React.createElement(Bell, { size: 16 })),
              React.createElement('button', {
                key: 'toggle',
                onClick: () => toggleReminder(reminder.id),
                className: `p-2 rounded-lg transition-colors ${reminder.enabled ? 'text-emerald-600 hover:bg-emerald-100' : 'text-slate-400 hover:bg-slate-100'}`
              }, React.createElement(CheckCircle, { size: 16 })),
              React.createElement('button', {
                key: 'delete',
                onClick: () => deleteReminder(reminder.id),
                className: 'p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors'
              }, React.createElement(X, { size: 16 })),
            ]),
          ]),
        ])
      )
    ),

    // Empty State
    reminders.length === 0 && !showForm && React.createElement('div', { key: 'empty', className: 'text-center py-12 text-muted-foreground' }, [
      React.createElement('p', { key: 'p', className: 'font-medium' }, '暂无提醒'),
    ]),

    // Info
    React.createElement('div', { key: 'info', className: 'bg-blue-50 rounded-2xl p-4 border border-blue-200 text-sm text-blue-700' }, [
      React.createElement('p', { key: 'p', className: 'font-bold mb-1' }, '💡 提示'),
      React.createElement('p', { key: 'text' }, '需要浏览器通知权限才能接收提醒。请在浏览器设置中允许通知。'),
    ]),
  ]);
}
