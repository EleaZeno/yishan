import React, { useState, useEffect } from 'react';
import { X, BookOpen, Target, Bell, Moon, ChevronRight, Check } from 'lucide-react';
import { Button } from './ui/button';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: '欢迎使用忆闪',
    subtitle: '基于遗忘曲线的科学记忆系统',
    icon: BookOpen,
    content: `
      忆闪帮助你高效记忆单词：
      
      • 科学算法：基于遗忘曲线自动安排复习
      • 高效学习：只复习快遗忘的单词
      • 进度追踪：可视化学习数据
      
      让我们一起开始吧！
    `,
  },
  {
    title: '添加你的第一个词库',
    subtitle: '选择适合你的词汇级别',
    icon: Target,
    content: `
      我们准备了多个词库：
      
      • 小学基础（500词）
      • 初中词汇（1500词）
      • 高中词汇（3500词）
      • 四六级核心
      • 雅思托福
      
      你也可以自己添加单词！
    `,
  },
  {
    title: '设置学习提醒',
    subtitle: '养成每日学习习惯',
    icon: Bell,
    content: `
      建议每天学习 15-30 分钟：
      
      • 设置固定时间提醒
      • 循序渐进，贵在坚持
      • 系统会自动安排复习
      
      少量多次，效果更好！
    `,
  },
  {
    title: '个性化设置',
    subtitle: '调整适合你的学习方式',
    icon: Moon,
    content: `
      你可以自定义：
      
      • 深色模式：保护眼睛
      • 语言：中文/英文/日文
      • 学习目标：每日单词数
      
      随时在"我的"页面调整！
    `,
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 检查是否已完成引导
    const completed = localStorage.getItem('onboarding-completed');
    if (completed) {
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboarding-completed', 'true');
      setVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setVisible(false);
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-3xl p-8 text-white">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
          
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <Icon size={32} />
          </div>
          
          <h2 className="text-2xl font-black">{step.title}</h2>
          <p className="text-white/80 mt-1">{step.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-foreground whitespace-pre-line leading-relaxed">
            {step.content}
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              跳过
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>下一步 <ChevronRight size={16} /></>
              ) : (
                <><Check size={16} /> 开始使用</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}