import React, { useState, useEffect, useCallback } from 'react';
import { Brain, CheckCircle, XCircle, Clock, ArrowRight, RefreshCw, Target, Zap } from 'lucide-react';

interface VocabTestProps {
  userId?: string;
  onComplete?: (result: { level: number; name: string; estimatedWords: number; correct: number; total: number }) => void;
}

// 测试词汇池（简化版）
const VOCAB_TEST_WORDS = [
  { word: 'abandon', definition: 'v. 放弃', difficulty: 0.3 },
  { word: 'ability', definition: 'n. 能力', difficulty: 0.2 },
  { word: 'able', definition: 'adj. 能够的', difficulty: 0.1 },
  { word: 'about', definition: 'prep. 关于', difficulty: 0.1 },
  { word: 'above', definition: 'prep. 在...上面', difficulty: 0.2 },
  { word: 'abroad', definition: 'adv. 在国外', difficulty: 0.4 },
  { word: 'absence', definition: 'n. 缺席', difficulty: 0.4 },
  { word: 'absolute', definition: 'adj. 绝对的', difficulty: 0.6 },
  { word: 'absorb', definition: 'v. 吸收', difficulty: 0.5 },
  { word: 'abstract', definition: 'adj. 抽象的', difficulty: 0.7 },
  { word: 'abundant', definition: 'adj. 丰富的', difficulty: 0.7 },
  { word: 'academic', definition: 'adj. 学术的', difficulty: 0.6 },
  { word: 'accept', definition: 'v. 接受', difficulty: 0.2 },
  { word: 'access', definition: 'n. 通道', difficulty: 0.4 },
  { word: 'accident', definition: 'n. 事故', difficulty: 0.3 },
  { word: 'accommodation', definition: 'n. 住宿', difficulty: 0.6 },
  { word: 'accompany', definition: 'v. 陪伴', difficulty: 0.5 },
  { word: 'accomplish', definition: 'v. 完成', difficulty: 0.7 },
  { word: 'account', definition: 'n. 账户', difficulty: 0.3 },
  { word: 'accurate', definition: 'adj. 准确的', difficulty: 0.5 },
  { word: 'achieve', definition: 'v. 实现', difficulty: 0.3 },
  { word: 'acknowledge', definition: 'v. 承认', difficulty: 0.6 },
  { word: 'acquire', definition: 'v. 获得', difficulty: 0.5 },
  { word: 'across', definition: 'prep. 穿过', difficulty: 0.2 },
  { word: 'action', definition: 'n. 行动', difficulty: 0.2 },
  { word: 'active', definition: 'adj. 积极的', difficulty: 0.2 },
  { word: 'activity', definition: 'n. 活动', difficulty: 0.2 },
  { word: 'actual', definition: 'adj. 实际的', difficulty: 0.4 },
  { word: 'adapt', definition: 'v. 适应', difficulty: 0.5 },
  { word: 'add', definition: 'v. 添加', difficulty: 0.1 },
];

