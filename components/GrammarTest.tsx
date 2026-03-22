import React, { useState, useCallback } from 'react';
import { BookOpen, CheckCircle, Clock, Target, Zap, ChevronLeft, Home, RefreshCw } from 'lucide-react';
import { getRandomQuestions, type Question } from '../data/questions';

interface GrammarTestProps {
  userId?: string;
  onBack?: () => void;
}

const GrammarTest: React.FC<GrammarTestProps> = ({ userId, onBack }) => {
  const [testState, setTestState] = useState<'idle' | 'testing' | 'complete'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<{ correct: number; total: number; level: number } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const startTest = useCallback(() => {
    const questions = getRandomQuestions(25, 'grammar');
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
    const newAnswers = [...answers, isCorrect];
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
        const correctCount = newAnswers.filter(a => a).length;
        const rate = correctCount / shuffledQuestions.length;
        let level = 0.3;
        if (rate >= 0.9) level = 0.9;
        else if (rate >= 0.8) level = 0.8;
        else if (rate >= 0.7) level = 0.7;
        else if (rate >= 0.6) level = 0.6;
        else if (rate >= 0.5) level = 0.5;
        else if (rate >= 0.4) level = 0.4;
        
        setResult({ correct: correctCount, total: shuffledQuestions.length, level });
        setTestState('complete');
      } else {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }, 1500);
  };

  const resetTest = () => {
    setTestState('idle');
    setCurrentIndex(0);
    setAnswers([]);
    setResult(null);
  };

  // 开始界面
  if (testState === 'idle') {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">语法测试</h2>
          <p className="text-gray-600 mb-6">
            测试你的英语语法掌握程度，包含时态、从句、非谓语等知识点。
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-600">约8分钟</span></div>
            <div className="flex items-center gap-2"><Target className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-600">25道题</span></div>
            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-600">时态、从句</span></div>
            <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-500" /><span className="text-sm text-gray-600">即时反馈</span></div>
          </div>
          
          <button onClick={startTest} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200">
            开始测试
          </button>
        </div>
      </div>
    );
  }

  // 完成界面
  if (testState === 'complete' && result) {
    const rate = result.correct / result.total;
    const grade = rate >= 0.9 ? '优秀' : rate >= 0.7 ? '良好' : rate >= 0.6 ? '中等' : rate >= 0.5 ? '及格' : '需加强';
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">测试完成！</h2>
          <p className="text-gray-600 mb-8">你的语法评估结果</p>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">{grade}</div>
            <div className="text-gray-600">语法能力等级</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4"><div className="text-2xl font-bold text-gray-800">{Math.round(result.level * 100)}%</div><div className="text-sm text-gray-500">掌握度</div></div>
            <div className="bg-gray-50 rounded-xl p-4"><div className="text-2xl font-bold text-gray-800">{result.correct}/{result.total}</div><div className="text-sm text-gray-500">正确题数</div></div>
            <div className="bg-gray-50 rounded-xl p-4"><div className="text-2xl font-bold text-gray-800">{Math.round(rate * 100)}%</div><div className="text-sm text-gray-500">正确率</div></div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={resetTest} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2">
              <Home className="w-4 h-4" />返回首页
            </button>
            <button onClick={startTest} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />重新测试
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 测试进行中
  const currentQ = shuffledQuestions[currentIndex];
  const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100;

  const getOptionStyle = (index: number) => {
    if (!showFeedback) return 'bg-gray-50 hover:bg-blue-50 border-transparent hover:border-blue-300';
    if (index === currentQ.answer) return 'bg-green-50 border-green-500 text-green-700';
    if (index === selectedAnswer) return 'bg-red-50 border-red-500 text-red-700';
    return 'bg-gray-50 border-transparent opacity-50';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={resetTest} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-5 h-5" /><span>退出测试</span>
        </button>
        <div className="text-sm text-gray-500">{currentIndex + 1} / {shuffledQuestions.length}</div>
      </div>

      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="text-sm text-blue-600 font-medium mb-2">语法理解 · {currentQ.knowledgeId.replace('_', ' ')}</div>
          <div className="text-xl font-medium text-gray-800">{currentQ.content}</div>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((option, i) => (
            <button key={i} onClick={() => handleAnswer(i)} disabled={showFeedback}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${getOptionStyle(i)}`}>
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${!showFeedback ? 'bg-gray-200 text-gray-600' : i === currentQ.answer ? 'bg-green-500 text-white' : 
                    i === selectedAnswer ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {showFeedback && (
          <div className={`mt-6 p-4 rounded-xl ${selectedAnswer === currentQ.answer ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {selectedAnswer === currentQ.answer ? <CheckCircle className="w-5 h-5 text-green-600" /> : <span className="text-amber-600">✗</span>}
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
};

export default GrammarTest;
