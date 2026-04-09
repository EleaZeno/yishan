import React, { useState, useEffect } from 'react';
import AIStudyAssistant from './AIStudyAssistant';
import KnowledgeGraph from './KnowledgeGraph';
import NotificationCenter from './NotificationCenter';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AnimatedNumber, PulseDot, ConfettiExplosion } from '../lib/animations';
import {
  Sparkles, Network, Trophy, Flame, Target,
  Brain, TrendingUp, Zap, Bell, ChevronRight
} from 'lucide-react';
import { Word, Stats } from '../types';
import { predictRecallProbability } from '../lib/algorithm';

// ============================================================
// Enhancement Pack - All new features in one place
// ============================================================
interface EnhancementPackProps {
  words: Word[];
  stats: Stats;
  studyHistory?: any[];
  activeTab: string;
  onNavigate?: (tab: string) => void;
}

const EnhancementPack: React.FC<EnhancementPackProps> = ({
  words, stats, studyHistory, activeTab, onNavigate
}) => {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Track milestone achievements
  useEffect(() => {
    const milestones = localStorage.getItem('yishan_milestones') || '{}';
    const m = JSON.parse(milestones);

    if (words.length >= 10 && !m['first10']) {
      m['first10'] = true;
      localStorage.setItem('yishan_milestones', JSON.stringify(m));
      setShowConfetti(true);
    }

    if (words.length >= 100 && !m['first100']) {
      m['first100'] = true;
      localStorage.setItem('yishan_milestones', JSON.stringify(m));
      setShowConfetti(true);
    }
  }, [words.length]);

  return (
    <>
      {/* Confetti Effect */}
      <ConfettiExplosion active={showConfetti} />
      <ConfettiExplosion active={false} />

      {/* AI Assistant */}
      <AIStudyAssistant
        words={words}
        stats={stats}
        studyHistory={studyHistory}
        onApplySuggestion={(suggestion) => {
          // Handle suggestion
          console.log('Apply suggestion:', suggestion);
        }}
      />

      {/* Knowledge Graph */}
      <KnowledgeGraph
        words={words}
        isOpen={showGraph}
        onClose={() => setShowGraph(false)}
        onNodeClick={(word) => {
          console.log('Clicked word:', word);
          setShowGraph(false);
        }}
      />

      {/* Notification Center */}
      <NotificationCenter
        wordsCount={words.length}
        dueCount={stats.fadingSignals}
        streakDays={12}
      />

      {/* Quick Action Bar (floating) */}
      {activeTab === 'dashboard' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-2 bg-card/95 backdrop-blur-xl rounded-full px-4 py-2 shadow-xl border border-border/50">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAIPanel(true)}
              className="rounded-full px-3"
            >
              <Sparkles size={16} className="text-indigo-500" />
              <span className="ml-1.5 text-xs font-medium">AI</span>
            </Button>

            <div className="w-px h-6 bg-border" />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowGraph(true)}
              className="rounded-full px-3"
              disabled={words.length === 0}
            >
              <Network size={16} className="text-purple-500" />
              <span className="ml-1.5 text-xs font-medium">图谱</span>
            </Button>

            <div className="w-px h-6 bg-border" />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNavigate?.('achievements')}
              className="rounded-full px-3"
            >
              <Trophy size={16} className="text-amber-500" />
              <span className="ml-1.5 text-xs font-medium">成就</span>
            </Button>

            <div className="w-px h-6 bg-border" />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNavigate?.('analytics')}
              className="rounded-full px-3"
            >
              <TrendingUp size={16} className="text-green-500" />
              <span className="ml-1.5 text-xs font-medium">数据</span>
            </Button>
          </div>
        </div>
      )}

      {/* Milestone Celebration Modal */}
      <MilestoneModal wordsCount={words.length} />
    </>
  );
};

// ============================================================
// Milestone Celebration
// ============================================================
const MilestoneModal: React.FC<{ wordsCount: number }> = ({ wordsCount }) => {
  const [showMilestone, setShowMilestone] = useState<number | null>(null);
  const milestones = [10, 25, 50, 100, 200, 500, 1000];

  useEffect(() => {
    const lastShown = localStorage.getItem('yishan_last_milestone');
    const currentMilestone = milestones.find(m => wordsCount >= m && (!lastShown || parseInt(lastShown) < m));

    if (currentMilestone) {
      localStorage.setItem('yishan_last_milestone', currentMilestone.toString());
      setShowMilestone(currentMilestone);
    }
  }, [wordsCount]);

  if (!showMilestone) return null;

  const messages: Record<number, { title: string; message: string; emoji: string }> = {
    10: { title: '起步！', message: '你已经添加了 10 个记忆信号，继续保持！', emoji: '🎯' },
    25: { title: '初露锋芒', message: '25 个信号在你的大脑中建立连接。', emoji: '🧠' },
    50: { title: '半百成就', message: '恭喜突破 50 大关！你是认真的学习者。', emoji: '⭐' },
    100: { title: '百词斩', message: '100 个信号！你的词汇量正在飞速增长。', emoji: '🏆' },
    200: { title: '超能学习者', message: '200 个记忆节点，你的知识网络越来越强大。', emoji: '🚀' },
    500: { title: '词汇大师', message: '500 个信号！你已经是高水平学习者了。', emoji: '💎' },
    1000: { title: '传奇记忆', message: '1000 个记忆信号！这是难以置信的成就。', emoji: '👑' },
  };

  const config = messages[showMilestone] || messages[100];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => setShowMilestone(null)}
    >
      <Card
        className="max-w-sm w-full text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="pt-8 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="text-6xl mb-4"
          >
            {config.emoji}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black mb-2"
          >
            {config.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mb-6"
          >
            {config.message}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full"
          >
            <Zap size={16} className="fill-current" />
            <span className="font-bold">{showMilestone} 个信号</span>
          </motion.div>
          <div className="mt-6">
            <Button onClick={() => setShowMilestone(null)} className="rounded-full px-8">
              继续学习
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancementPack;
