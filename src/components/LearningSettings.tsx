import React, { useState, useEffect } from 'react';
import { Settings, Clock, Target, Bell, Save, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface LearningConfig {
  // 每日目标
  dailyNewWords: number;
  dailyReviewWords: number;
  
  // 遗忘曲线参数
  defaultHalflife: number; // 默认半衰期（分钟）
  easyBonus: number;       // 简单奖励倍数
  hardPenalty: number;     // 困难惩罚倍数
  
  // 提醒设置
  reminderEnabled: boolean;
  reminderTime: string;
  
  // 学习模式
  studyMode: 'normal' | 'intensive' | 'relaxed';
}

const defaultConfig: LearningConfig = {
  dailyNewWords: 20,
  dailyReviewWords: 50,
  defaultHalflife: 1440, // 1天
  easyBonus: 1.3,
  hardPenalty: 0.7,
  reminderEnabled: true,
  reminderTime: '20:00',
  studyMode: 'normal',
};

export default function LearningSettings() {
  const [config, setConfig] = useState<LearningConfig>(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // 加载保存的配置
    const saved = localStorage.getItem('learning-config');
    if (saved) {
      try {
        setConfig({ ...defaultConfig, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to load config:', e);
      }
    }
  }, []);

  const updateConfig = (key: keyof LearningConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('learning-config', JSON.stringify(config));
    setHasChanges(false);
    toast.success('设置已保存');
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setHasChanges(true);
    toast.success('已恢复默认设置');
  };

  const studyModes = [
    { value: 'relaxed', label: '轻松模式', desc: '每天10个新词，适合休闲学习' },
    { value: 'normal', label: '标准模式', desc: '每天20个新词，平衡学习效率' },
    { value: 'intensive', label: '强化模式', desc: '每天50个新词，快速扩充词汇' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-black">学习设置</h1>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} size="sm">
            <Save size={16} className="mr-2" />
            保存
          </Button>
        )}
      </div>

      {/* 学习模式 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            学习模式
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {studyModes.map(mode => (
            <button
              key={mode.value}
              onClick={() => updateConfig('studyMode', mode.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                config.studyMode === mode.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="font-bold">{mode.label}</div>
              <div className="text-sm text-muted-foreground">{mode.desc}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* 每日目标 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            每日目标
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">新词数量</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="100"
                value={config.dailyNewWords}
                onChange={(e) => updateConfig('dailyNewWords', Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-right font-bold">{config.dailyNewWords}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">复习数量</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="10"
                max="200"
                value={config.dailyReviewWords}
                onChange={(e) => updateConfig('dailyReviewWords', Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-right font-bold">{config.dailyReviewWords}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 遗忘曲线参数 */}
      <Card>
        <CardHeader>
          <CardTitle>遗忘曲线参数</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">默认复习间隔（小时）</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="6"
                max="168"
                step="6"
                value={config.defaultHalflife / 60}
                onChange={(e) => updateConfig('defaultHalflife', Number(e.target.value) * 60)}
                className="flex-1"
              />
              <span className="w-12 text-right font-bold">{config.defaultHalflife / 60}h</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">简单奖励倍数</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={config.easyBonus}
                onChange={(e) => updateConfig('easyBonus', Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-right font-bold">{config.easyBonus.toFixed(1)}x</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">困难惩罚倍数</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                value={config.hardPenalty}
                onChange={(e) => updateConfig('hardPenalty', Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-right font-bold">{config.hardPenalty.toFixed(1)}x</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 提醒设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            学习提醒
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">启用提醒</span>
            <button
              onClick={() => updateConfig('reminderEnabled', !config.reminderEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.reminderEnabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.reminderEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {config.reminderEnabled && (
            <div className="space-y-2">
              <label className="text-sm font-medium">提醒时间</label>
              <input
                type="time"
                value={config.reminderTime}
                onChange={(e) => updateConfig('reminderTime', e.target.value)}
                className="w-full p-2 rounded-lg border border-border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button onClick={handleReset} variant="outline" className="w-full">
        <RotateCcw size={16} className="mr-2" />
        恢复默认设置
      </Button>
    </div>
  );
}