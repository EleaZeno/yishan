import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Trash2, Shield, AlertCircle } from 'lucide-react';

interface PrivacySettings {
  dataCollection: boolean;
  analyticsTracking: boolean;
  shareProgress: boolean;
  publicProfile: boolean;
  allowComments: boolean;
  dataRetention: number; // days
}

export default function PrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings>(() => {
    const saved = localStorage.getItem('privacySettings');
    return saved ? JSON.parse(saved) : {
      dataCollection: false,
      analyticsTracking: false,
      shareProgress: false,
      publicProfile: false,
      allowComments: false,
      dataRetention: 365,
    };
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('privacySettings', JSON.stringify(settings));
  }, [settings]);

  const toggleSetting = (key: keyof PrivacySettings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const deleteAllData = () => {
    if (confirm('确定要删除所有数据？此操作不可撤销！')) {
      localStorage.clear();
      alert('所有数据已删除');
      window.location.reload();
    }
  };

  return React.createElement('div', { className: 'space-y-6 pb-20' }, [
    // Header
    React.createElement('div', { key: 'header' }, [
      React.createElement('h1', { key: 'h1', className: 'text-3xl font-black tracking-tight' }, '🔒 隐私设置'),
      React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, '管理你的数据和隐私'),
    ]),

    // Privacy Notice
    React.createElement('div', { key: 'notice', className: 'bg-blue-50 rounded-2xl p-4 border border-blue-200' }, [
      React.createElement('div', { key: 'header', className: 'flex items-start gap-2 mb-2' }, [
        React.createElement(Shield, { key: 'i', size: 20, className: 'text-blue-600 flex-shrink-0 mt-0.5' }),
        React.createElement('div', { key: 'text' }, [
          React.createElement('p', { key: 't', className: 'font-bold text-blue-900' }, '你的数据安全'),
          React.createElement('p', { key: 'd', className: 'text-sm text-blue-700 mt-1' }, 
            '所有数据存储在你的浏览器本地。我们不会收集、存储或分享你的个人学习数据。'
          ),
        ]),
      ]),
    ]),

    // Data Collection
    React.createElement('div', { key: 'section1', className: 'bg-white rounded-2xl p-4 border border-slate-200 space-y-3' }, [
      React.createElement('p', { key: 'title', className: 'font-bold text-lg' }, '📊 数据收集'),
      React.createElement('div', { key: 's1', className: 'flex items-center justify-between' }, [
        React.createElement('div', { key: 'l' }, [
          React.createElement('p', { key: 't', className: 'font-bold' }, '分析追踪'),
          React.createElement('p', { key: 'd', className: 'text-xs text-muted-foreground' }, '允许收集使用统计数据'),
        ]),
        React.createElement('button', {
          key: 'toggle',
          onClick: () => toggleSetting('analyticsTracking'),
          className: `w-12 h-6 rounded-full transition-colors ${settings.analyticsTracking ? 'bg-indigo-500' : 'bg-slate-300'}`
        }),
      ]),
      React.createElement('div', { key: 's2', className: 'flex items-center justify-between' }, [
        React.createElement('div', { key: 'l' }, [
          React.createElement('p', { key: 't', className: 'font-bold' }, '数据收集'),
          React.createElement('p', { key: 'd', className: 'text-xs text-muted-foreground' }, '允许收集应用使用数据'),
        ]),
        React.createElement('button', {
          key: 'toggle',
          onClick: () => toggleSetting('dataCollection'),
          className: `w-12 h-6 rounded-full transition-colors ${settings.dataCollection ? 'bg-indigo-500' : 'bg-slate-300'}`
        }),
      ]),
    ]),

    // Sharing Settings
    React.createElement('div', { key: 'section2', className: 'bg-white rounded-2xl p-4 border border-slate-200 space-y-3' }, [
      React.createElement('p', { key: 'title', className: 'font-bold text-lg' }, '👥 分享设置'),
      React.createElement('div', { key: 's1', className: 'flex items-center justify-between' }, [
        React.createElement('div', { key: 'l' }, [
          React.createElement('p', { key: 't', className: 'font-bold' }, '分享学习进度'),
          React.createElement('p', { key: 'd', className: 'text-xs text-muted-foreground' }, '允许分享成就和进度'),
        ]),
        React.createElement('button', {
          key: 'toggle',
          onClick: () => toggleSetting('shareProgress'),
          className: `w-12 h-6 rounded-full transition-colors ${settings.shareProgress ? 'bg-indigo-500' : 'bg-slate-300'}`
        }),
      ]),
      React.createElement('div', { key: 's2', className: 'flex items-center justify-between' }, [
        React.createElement('div', { key: 'l' }, [
          React.createElement('p', { key: 't', className: 'font-bold' }, '公开个人资料'),
          React.createElement('p', { key: 'd', className: 'text-xs text-muted-foreground' }, '允许其他用户查看你的资料'),
        ]),
        React.createElement('button', {
          key: 'toggle',
          onClick: () => toggleSetting('publicProfile'),
          className: `w-12 h-6 rounded-full transition-colors ${settings.publicProfile ? 'bg-indigo-500' : 'bg-slate-300'}`
        }),
      ]),
      React.createElement('div', { key: 's3', className: 'flex items-center justify-between' }, [
        React.createElement('div', { key: 'l' }, [
          React.createElement('p', { key: 't', className: 'font-bold' }, '允许评论'),
          React.createElement('p', { key: 'd', className: 'text-xs text-muted-foreground' }, '允许其他用户评论你的内容'),
        ]),
        React.createElement('button', {
          key: 'toggle',
          onClick: () => toggleSetting('allowComments'),
          className: `w-12 h-6 rounded-full transition-colors ${settings.allowComments ? 'bg-indigo-500' : 'bg-slate-300'}`
        }),
      ]),
    ]),

    // Data Retention
    React.createElement('div', { key: 'section3', className: 'bg-white rounded-2xl p-4 border border-slate-200 space-y-3' }, [
      React.createElement('p', { key: 'title', className: 'font-bold text-lg' }, '⏰ 数据保留'),
      React.createElement('div', { key: 'desc', className: 'text-sm text-muted-foreground mb-2' }, 
        '选择多久后自动删除旧的学习记录'
      ),
      React.createElement('select', {
        key: 'select',
        value: settings.dataRetention,
        onChange: (e: any) => setSettings({ ...settings, dataRetention: parseInt(e.target.value) }),
        className: 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
      }, [
        React.createElement('option', { key: '30', value: 30 }, '30 天'),
        React.createElement('option', { key: '90', value: 90 }, '90 天'),
        React.createElement('option', { key: '180', value: 180 }, '180 天'),
        React.createElement('option', { key: '365', value: 365 }, '1 年'),
        React.createElement('option', { key: '0', value: 0 }, '永久保留'),
      ]),
    ]),

    // Danger Zone
    React.createElement('div', { key: 'danger', className: 'bg-red-50 rounded-2xl p-4 border border-red-200 space-y-3' }, [
      React.createElement('div', { key: 'header', className: 'flex items-center gap-2 mb-2' }, [
        React.createElement(AlertCircle, { key: 'i', size: 20, className: 'text-red-600' }),
        React.createElement('p', { key: 't', className: 'font-bold text-red-900' }, '⚠️ 危险区域'),
      ]),
      React.createElement('button', {
        key: 'delete',
        onClick: deleteAllData,
        className: 'w-full bg-red-600 text-white rounded-lg py-2 font-bold hover:bg-red-700 transition-colors'
      }, '🗑️ 删除所有数据'),
      React.createElement('p', { key: 'warning', className: 'text-xs text-red-700' }, 
        '此操作将永久删除所有学习数据。此操作不可撤销。'
      ),
    ]),
  ]);
}
