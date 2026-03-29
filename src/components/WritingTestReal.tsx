import React, { useState } from 'react';
import { PenTool, Check, X, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface WritingTestProps {
  userId?: string;
  onBack: () => void;
}

// 写作题目
const writingQuestions = [
  { 
    id: 1, 
    word: 'apple', 
    hint: '一种红色的水果',
    example: 'I eat an apple every day.',
  },
  { 
    id: 2, 
    word: 'beautiful', 
    hint: '形容外表好看的',
    example: 'The sunset is beautiful.',
  },
  { 
    id: 3, 
    word: 'environment', 
    hint: '我们生存的周围环境',
    example: 'We should protect the environment.',
  },
  { 
    id: 4, 
    word: 'development', 
    hint: '事物向好的方向变化',
    example: 'The city has seen rapid development.',
  },
  { 
    id: 5, 
    word: 'knowledge', 
    hint: '通过学习获得的信息',
    example: 'Knowledge is power.',
  },
];

export default function WritingTest({ userId, onBack }: WritingTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userSentence, setUserSentence] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState('');

  const question = writingQuestions[currentQuestion];

  // 简单评分逻辑
  const evaluateSentence = (sentence: string, word: string): { score: number; feedback: string } => {
    const lowerSentence = sentence.toLowerCase().trim();
    const lowerWord = word.toLowerCase();
    
    if (!lowerSentence) {
      return { score: 0, feedback: '请输入句子' };
    }
    
    // 检查是否包含目标单词
    const hasWord = lowerSentence.includes(lowerWord);
    
    // 检查句子长度
    const wordCount = lowerSentence.split(/\s+/).length;
    
    // 检查基本语法（首字母大写，结尾有标点）
    const hasCapital = sentence[0] === sentence[0]?.toUpperCase();
    const hasPunctuation = /[.!?]/.test(sentence.slice(-1));
    
    let totalScore = 0;
    let feedbacks: string[] = [];
    
    if (hasWord) {
      totalScore += 40;
      feedbacks.push('✓ 正确使用了目标单词');
    } else {
      feedbacks.push('✗ 未使用目标单词');
    }
    
    if (wordCount >= 3) {
      totalScore += 20;
      feedbacks.push('✓ 句子长度合适');
    } else {
      feedbacks.push('✗ 句子太短');
    }
    
    if (hasCapital) {
      totalScore += 20;
      feedbacks.push('✓ 首字母大写');
    } else {
      feedbacks.push('✗ 首字母应大写');
    }
    
    if (hasPunctuation) {
      totalScore += 20;
      feedbacks.push('✓ 结尾有标点');
    } else {
      feedbacks.push('✗ 结尾应有标点');
    }
    
    return { score: totalScore, feedback: feedbacks.join('\n') };
  };

  // 提交答案
  const handleSubmit = () => {
    if (!userSentence.trim()) {
      toast.error('请输入句子');
      return;
    }
    
    const result = evaluateSentence(userSentence, question.word);
    setFeedback(result.feedback);
    setIsSubmitted(true);
    
    if (result.score >= 60) {
      setScore(score + 1);
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentQuestion < writingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserSentence('');
      setIsSubmitted(false);
      setFeedback('');
    } else {
      setIsFinished(true);
    }
  };

  // 重新开始
  const handleRestart = () => {
    setCurrentQuestion(0);
    setUserSentence('');
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
    setFeedback('');
  };

  if (isFinished) {
    const percentage = Math.round((score / writingQuestions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl font-black text-primary">{percentage}%</span>
          </div>
          <h2 className="text-2xl font-black">测试完成</h2>
          <p className="text-muted-foreground">
            通过 {score} / {writingQuestions.length} 题
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <Button onClick={handleRestart} variant="outline">
              <RefreshCw size={16} className="mr-2" />
              再测一次
            </Button>
            <Button onClick={onBack}>
              返回
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
          返回
        </button>
        <span className="text-sm text-muted-foreground">
          {currentQuestion + 1} / {writingQuestions.length}
        </span>
      </div>

      {/* Progress */}
      <Progress value={(currentQuestion / writingQuestions.length) * 100} />

      {/* Question */}
      <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
        {/* Word to use */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">请用以下单词造句</p>
          <h3 className="text-3xl font-black text-primary">{question.word}</h3>
          <p className="text-sm text-muted-foreground mt-2">💡 {question.hint}</p>
        </div>

        {/* Example */}
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">示例：</p>
          <p className="text-foreground italic">{question.example}</p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            placeholder="输入你的句子..."
            className="min-h-[100px] text-lg"
            disabled={isSubmitted}
          />
        </div>

        {/* Feedback */}
        {isSubmitted && (
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm whitespace-pre-line">{feedback}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          {!isSubmitted ? (
            <Button onClick={handleSubmit} className="flex-1">
              <PenTool size={16} className="mr-2" />
              提交
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {currentQuestion < writingQuestions.length - 1 ? '下一题' : '查看结果'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}