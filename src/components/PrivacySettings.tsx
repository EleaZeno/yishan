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

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">🔒 隐私设置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理你的数据和隐私</p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <div className="flex items-start gap-2 mb-2">
          <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-900">你的数据安全</p>
            <p className="text-sm text-blue-700 mt-1">
              所有数据存储在你的浏览器本地。我们不会收集、存储或分享你的个人学习数据。
            </p>
          </div>
        </div>
      </div>

      {/* Data Collection */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
        <p className="font-bold text-lg">📊 数据收集</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">分析追踪</p>
            <p className="text-xs text-muted-foreground">允许收集使用统计数据</p>
          </div>
          <button
            onClick={() => toggleSetting('analyticsTracking')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.analyticsTracking ? 'bg-indigo-500' : 'bg-slate-300'}`}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">数据收集</p>
            <p className="text-xs text-muted-foreground">允许收集应用使用数据</p>
          </div>
          <button
            onClick={() => toggleSetting('dataCollection')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.dataCollection ? 'bg-indigo-500' : 'bg-slate-300'}`}
          />
        </div>
      </div>

      {/* Sharing Settings */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
        <p className="font-bold text-lg">👥 分享设置</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">分享学习进度</p>
            <p className="text-xs text-muted-foreground">允许分享成就和进度</p>
          </div>
          <button
            onClick={() => toggleSetting('shareProgress')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.shareProgress ? 'bg-indigo-500' : 'bg-slate-300'}`}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">公开个人资料</p>
            <p className="text-xs text-muted-foreground">允许其他用户查看你的资料</p>
          </div>
          <button
            onClick={() => toggleSetting('publicProfile')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.publicProfile ? 'bg-indigo-500' : 'bg-slate-300'}`}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold">允许评论</p>
            <p className="text-xs text-muted-foreground">允许其他用户评论你的内容</p>
          </div>
          <button
            onClick={() => toggleSetting('allowComments')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.allowComments ? 'bg-indigo-500' : 'bg-slate-300'}`}
          />
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
        <p className="font-bold text-lg">⏰ 数据保留</p>
        <div className="text-sm text-muted-foreground mb-2">
          选择多久后自动删除旧的学习记录
        </div>
        <select
          value={settings.dataRetention}
          onChange={(e: any) => setSettings({ ...settings, dataRetention: parseInt(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value={30}>30 天</option>
          <option value={90}>90 天</option>
          <option value={180}>180 天</option>
          <option value={365}>1 年</option>
          <option value={0}>永久保留</option>
        </select>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-2xl p-4 border border-red-200 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={20} className="text-red-600" />
          <p className="font-bold text-red-900">⚠️ 危险区域</p>
        </div>
        <button
          onClick={deleteAllData}
          className="w-full bg-red-600 text-white rounded-lg py-2 font-bold hover:bg-red-700 transition-colors"
        >
          🗑️ 删除所有数据
        </button>
        <p className="text-xs text-red-700">
          此操作将永久删除所有学习数据。此操作不可撤销。
        </p>
      </div>
    </div>
  );
}
