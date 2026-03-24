import React, { useState, useCallback, useRef } from 'react';
import { Brain, CheckCircle, XCircle, Clock, RefreshCw, Target, Zap, ChevronLeft, Home } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { VOCAB_DATA, VocabItem } from '../data/vocab-data';
import { assessVocabulary } from '../services/assessment';

interface VocabTestProps {
  userId?: string;
  onBack?: () => void;
  onComplete?: (result: { level: number; name: string; estimatedWords: number; correct: number; total: number }) => void;
}

const TOTAL_QUESTIONS = 20;

// 词汇量估算映射表
const LEVEL_TO_WORDS: Record<number, { words: number; name: string }> = {
  1: { words: 500, name: '小学' },
  2: { words: 1000, name: '初中基础' },
  3: { words: 1500, name: '初中进阶' },
  4: { words: 2500, name: '高中基础' },
  5: { words: 3500, name: '高中进阶' },
  6: { words: 4500, name: '四级' },
  7: { words: 6000, name: '六级' },
  8: { words: 8000, name: '雅思/托福' },
  9: { words: 12000, name: 'GRE/GMAT' },
};

const VocabTest: React.FC<VocabTestProps> = ({ userId, onBack, onComplete }) => {
  const [testState, setTestState] = useState<'idle' | 'testing' | 'complete'>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(3.0); // 初始难度设定为 Level 3
  const [testWords, setTestWords] = useState<{ word: VocabItem; options: string[] }[]>([]);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState<{ level: number; name: string; estimatedWords: number; correct: number; total: number } | null>(null);
  const usedWordsRef = useRef<Set<string>>(new Set());

  // 生成干扰选项
  const generateOptions = (correctWord: VocabItem) => {
    const samePosWords = VOCAB_DATA.filter(w => w.pos === correctWord.pos && w.word !== correctWord.word);
    const distractors = [...samePosWords].sort(() => Math.random() - 0.5).slice(0, 3).map(w => w.translation);
    
    // 如果同词性的词不够，从所有词中补充
    while (distractors.length < 3) {
      const randomWord = VOCAB_DATA[Math.floor(Math.random() * VOCAB_DATA.length)];
      if (randomWord.word !== correctWord.word && !distractors.includes(randomWord.translation)) {
        distractors.push(randomWord.translation);
      }
    }

    const options = [...distractors, correctWord.translation];
    return options.sort(() => Math.random() - 0.5);
  };

  // 获取下一个测试词
  const getNextWord = (level: number) => {
    const targetLevel = Math.max(1, Math.min(9, Math.round(level)));
    let availableWords = VOCAB_DATA.filter(w => w.level === targetLevel && !usedWordsRef.current.has(w.word));
    
    // 如果当前等级的词用完了，扩大范围
    if (availableWords.length === 0) {
      availableWords = VOCAB_DATA.filter(w => !usedWordsRef.current.has(w.word));
    }

    if (availableWords.length === 0) return null; // 题库耗尽

    const selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWordsRef.current.add(selectedWord.word);
    
    return {
      word: selectedWord,
      options: generateOptions(selectedWord)
    };
  };

  // 初始化测试
  const startTest = useCallback(() => {
    usedWordsRef.current.clear();
    const firstWord = getNextWord(3.0);
    if (!firstWord) return;

    setTestWords([firstWord]);
    setCurrentLevel(3.0);
    setCurrentIndex(0);
    setAnswers([]);
    setTestState('testing');
    setResult(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, []);

  // 计算最终结果
  const calculateResult = (finalLevel: number, correctCount: number) => {
    const clampedLevel = Math.max(1, Math.min(9, finalLevel));
    const lowerLevel = Math.floor(clampedLevel);
    const upperLevel = Math.ceil(clampedLevel);
    
    let estimatedWords = 0;
    let name = '';

    if (lowerLevel === upperLevel) {
      estimatedWords = LEVEL_TO_WORDS[lowerLevel].words;
      name = LEVEL_TO_WORDS[lowerLevel].name;
    } else {
      const lowerWords = LEVEL_TO_WORDS[lowerLevel].words;
      const upperWords = LEVEL_TO_WORDS[upperLevel].words;
      const fraction = clampedLevel - lowerLevel;
      estimatedWords = Math.round(lowerWords + (upperWords - lowerWords) * fraction);
      name = fraction < 0.5 ? LEVEL_TO_WORDS[lowerLevel].name : LEVEL_TO_WORDS[upperLevel].name;
    }

    // 归一化到 0-1 之间用于雷达图
    const normalizedLevel = clampedLevel / 9;

    return {
      level: normalizedLevel,
      name,
      estimatedWords,
      correct: correctCount,
      total: TOTAL_QUESTIONS
    };
  };

  // 回答问题
  const handleAnswer = async (selectedIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(selectedIndex);
    setShowFeedback(true);

    const currentTestWord = testWords[currentIndex];
    const isCorrect = currentTestWord.options[selectedIndex] === currentTestWord.word.translation;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    // 自适应难度调整
    let newLevel = currentLevel;
    if (isCorrect) {
      newLevel += 0.5; // 答对增加难度
    } else {
      newLevel -= 0.5; // 答错降低难度
    }
    newLevel = Math.max(1, Math.min(9, newLevel));
    setCurrentLevel(newLevel);

    setTimeout(async () => {
      if (currentIndex >= TOTAL_QUESTIONS - 1) {
        // 测试完成
        const correctCount = newAnswers.filter(a => a).length;
        const testResult = calculateResult(newLevel, correctCount);
        
        setResult(testResult);
        setTestState('complete');

        // 上传到云端
        if (userId) {
          try {
            await assessVocabulary(correctCount, TOTAL_QUESTIONS, userId);
          } catch (e) {
            console.error('Failed to save result:', e);
          }
        }

        onComplete?.(testResult);
      } else {
        // 准备下一题
        const nextWord = getNextWord(newLevel);
        if (nextWord) {
          setTestWords(prev => [...prev, nextWord]);
          setCurrentIndex(currentIndex + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
        }
      }
    }, 1000); // 1秒后进入下一题
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
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
          <span>返回</span>
        </Button>
        <Card className="text-center border-none shadow-sm">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">词汇量诊断测试</h2>
            <p className="text-muted-foreground mb-6">
              本测试包含 {TOTAL_QUESTIONS} 道选择题，采用自适应算法精准评估你的英语词汇水平。<br/>
              系统会根据你的答题情况实时调整题目难度。
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-muted/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">约 3-5 分钟</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{TOTAL_QUESTIONS} 道题目</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">CAT 自适应算法</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">精准词汇量估算</span>
              </div>
            </div>
            <Button
              onClick={startTest}
              className="px-8 py-6 rounded-xl font-semibold text-lg shadow-lg shadow-primary/20"
            >
              开始测试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 测试完成界面
  if (testState === 'complete' && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center border-none shadow-sm">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 dark:bg-green-900/30">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">测试完成！</h2>
            <p className="text-muted-foreground mb-8">你的词汇量评估结果</p>

            <div className="bg-primary/5 rounded-2xl p-6 mb-8">
              <div className="text-5xl font-bold text-primary mb-2">
                {result.estimatedWords}
              </div>
              <div className="text-muted-foreground mb-2">估算词汇量</div>
              <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                相当于 {result.name} 水平
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-foreground">{result.correct}/{result.total}</div>
                <div className="text-sm text-muted-foreground">正确题数</div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-foreground">{Math.round((result.correct / result.total) * 100)}%</div>
                <div className="text-sm text-muted-foreground">正确率</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onBack} className="px-6 py-6 rounded-xl font-semibold flex items-center gap-2">
                <Home className="w-4 h-4" />返回首页
              </Button>
              <Button onClick={startTest} className="px-6 py-6 rounded-xl font-semibold flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />重新测试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 测试进行中
  const currentTestWord = testWords[currentIndex];
  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;

  const getOptionStyle = (index: number) => {
    if (!showFeedback) return 'hover:bg-primary/5 border-transparent hover:border-primary/30';
    
    const isOptionCorrect = currentTestWord.options[index] === currentTestWord.word.translation;
    
    if (isOptionCorrect) return 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-500/50 dark:text-green-400';
    if (index === selectedAnswer) return 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-500/50 dark:text-red-400';
    
    return 'border-transparent opacity-50';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={resetTest} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" /><span>退出测试</span>
        </Button>
        <div className="text-sm text-muted-foreground">{currentIndex + 1} / {TOTAL_QUESTIONS}</div>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <div className="text-sm text-muted-foreground mb-2">请选择正确的释义</div>
            <div className="text-4xl font-bold text-foreground tracking-tight">{currentTestWord?.word.word}</div>
            <div className="text-sm text-muted-foreground mt-2 font-mono">{currentTestWord?.word.pos}</div>
          </div>

          <div className="space-y-3">
            {currentTestWord?.options.map((option, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => handleAnswer(i)}
                disabled={showFeedback}
                className={`w-full h-auto p-4 justify-start text-left font-normal text-base transition-all ${getOptionStyle(i)}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${!showFeedback ? 'bg-muted text-muted-foreground' : 
                      option === currentTestWord.word.translation ? 'bg-green-500 text-white' : 
                      i === selectedAnswer ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VocabTest;

