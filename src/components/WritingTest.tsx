import React, { useState, useCallback } from 'react';
import { PenTool, CheckCircle, Clock, ChevronLeft, Home, RefreshCw, XCircle, Check, Target, AlertCircle } from 'lucide-react';
import { getRandomQuestions, type Question } from '../data/questions';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { KNOWLEDGE_GRAPH } from '../data/knowledge-graph';

interface WritingTestProps {
  userId?: string;
  onBack?: () => void;
}

const WritingTest: React.FC<WritingTestProps> = ({ userId, onBack }) => {
  const [testState, setTestState] = useState<'idle' | 'testing' | 'complete'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: Question; isCorrect: boolean }[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<{ correct: number; total: number; level: number; breakdown: Record<string, { correct: number; total: number }> } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const startTest = useCallback(() => {
    const questions = getRandomQuestions(5, 'writing');
    setShuffledQuestions(questions);
    setCurrentIndex(0);
    setAnswers([]);
    setTestState('testing');
    setResult(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, []);

  const handleAnswer = async (selectedIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(selectedIndex);
    setShowFeedback(true);
    
    const currentQ = shuffledQuestions[currentIndex];
    const isCorrect = selectedIndex === currentQ.answer;
    const newAnswers = [...answers, { question: currentQ, isCorrect }];
    setAnswers(newAnswers);

    if (userId) {
      try {
        await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_mastery',
            userId,
            data: { knowledgeId: currentQ.knowledgeId, isCorrect, priorMastery: 0.5 }
          })
        });
      } catch (e) {
        console.error('Failed to update:', e);
      }
    }

    setTimeout(() => {
      if (currentIndex >= shuffledQuestions.length - 1) {
        const correctCount = newAnswers.filter(a => a.isCorrect).length;
        const rate = correctCount / shuffledQuestions.length;
        let level = 0.3;
        if (rate >= 0.9) level = 0.9;
        else if (rate >= 0.75) level = 0.8;
        else if (rate >= 0.6) level = 0.7;
        else if (rate >= 0.5) level = 0.6;
        else if (rate >= 0.4) level = 0.5;
        
        // 计算知识点掌握情况
        const breakdown: Record<string, { correct: number; total: number }> = {};
        newAnswers.forEach(ans => {
          const category = KNOWLEDGE_GRAPH[ans.question.knowledgeId]?.category || '写作';
          if (!breakdown[category]) {
            breakdown[category] = { correct: 0, total: 0 };
          }
          breakdown[category].total += 1;
          if (ans.isCorrect) {
            breakdown[category].correct += 1;
          }
        });

        setResult({ correct: correctCount, total: shuffledQuestions.length, level, breakdown });
        setTestState('complete');
      } else {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }, 2000);
  };

  const resetTest = () => {
    setTestState('idle');
    setCurrentIndex(0);
    setAnswers([]);
    setResult(null);
  };

  if (testState === 'idle') {
    return (
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
          <span>返回</span>
        </Button>
        
        <Card className="text-center border-none shadow-sm">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <PenTool className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">写作能力诊断测试</h2>
            <p className="text-muted-foreground mb-6">
              全面测试你的英语写作基础能力，包括句子结构、段落组织、连词使用等。<br/>
              测试完成后将生成详细的写作能力诊断报告。
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-muted/50 rounded-xl p-4">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">约 8 分钟</span></div>
              <div className="flex items-center gap-2"><PenTool className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">5 道选择题</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">句子/段落/篇章</span></div>
              <div className="flex items-center gap-2"><Target className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">详细诊断报告</span></div>
            </div>
            
            <Button onClick={startTest} className="px-8 py-6 rounded-xl font-semibold text-lg shadow-lg shadow-primary/20">
              开始诊断
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testState === 'complete' && result) {
    const rate = result.correct / result.total;
    const grade = rate >= 0.9 ? '优秀' : rate >= 0.75 ? '良好' : rate >= 0.6 ? '中等' : rate >= 0.5 ? '及格' : '需加强';
    
    // 找出薄弱点
    const weakPoints = Object.entries(result.breakdown)
      .filter(([_, data]) => data.total > 0 && (data.correct / data.total) < 0.6)
      .map(([category]) => category);

    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 dark:bg-green-900/30">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">诊断完成！</h2>
            <p className="text-muted-foreground mb-8">你的写作能力综合评估</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-primary mb-2">{grade}</div>
                <div className="text-sm text-muted-foreground">综合评级</div>
              </div>
              <div className="bg-muted/50 rounded-2xl p-6 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-foreground mb-2">{Math.round(rate * 100)}%</div>
                <div className="text-sm text-muted-foreground">正确率 ({result.correct}/{result.total})</div>
              </div>
              <div className="bg-muted/50 rounded-2xl p-6 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-foreground mb-2">{Math.round(result.level * 100)}</div>
                <div className="text-sm text-muted-foreground">能力指数</div>
              </div>
            </div>

            {/* 知识点诊断报告 */}
            <div className="text-left mb-8">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                写作题型掌握分析
              </h3>
              <div className="space-y-4">
                {Object.entries(result.breakdown).map(([category, data]) => {
                  const percentage = Math.round((data.correct / data.total) * 100);
                  let colorClass = 'bg-green-500';
                  if (percentage < 60) colorClass = 'bg-red-500';
                  else if (percentage < 80) colorClass = 'bg-yellow-500';

                  return (
                    <div key={category} className="bg-muted/30 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-foreground">{category}</span>
                        <span className="text-sm font-bold">{percentage}% ({data.correct}/{data.total})</span>
                      </div>
                      <Progress value={percentage} className="h-2" indicatorClassName={colorClass} />
                    </div>
                  );
                })}
              </div>
            </div>

            {weakPoints.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl text-left mb-8 border border-red-100 dark:border-red-900/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-400 mb-1">诊断建议</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      你在 <strong>{weakPoints.join('、')}</strong> 题型上存在薄弱环节。建议在后续练习中重点关注此类题型的写作技巧。
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onBack} className="px-6 py-6 rounded-xl font-semibold flex items-center gap-2">
                <Home className="w-4 h-4" />返回首页
              </Button>
              <Button onClick={startTest} className="px-6 py-6 rounded-xl font-semibold flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />重新诊断
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentIndex];
  const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100;

  const getOptionStyle = (index: number) => {
    if (!showFeedback) return 'hover:bg-primary/5 border-transparent hover:border-primary/30';
    if (index === currentQ.answer) return 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-500/50 dark:text-green-400';
    if (index === selectedAnswer) return 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-400';
    return 'border-transparent opacity-50';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={resetTest} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" /><span>退出诊断</span>
        </Button>
        <div className="text-sm text-muted-foreground">{currentIndex + 1} / {shuffledQuestions.length}</div>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="pt-8 pb-8">
          <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
            {KNOWLEDGE_GRAPH[currentQ.knowledgeId]?.category || '写作'}
          </div>
          
          <div className="bg-muted/50 rounded-xl p-6 mb-6">
            <p className="text-foreground leading-relaxed text-lg">{currentQ.content}</p>
          </div>

          <div className="text-muted-foreground text-sm mb-4">请选择正确答案：</div>

          <div className="space-y-3 mb-6">
            {currentQ.options.map((option, i) => (
              <Button key={i} variant="outline" onClick={() => handleAnswer(i)} disabled={showFeedback}
                className={`w-full h-auto p-4 justify-start text-left font-normal text-base transition-all ${getOptionStyle(i)}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${!showFeedback ? 'bg-muted text-muted-foreground' : i === currentQ.answer ? 'bg-green-500 text-white' : 
                      i === selectedAnswer ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                </div>
              </Button>
            ))}
          </div>

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
};

export default WritingTest;

