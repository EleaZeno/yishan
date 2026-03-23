import React, { useState, useEffect } from 'react';
import { Target, Brain, ChevronRight, CheckCircle, XCircle, BookOpen, ArrowRight, Zap, ChevronLeft, Home, Star, Loader2 } from 'lucide-react';
import { KNOWLEDGE_GRAPH, type KnowledgeNode } from '../data/knowledge-graph';
import { getQuestionsByKnowledge, type Question } from '../data/questions';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        <Card className="text-center p-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${accuracy >= 70 ? 'bg-green-100' : 'bg-orange-100'}`}>
            {accuracy >= 70 ? (
              <Star className="w-10 h-10 text-green-600" />
            ) : (
              <Zap className="w-10 h-10 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {accuracy >= 70 ? '练习不错！' : '继续加油！'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {selectedPoint?.name} 正确率：{accuracy}% ({correctCount}/{answers.length})
          </p>

          {/* 掌握度提升 */}
          {selectedPoint && (
            <div className="bg-muted/50 rounded-2xl p-6 mb-8">
              <p className="text-sm text-muted-foreground mb-2">掌握度提升</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl font-bold text-muted-foreground">{Math.round(selectedPoint.mastery * 100)}%</span>
                <ArrowRight className="w-5 h-5 text-green-500" />
                <span className="text-3xl font-bold text-green-600">{Math.round(mastery * 100)}%</span>
              </div>
            </div>
          )}

          {/* 答题回顾 */}
          <div className="text-left space-y-4 mb-8 max-h-64 overflow-y-auto pr-2">
            {answers.map((answer, i) => (
              <div key={i} className={`p-4 rounded-xl ${answer.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                <div className="flex items-center gap-2 mb-2">
                  {answer.correct ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
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
            <Button
              variant="outline"
              onClick={() => { setViewState('list'); restartPractice(); }}
              className="px-6 py-6 rounded-xl font-semibold flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              返回列表
            </Button>
            <Button
              onClick={restartPractice}
              className="px-6 py-6 rounded-xl font-semibold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              再练一次
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 练习中
  if (viewState === 'practice' && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const getOptionStyle = (index: number) => {
      if (!showFeedback) return 'hover:bg-primary/5 border-transparent hover:border-primary/30';
      if (index === currentQ.answer) return 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-500/50 dark:text-green-400';
      if (index === selectedAnswer) return 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-400';
      return 'border-transparent opacity-50';
    };

    return (
      <div className="max-w-2xl mx-auto">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost"
            onClick={() => setViewState('list')} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground -ml-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>返回</span>
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* 题目卡片 */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={
                currentQ.type === 'vocab' ? 'secondary' :
                currentQ.type === 'grammar' ? 'default' :
                'outline'
              }>
                {currentQ.type === 'vocab' ? '词汇' : currentQ.type === 'grammar' ? '语法' : '阅读'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                难度 {Math.round(currentQ.difficulty * 100)}%
              </span>
            </div>
            
            <div className="text-2xl font-medium text-foreground mb-6 leading-relaxed">
              {currentQ.content}
            </div>

            {/* 选项 */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => handleAnswer(i)}
                  disabled={showFeedback}
                  className={`w-full h-auto p-4 justify-start text-left font-normal text-base transition-all ${getOptionStyle(i)}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0
                      ${!showFeedback ? 'bg-muted text-muted-foreground' : 
                        i === currentQ.answer ? 'bg-green-500 text-white' : 
                        i === selectedAnswer ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                </Button>
              ))}
            </div>

            {/* 答案解析 */}
            {showFeedback && (
              <div className={`p-4 rounded-xl text-left animate-in fade-in slide-in-from-bottom-2 ${
                selectedAnswer === currentQ.answer 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                  : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                <div className="font-semibold mb-1 flex items-center gap-2">
                  {selectedAnswer === currentQ.answer ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {selectedAnswer === currentQ.answer ? '回答正确' : '回答错误'}
                </div>
                <div className="text-sm opacity-90 mt-2">{currentQ.explanation}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // 知识点列表
  return (
    <div className="space-y-6">
      {/* 顶部标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">薄弱点攻关</h2>
          <p className="text-muted-foreground mt-1">根据你的能力诊断，针对性强化训练</p>
        </div>
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
          <span>返回</span>
        </Button>
      </div>

      {/* 知识点卡片列表 */}
      <div className="grid gap-4">
        {weakPoints.map((point) => (
          <Card
            key={point.knowledgeId}
            className="hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => startPractice(point)}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${getMasteryColor(point.mastery)}20` }}
              >
                <span style={{ color: getMasteryColor(point.mastery) }}>
                  {getCategoryIcon(point.category)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{point.name}</h3>
                <p className="text-sm text-muted-foreground">{getCategoryName(point.category)}</p>
              </div>
              <div className="text-right mr-2">
                <div className="text-2xl font-bold" style={{ color: getMasteryColor(point.mastery) }}>
                  {Math.round(point.mastery * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">掌握度</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {weakPoints.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
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
