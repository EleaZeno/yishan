import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, BookmarkPlus, X, RotateCcw } from 'lucide-react';
import { Word, ContentType, InteractionMetrics } from '../types';
import { evaluateInteraction, predictRecallProbability } from '../lib/algorithm';
import { CONTENT_TYPE_LABELS } from '../types';

interface QuickReviewProps {
  words: Word[];
  onComplete: (results: { word: Word; metrics: InteractionMetrics }[]) => void;
  onClose: () => void;
  maxCards?: number;
}

const QuickReview: React.FC<QuickReviewProps> = ({ 
  words, 
  onComplete, 
  onClose, 
  maxCards = 10 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<{ word: Word; metrics: InteractionMetrics }[]>([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Get cards to review (due first, then random)
  const cards = words
    .filter(w => !w.deletedAt)
    .sort((a, b) => {
      const aDue = a.dueDate || 0;
      const bDue = b.dueDate || 0;
      return aDue - bDue;
    })
    .slice(0, maxCards);
  
  const currentWord = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const isComplete = currentIndex >= cards.length;

  // TTS
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Handle swipe/direction
  const handleDirection = useCallback((direction: 'left' | 'right') => {
    if (!currentWord) return;
    
    const durationMs = Date.now() - startTime;
    const metrics: InteractionMetrics = {
      wordId: currentWord.id,
      direction,
      durationMs,
      audioPlayedCount: 0,
    };
    
    const updatedWord = {
      ...currentWord,
      ...evaluateInteraction(currentWord, metrics)
    };
    
    setResults(prev => [...prev, { word: updatedWord, metrics }]);
    
    if (currentIndex + 1 >= cards.length) {
      onComplete([...results, { word: updatedWord, metrics }]);
    } else {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setStartTime(Date.now());
    }
  }, [currentWord, startTime, currentIndex, cards.length, results, onComplete]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!showAnswer) {
          setShowAnswer(true);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (showAnswer) handleDirection('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (showAnswer) handleDirection('right');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, handleDirection, onClose]);

  // Drag handlers
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      handleDirection(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  // Content type color
  const getTypeColor = (type: ContentType): string => {
    const colors: Record<ContentType, string> = {
      word: 'border-blue-500',
      formula: 'border-purple-500',
      knowledge: 'border-green-500',
      mistake: 'border-red-500',
      definition: 'border-amber-500'
    };
    return colors[type] || 'border-primary';
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">复习完成！</h2>
          <p className="text-muted-foreground mb-6">
            已完成 {results.length} 张卡片
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
          >
            返回
          </button>
        </motion.div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <p className="text-muted-foreground">没有待复习的卡片</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <button onClick={onClose} className="p-2 text-white/70 hover:text-white">
          <X size={24} />
        </button>
        <div className="flex-1 mx-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-white/60 text-sm mt-1">
            {currentIndex + 1} / {cards.length}
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={showAnswer ? handleDragEnd : undefined}
            className={`w-full max-w-sm bg-card rounded-2xl overflow-hidden border-t-4 ${
              getTypeColor(currentWord.contentType || 'word')
            }`}
          >
            {/* Content Type Badge */}
            <div className="px-4 py-2 bg-muted/50 border-b border-border">
              <span className="text-xs text-muted-foreground">
                {CONTENT_TYPE_LABELS[currentWord.contentType || 'word'].zh}
              </span>
            </div>

            {/* Question Side */}
            <div className="p-6 text-center min-h-[200px] flex flex-col justify-center">
              <div className="text-2xl font-bold text-foreground mb-2">
                {currentWord.term}
              </div>
              {currentWord.phonetic && (
                <div className="text-sm text-muted-foreground mb-2">
                  {currentWord.phonetic}
                </div>
              )}
              
              {/* TTS Button */}
              <button
                onClick={() => speak(currentWord.term)}
                className="mx-auto mt-2 p-2 rounded-full bg-muted hover:bg-muted/80"
                disabled={isSpeaking}
              >
                <Volume2 size={20} className={isSpeaking ? 'text-primary animate-pulse' : 'text-muted-foreground'} />
              </button>
            </div>

            {/* Answer Side */}
            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-6 bg-muted/30">
                    <div className="text-lg text-foreground mb-3">
                      {currentWord.definition}
                    </div>
                    {currentWord.exampleSentence && (
                      <div className="text-sm text-muted-foreground mb-1">
                        {currentWord.exampleSentence}
                      </div>
                    )}
                    {currentWord.exampleTranslation && (
                      <div className="text-sm text-muted-foreground/70">
                        {currentWord.exampleTranslation}
                      </div>
                    )}
                    
                    {/* Mistake-specific */}
                    {currentWord.contentType === 'mistake' && currentWord.correctAnswer && (
                      <div className="mt-3 p-2 bg-green-500/20 rounded-lg">
                        <span className="text-xs text-green-400">正确答案：</span>
                        <span className="text-sm text-foreground">{currentWord.correctAnswer}</span>
                      </div>
                    )}
                    
                    {/* Retention probability */}
                    <div className="mt-4 text-xs text-muted-foreground">
                      记忆留存: {Math.round(predictRecallProbability(currentWord, Date.now()) * 100)}%
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg"
          >
            显示答案
          </button>
        ) : (
          <div className="flex gap-4">
            {/* Left - Mastered */}
            <button
              onClick={() => handleDirection('left')}
              className="flex-1 py-4 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <ChevronLeft size={24} />
              掌握了
            </button>
            
            {/* Right - Review */}
            <button
              onClick={() => handleDirection('right')}
              className="flex-1 py-4 bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              再复习
              <ChevronRight size={24} />
            </button>
          </div>
        )}
        
        {/* Hint */}
        {showAnswer && (
          <p className="text-center text-white/40 text-sm mt-3">
            左滑 = 掌握了 | 右滑 = 再复习 | 方向键或点击按钮
          </p>
        )}
      </div>
    </div>
  );
};

export default QuickReview;
