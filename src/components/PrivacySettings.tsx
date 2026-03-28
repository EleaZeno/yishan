import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Trash2, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
    toast('确定要删除所有数据？此操作不可撤销！', {
      action: {
        label: '确定',
        onClick: () => {
          localStorage.clear();
          toast.success('所有数据已删除');
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">🔒 隐私设置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理你的数据和隐私</p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/20">
        <div className="flex items-start gap-2 mb-2">
          <Shield size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-400">你的数据安全</p>
            <p className="text-sm text-blue-300 mt-1">
              所有数据存储在你的浏览器本地。我们不会收集、存储或分享你的个人学习数据。
            </p>
          </div>
        </div>
      </div>

      {/* Data Collection */}
      <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
        <p className="font-bold text-lg text-foreground">📊 数据收集</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">分析追踪</p>
            <p className="text-xs text-muted-foreground">允许收集使用统计数据</p>
          </div>
          <button
            onClick={() => toggleSetting('analyticsTracking')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.analyticsTracking ? 'bg-primary' : 'bg-muted'}`}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">数据收集</p>
            <p className="text-xs text-muted-foreground">允许收集应用使用数据</p>
          </div>
          <button
            onClick={() => toggleSetting('dataCollection')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.dataCollection ? 'bg-primary' : 'bg-muted'}`}
          />
        </div>
      </div>

      {/* Sharing Settings */}
      <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
        <p className="font-bold text-lg text-foreground">👥 分享设置</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">分享学习进度</p>
            <p className="text-xs text-muted-foreground">允许分享成就和进度</p>
          </div>
          <button
            onClick={() => toggleSetting('shareProgress')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.shareProgress ? 'bg-primary' : 'bg-muted'}`}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">公开个人资料</p>
            <p className="text-xs text-muted-foreground">允许其他用户查看你的资料</p>
          </div>
          <button
            onClick={() => toggleSetting('publicProfile')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.publicProfile ? 'bg-primary' : 'bg-muted'}`}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">允许评论</p>
            <p className="text-xs text-muted-foreground">允许其他用户评论你的内容</p>
          </div>
          <button
            onClick={() => toggleSetting('allowComments')}
            className={`w-12 h-6 rounded-full transition-colors ${settings.allowComments ? 'bg-primary' : 'bg-muted'}`}
          />
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
        <p className="font-bold text-lg text-foreground">⏰ 数据保留</p>
        <div className="text-sm text-muted-foreground mb-2">
          选择多久后自动删除旧的学习记录
        </div>
        <select
          value={settings.dataRetention}
          onChange={(e: any) => setSettings({ ...settings, dataRetention: parseInt(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={30}>30 天</option>
          <option value={90}>90 天</option>
          <option value={180}>180 天</option>
          <option value={365}>1 年</option>
          <option value={0}>永久保留</option>
        </select>
      </div>

      {/* Danger Zone */}
      <div className="bg-destructive/10 rounded-2xl p-4 border border-destructive/20 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={20} className="text-destructive" />
          <p className="font-bold text-destructive">⚠️ 危险区域</p>
        </div>
        <button
          onClick={deleteAllData}
          className="w-full bg-destructive text-destructive-foreground rounded-lg py-2 font-bold hover:bg-destructive/90 transition-colors"
        >
          🗑️ 删除所有数据
        </button>
        <p className="text-xs text-destructive/80">
          此操作将永久删除所有学习数据。此操作不可撤销。
        </p>
      </div>
    </div>
  );
}
