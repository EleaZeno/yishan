import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Check, X, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface ListeningTestProps {
  userId?: string;
  onBack: () => void;
}

// 模拟听力题库
const listeningQuestions = [
  { id: 1, word: 'apple', audio: 'The apple is red', options: ['苹果', '香蕉', '橙子', '葡萄'], answer: 0 },
  { id: 2, word: 'beautiful', audio: 'She is beautiful', options: ['漂亮的', '聪明的', '善良的', '勇敢的'], answer: 0 },
  { id: 3, word: 'climate', audio: 'The climate is changing', options: ['天气', '气候', '环境', '温度'], answer: 1 },
  { id: 4, word: 'development', audio: 'Economic development', options: ['发展', '进步', '增长', '繁荣'], answer: 0 },
  { id: 5, word: 'environment', audio: 'Protect the environment', options: ['环境', '自然', '生态', '资源'], answer: 0 },
];

export default function ListeningTest({ userId, onBack }: ListeningTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const question = listeningQuestions[currentQuestion];

  // 检查语音合成支持
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      toast.error('您的浏览器不支持语音合成');
    }
  }, []);

  // 播放语音
  const playAudio = () => {
    if (!speechSupported) return;
    
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(question.audio);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error('语音播放失败');
    };
    
    speechSynthesis.speak(utterance);
  };

  // 选择答案
  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const correct = index === question.answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentQuestion < listeningQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setIsFinished(true);
    }
  };

  // 重新开始
  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / listeningQuestions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl font-black text-primary">{percentage}%</span>
          </div>
          <h2 className="text-2xl font-black">测试完成</h2>
          <p className="text-muted-foreground">
            正确 {score} / {listeningQuestions.length} 题
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
          {currentQuestion + 1} / {listeningQuestions.length}
        </span>
      </div>

      {/* Progress */}
      <Progress value={(currentQuestion / listeningQuestions.length) * 100} />

      {/* Question */}
      <div className="bg-card rounded-2xl p-6 border border-border space-y-6">
        {/* Audio Button */}
        <div className="text-center">
          <button
            onClick={playAudio}
            disabled={isPlaying || !speechSupported}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${
              isPlaying 
                ? 'bg-primary text-primary-foreground animate-pulse' 
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            {speechSupported ? (
              <Volume2 size={32} />
            ) : (
              <VolumeX size={32} />
            )}
          </button>
          <p className="text-sm text-muted-foreground mt-3">
            {isPlaying ? '正在播放...' : '点击播放听力'}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isAnswer = index === question.answer;
            
            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? isCorrect
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-red-500 bg-red-500/10'
                    : selectedAnswer !== null && isAnswer
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {isSelected && (
                    isCorrect ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />
                  )}
                  {selectedAnswer !== null && isAnswer && !isSelected && (
                    <Check size={20} className="text-green-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {selectedAnswer !== null && (
          <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
            <p className="font-medium">
              {isCorrect ? '✓ 回答正确！' : `✗ 正确答案是：${question.options[question.answer]}`}
            </p>
          </div>
        )}

        {/* Next Button */}
        {selectedAnswer !== null && (
          <Button onClick={handleNext} className="w-full">
            {currentQuestion < listeningQuestions.length - 1 ? '下一题' : '查看结果'}
          </Button>
        )}
      </div>
    </div>
  );
}