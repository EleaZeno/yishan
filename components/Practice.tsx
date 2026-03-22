import React, { useState, useEffect } from 'react';
import { Target, Brain, ChevronRight, CheckCircle, XCircle, BookOpen, ArrowRight, Zap } from 'lucide-react';
import { KNOWLEDGE_GRAPH, type KnowledgeNode } from '../data/knowledge-graph';

interface PracticeProps {
  userId?: string;
}

interface WeakPoint {
  knowledgeId: string;
  name: string;
  mastery: number;
  category: string;
}

interface PracticeQuestion {
  id: string;
  type: 'vocab' | 'grammar' | 'reading';
  difficulty: number;
  knowledgeId: string;
  content: string;
  options: string[];
  answer: number;
  explanation: string;
}

// 示例练习题
const SAMPLE_QUESTIONS: Record<string, PracticeQuestion[]> = {
  'grammar_tense': [
    {
      id: 't1',
      type: 'grammar',
      difficulty: 0.3,
      knowledgeId: 'grammar_tense',
      content: 'She ___ English since 2010.',
      options: ['studies', 'studied', 'has studied', 'is studying'],
      answer: 2,
      explanation: 'Since + 时间点 用于现在完成时，表示从过去持续到现在的动作。'
    },
    {
      id: 't2',
      type: 'grammar',
      difficulty: 0.4,
      knowledgeId: 'grammar_tense',
      content: 'If it ___ tomorrow, we will cancel the trip.',
      options: ['rains', 'rained', 'will rain', 'is raining'],
      answer: 0,
      explanation: 'if 引导的条件状语从句用一般现在时表示将来。'
    },
    {
      id: 't3',
      type: 'grammar',
      difficulty: 0.5,
      knowledgeId: 'grammar_tense',
      content: 'By the time he ___ arrive, the meeting will have started.',
      options: ['will', 'arrives', 'arrived', 'arriving'],
      answer: 1,
      explanation: 'by the time 引导的时间状语从句用一般现在时表示将来完成时。'
    }
  ],
  'clause_relative': [
    {
      id: 'r1',
      type: 'grammar',
      difficulty: 0.4,
      knowledgeId: 'clause_relative',
      content: 'The book ___ cover is blue is mine.',
      options: ['whose', 'who', 'whom', 'which'],
      answer: 0,
      explanation: 'whose 表示所有格，用于修饰后面的名词。'
    },
    {
      id: 'r2',
      type: 'grammar',
      difficulty: 0.5,
      knowledgeId: 'clause_relative',
      content: 'I still remember the day ___ we first met.',
      options: ['when', 'where', 'which', 'that'],
      answer: 0,
      explanation: 'when 用于修饰表示时间的名词。'
    }
  ],
  'vocab_1500': [
    {
      id: 'v1',
      type: 'vocab',
      difficulty: 0.2,
      knowledgeId: 'vocab_1500',
      content: 'The word "abandon" means ___.',
      options: ['keep', 'give up', 'find', 'throw'],
      answer: 1,
      explanation: 'abandon 意为"放弃"，与 give up 同义。'
    },
    {
      id: 'v2',
      type: 'vocab',
      difficulty: 0.3,
      knowledgeId: 'vocab_1500',
      content: 'Choose the correct meaning: "achieve"',
      options: ['try', 'reach', 'stop', 'avoid'],
      answer: 1,
      explanation: 'achieve 意为"达到，实现"，与 reach 同义。'
    }
  ]
};