const VocabTest: React.FC<VocabTestProps> = ({ userId, onComplete }) => {
  const [testState, setTestState] = useState<'idle' | 'testing' | 'complete'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<typeof VOCAB_TEST_WORDS>([]);
  const [result, setResult] = useState<{ level: number; name: string; estimatedWords: number; correct: number; total: number } | null>(null);

  // 初始化测试
  const startTest = useCallback(() => {
    // 随机打乱词汇
    const shuffled = [...VOCAB_TEST_WORDS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 20); // 取20道题
    
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setAnswers([]);
    setStartTime(Date.now());
    setTestState('testing');
    setShowResult(false);
    setResult(null);
  }, []);

  // 回答问题
  const handleAnswer = async (isCorrect: boolean) => {
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    if (currentIndex >= shuffledWords.length - 1) {
      // 测试完成
      const correctCount = newAnswers.filter(a => a).length;
      const correctRate = correctCount / shuffledWords.length;
      
      // 计算词汇量等级
      let level = 0.1;
      let name = '小学';
      let estimatedWords = 500;

      if (correctRate >= 0.95) { level = 0.9; name = '托福'; estimatedWords = 8000; }
      else if (correctRate >= 0.85) { level = 0.8; name = '雅思'; estimatedWords = 6000; }
      else if (correctRate >= 0.75) { level = 0.7; name = '六级'; estimatedWords = 4500; }
      else if (correctRate >= 0.65) { level = 0.6; name = '四级'; estimatedWords = 3500; }
      else if (correctRate >= 0.55) { level = 0.5; name = '高中进阶'; estimatedWords = 3000; }
      else if (correctRate >= 0.45) { level = 0.4; name = '高中基础'; estimatedWords = 2500; }
      else if (correctRate >= 0.35) { level = 0.3; name = '初中进阶'; estimatedWords = 1800; }
      else if (correctRate >= 0.25) { level = 0.2; name = '初中基础'; estimatedWords = 1200; }
      else { level = 0.1; name = '小学'; estimatedWords = 600; }

      const testResult = { level, name, estimatedWords, correct: correctCount, total: shuffledWords.length };
      setResult(testResult);
      setTestState('complete');

      // 上传到云端
      if (userId) {
        try {
          await fetch('/api/assessment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'assess_vocab',
              userId,
              data: { correctCount, totalCount: shuffledWords.length }
            })
          });
        } catch (e) {
          console.error('Failed to save result:', e);
        }
      }

      onComplete?.(testResult);
    } else {
      // 下一题
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 重置测试
  const resetTest = () => {
    setTestState('idle');
    setCurrentIndex(0);
    setAnswers([]);
    setResult(null);
  };

  // 等待开始界面
  if (testState === 'idle') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">词汇量测试</h2>
          <p className="text-gray-600 mb-6">
            本测试包含 20 道选择题，测试你的英语词汇水平。<br/>
            系统会根据正确率自动调整难度。
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">约 5 分钟</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">20 道题目</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">自适应难度</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">精准评估</span>
            </div>
          </div>
          <button
            onClick={startTest}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all"
          >
            开始测试
          </button>
        </div>
      </div>
    );
  }

  // 测试完成界面
  if (testState === 'complete' && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">测试完成！</h2>
          <p className="text-gray-600 mb-8">你的词汇量评估结果</p>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 mb-8">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
              {result.estimatedWords}
            </div>
            <div className="text-gray-600">估算词汇量</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-800">{result.level * 100}</div>
              <div className="text-sm text-gray-500">能力等级</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-800">{result.correct}/{result.total}</div>
              <div className="text-sm text-gray-500">正确题数</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-800">{Math.round(result.correct / result.total * 100)}%</div>
              <div className="text-sm text-gray-500">正确率</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={startTest}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              重新测试
            </button>
            <button
              onClick={resetTest}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 测试进行中
  const currentWord = shuffledWords[currentIndex];
  const progress = ((currentIndex + 1) / shuffledWords.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>进度</span>
          <span>{currentIndex + 1} / {shuffledWords.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="text-sm text-gray-500 mb-2">请选择正确的释义</div>
          <div className="text-3xl font-bold text-gray-800">{currentWord?.word}</div>
        </div>

        {/* 选项 */}
        <div className="space-y-3">
          <button
            onClick={() => handleAnswer(true)}
            className="w-full p-4 text-left bg-gray-50 hover:bg-purple-50 border-2 border-transparent hover:border-purple-300 rounded-xl transition-all group"
          >
            <span className="text-gray-700 group-hover:text-purple-700">{currentWord?.definition}</span>
          </button>
          
          {/* 随机生成干扰选项 */}
          {shuffledWords
            .filter((_, i) => i !== currentIndex)
            .slice(0, 3)
            .map((w, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(false)}
                className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-300 rounded-xl transition-all group"
              >
                <span className="text-gray-700">{w.definition}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default VocabTest;
