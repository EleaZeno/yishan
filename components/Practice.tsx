import React, { useState, useEffect } from 'react';
import { Target, Brain, ChevronRight, CheckCircle, XCircle, BookOpen, ArrowRight, Zap, ChevronLeft, Home, Star } from 'lucide-react';
import { KNOWLEDGE_GRAPH, type KnowledgeNode } from '../data/knowledge-graph';
import { getQuestionsByKnowledge, type Question } from '../data/questions';

interface PracticeProps {
  userId?: string;
  onBack?: () => void;
}

interface WeakPoint {
  knowledgeId: string;
  name: string;
  mastery: number;
  category: string;
}

const Practice: React.FC<PracticeProps> = ({ userId, onBack }) => {
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<WeakPoint | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; explanation: string }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [viewState, setViewState] = useState<'list' | 'practice' | 'result'>('list');

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
          // 默认薄弱点
          setWeakPoints([
            { knowledgeId: 'grammar_tense', name: '时态', mastery: 0.35, category: 'grammar' },
            { knowledgeId: 'clause_relative', name: '定语从句', mastery: 0.42, category: 'grammar' },
            { knowledgeId: 'vocab_1500', name: '初中词汇', mastery: 0.55, category: 'vocabulary' },
            { knowledgeId: 'reading_infer', name: '阅读推理', mastery: 0.48, category: 'reading' },
            { knowledgeId: 'clause_noun', name: '名词性从句', mastery: 0.38, category: 'grammar' },
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to load weak points:', error);
      setWeakPoints([
        { knowledgeId: 'grammar_tense', name: '时态', mastery: 0.35, category: 'grammar' },
        { knowledgeId: 'clause_relative', name: '定语从句', mastery: 0.42, category: 'grammar' },
        { knowledgeId: 'vocab_1500', name: '初中词汇', mastery: 0.55, category: 'vocabulary' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startPractice = (point: WeakPoint) => {
    const qs = getQuestionsByKnowledge(point.knowledgeId);
    if (qs.length === 0) {
      // 如果没有该知识点的题目，使用默认题目
      setQuestions([
        {
          id: 'd001',
          type: 'grammar',
          difficulty: 0.5,
          knowledgeId: point.knowledgeId,
          content: `练习题：${point.name}`,
          options: ['选项A', '选项B', '选项C', '选项D'],
          answer: 0,
          explanation: `这是 ${point.name} 的练习题`
        }
      ]);
    } else {
      setQuestions(qs);
    }
    setSelectedPoint(point);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setViewState('practice');
  };

  const handleAnswer = async (selectedIndex: number) => {
    if (showFeedback || !questions[currentQuestionIndex]) return;
    
    setSelectedAnswer(selectedIndex);
    setShowFeedback(true);
    
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQ.answer;
    
    setAnswers([...answers, { 
      correct: isCorrect, 
      explanation: currentQ.explanation 
    }]);

    // 更新知识点掌握度
    if (userId && selectedPoint) {
      try {
        await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_mastery',
            userId,
            data: { 
              knowledgeId: selectedPoint.knowledgeId, 
              isCorrect, 
              priorMastery: selectedPoint.mastery 
            }
          })
        });
      } catch (e) {
        console.error('Failed to update mastery:', e);
      }
    }

    // 延迟后进入下一题或完成
    setTimeout(() => {
      if (currentQuestionIndex >= questions.length - 1) {
        setShowResult(true);
        setViewState('result');
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }, 1500);
  };

  const restartPractice = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setViewState('practice');
  };

  const getMasteryColor = (mastery: number): string => {
    if (mastery >= 0.7) return '#10B981';
    if (mastery >= 0.5) return '#F59E0B';
    return '#EF4444';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grammar': return <BookOpen className="w-4 h-4" />;
      case 'vocabulary': return <Brain className="w-4 h-4" />;
      case 'reading': return <Target className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'grammar': return '语法';
      case 'vocabulary': return '词汇';
      case 'reading': return '阅读';
      case 'listening': return '听力';
      case 'writing': return '写作';
      default: return category;
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
  if (viewState === 'result' && answers.length > 0) {
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / answers.length) * 100);
    const mastery = selectedPoint ? Math.min(1, selectedPoint.mastery + accuracy / 100 * 0.3) : 0.5;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${accuracy >= 70 ? 'bg-green-100' : 'bg-orange-100'}`}>
            {accuracy >= 70 ? (
              <Star className="w-10 h-10 text-green-600" />
            ) : (
              <Zap className="w-10 h-10 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {accuracy >= 70 ? '练习不错！' : '继续加油！'}
          </h2>
          <p className="text-gray-600 mb-6">
            {selectedPoint?.name} 正确率：{accuracy}% ({correctCount}/{answers.length})
          </p>

          {/* 掌握度提升 */}
          {selectedPoint && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 mb-8">
              <p className="text-sm text-gray-500 mb-2">掌握度提升</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl font-bold text-gray-400">{Math.round(selectedPoint.mastery * 100)}%</span>
                <ArrowRight className="w-5 h-5 text-green-500" />
                <span className="text-3xl font-bold text-green-600">{Math.round(mastery * 100)}%</span>
              </div>
            </div>
          )}

          {/* 答题回顾 */}
          <div className="text-left space-y-4 mb-8 max-h-64 overflow-y-auto">
            {answers.map((answer, i) => (
              <div key={i} className={`p-4 rounded-xl ${answer.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                <div className="flex items-center gap-2 mb-2">
                  {answer.correct ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="text-red-600">✗</span>
                  )}
                  <span className={`font-medium ${answer.correct ? 'text-green-700' : 'text-red-700'}`}>
                    {answer.correct ? '✓ 正确' : '✗ 错误'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{questions[i]?.explanation}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { setViewState('list'); restartPractice(); }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              返回列表
            </button>
            <button
              onClick={restartPractice}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              再练一次
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 练习中
  if (viewState === 'practice' && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const getOptionStyle = (index: number) => {
      if (!showFeedback) {
        return 'bg-gray-50 hover:bg-indigo-50 border-transparent hover:border-indigo-300';
      }
      if (index === currentQ.answer) {
        return 'bg-green-50 border-green-500 text-green-700';
      }
      if (index === selectedAnswer && index !== currentQ.answer) {
        return 'bg-red-50 border-red-500 text-red-700';
      }
      return 'bg-gray-50 border-transparent opacity-50';
    };

    return (
      <div className="max-w-2xl mx-auto">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setViewState('list')} 
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <div className="text-sm text-gray-500">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 题目卡片 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentQ.type === 'vocab' ? 'bg-purple-100 text-purple-700' :
              currentQ.type === 'grammar' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {currentQ.type === 'vocab' ? '词汇' : currentQ.type === 'grammar' ? '语法' : '阅读'}
            </span>
            <span className="text-xs text-gray-500">
              难度 {Math.round(currentQ.difficulty * 100)}%
            </span>
          </div>
          
          <div className="text-xl font-medium text-gray-800 mb-6">
            {currentQ.content}
          </div>

          {/* 选项 */}
          <div className="space-y-3">
            {currentQ.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${getOptionStyle(i)}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${!showFeedback ? 'bg-gray-200 text-gray-600' : 
                      i === currentQ.answer ? 'bg-green-500 text-white' : 
                      i === selectedAnswer ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                  {showFeedback && i === currentQ.answer && (
                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                  )}
                  {showFeedback && i === selectedAnswer && i !== currentQ.answer && (
                    <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* 答案解析 */}
          {showFeedback && (
            <div className={`mt-6 p-4 rounded-xl ${selectedAnswer === currentQ.answer ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === currentQ.answer ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-600" />
                )}
                <span className={`font-medium ${selectedAnswer === currentQ.answer ? 'text-green-700' : 'text-amber-700'}`}>
                  {selectedAnswer === currentQ.answer ? '回答正确！' : '回答错误'}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{currentQ.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 知识点列表
  return (
    <div className="space-y-6">
      {/* 顶部标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">薄弱点攻关</h2>
          <p className="text-gray-500 mt-1">根据你的能力诊断，针对性强化训练</p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
      </div>

      {/* 知识点卡片列表 */}
      <div className="grid gap-4">
        {weakPoints.map((point) => (
          <button
            key={point.knowledgeId}
            onClick={() => startPractice(point)}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-indigo-300 transition-all text-left flex items-center gap-4"
          >
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${getMasteryColor(point.mastery)}20` }}
            >
              <span style={{ color: getMasteryColor(point.mastery) }}>
                {getCategoryIcon(point.category)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{point.name}</h3>
              <p className="text-sm text-gray-500">{getCategoryName(point.category)}</p>
            </div>
            <div className="text-right mr-2">
              <div className="text-2xl font-bold" style={{ color: getMasteryColor(point.mastery) }}>
                {Math.round(point.mastery * 100)}%
              </div>
              <p className="text-xs text-gray-500">掌握度</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>

      {/* 空状态 */}
      {weakPoints.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无薄弱点数据</p>
          <p className="text-sm">先完成能力诊断测试吧</p>
        </div>
      )}
    </div>
  );
};

export default Practice;

function RefreshCw(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  );
}