const Practice: React.FC<PracticeProps> = ({ userId }) => {
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; explanation: string }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeakPoints();
  }, [userId]);

  const loadWeakPoints = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_weak_points', userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.weakPoints && data.weakPoints.length > 0) {
          setWeakPoints(data.weakPoints);
        } else {
          // 如果没有数据，使用示例
          setWeakPoints([
            { knowledgeId: 'grammar_tense', name: '时态', mastery: 0.35, category: 'grammar' },
            { knowledgeId: 'clause_relative', name: '定语从句', mastery: 0.42, category: 'grammar' },
            { knowledgeId: 'vocab_1500', name: '初中词汇', mastery: 0.55, category: 'vocabulary' }
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to load weak points:', error);
      // 使用示例数据
      setWeakPoints([
        { knowledgeId: 'grammar_tense', name: '时态', mastery: 0.35, category: 'grammar' },
        { knowledgeId: 'clause_relative', name: '定语从句', mastery: 0.42, category: 'grammar' },
        { knowledgeId: 'vocab_1500', name: '初中词汇', mastery: 0.55, category: 'vocabulary' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestions = selectedPoint ? SAMPLE_QUESTIONS[selectedPoint] || [] : [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleAnswer = async (selectedIndex: number) => {
    const isCorrect = selectedIndex === currentQuestion.answer;
    
    setAnswers([...answers, { 
      correct: isCorrect, 
      explanation: currentQuestion.explanation 
    }]);

    // 更新知识点掌握度
    if (userId) {
      const priorMastery = weakPoints.find(w => w.knowledgeId === selectedPoint)?.mastery || 0.3;
      try {
        await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_mastery',
            userId,
            data: { knowledgeId: selectedPoint, isCorrect, priorMastery }
          })
        });
      } catch (e) {
        console.error('Failed to update mastery:', e);
      }
    }

    // 下一题或完成
    if (currentQuestionIndex >= currentQuestions.length - 1) {
      setShowResult(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const restartPractice = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResult(false);
  };

  const getMasteryColor = (mastery: number): string => {
    if (mastery >= 0.7) return '#10B981';
    if (mastery >= 0.5) return '#F59E0B';
    return '#EF4444';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grammar': return <Brain className="w-4 h-4" />;
      case 'vocabulary': return <BookOpen className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 练习结果
  if (showResult) {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / answers.length) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${accuracy >= 70 ? 'bg-green-100' : 'bg-orange-100'}`}>
            {accuracy >= 70 ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <Zap className="w-10 h-10 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {accuracy >= 70 ? '练习不错！' : '需要继续努力！'}
          </h2>
          <p className="text-gray-600 mb-6">
            正确率：{accuracy}% ({correctCount}/{answers.length})
          </p>

          {/* 答题回顾 */}
          <div className="text-left space-y-4 mb-8 max-h-64 overflow-y-auto">
            {answers.map((answer, i) => (
              <div key={i} className={`p-4 rounded-xl ${answer.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                <div className="flex items-center gap-2 mb-2">
                  {answer.correct ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`font-medium ${answer.correct ? 'text-green-700' : 'text-red-700'}`}>
                    {answer.correct ? '回答正确' : '回答错误'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{currentQuestions[i]?.explanation}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={restartPractice}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              再练一次
            </button>
            <button
              onClick={() => { setSelectedPoint(null); restartPractice(); }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              选择其他知识点
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 选择知识点
  if (!selectedPoint) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
          <h2 className="text-xl font-bold text-gray-800 mb-2">🎯 薄弱点攻关</h2>
          <p className="text-gray-600">根据你的能力诊断，以下知识点需要重点练习</p>
        </div>

        <div className="grid gap-4">
          {weakPoints.map((point) => (
            <button
              key={point.knowledgeId}
              onClick={() => setSelectedPoint(point.knowledgeId)}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-indigo-300 transition-all text-left flex items-center gap-4"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getMasteryColor(point.mastery)}20` }}
              >
                <span style={{ color: getMasteryColor(point.mastery) }}>
                  {getCategoryIcon(point.category)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{point.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{point.category}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: getMasteryColor(point.mastery) }}>
                  {Math.round(point.mastery * 100)}%
                </div>
                <p className="text-xs text-gray-500">掌握度</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>

        {weakPoints.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无薄弱点数据</p>
            <p className="text-sm">先完成能力诊断测试吧</p>
          </div>
        )}
      </div>
    );
  }

  // 练习中
  return (
    <div className="max-w-2xl mx-auto">
      {/* 进度 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>{weakPoints.find(w => w.knowledgeId === selectedPoint)?.name}</span>
          <span>{currentQuestionIndex + 1} / {currentQuestions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 题目 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="text-sm text-indigo-600 mb-4 capitalize">{currentQuestion?.type} · 难度 {Math.round((currentQuestion?.difficulty || 0) * 100)}%</div>
        
        <div className="text-xl font-medium text-gray-800 mb-6">
          {currentQuestion?.content}
        </div>

        <div className="space-y-3">
          {currentQuestion?.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="w-full p-4 text-left bg-gray-50 hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-300 rounded-xl transition-all"
            >
              <span className="text-gray-700">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Practice;
