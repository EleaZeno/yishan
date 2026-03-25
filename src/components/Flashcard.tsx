import React, { useState, useRef, useCallback } from 'react';
import { Word, InteractionMetrics } from '../types';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Volume2 } from 'lucide-react';

interface FlashcardProps {
  word: Word;
  onSwipe: (direction: 'left' | 'right', metrics: InteractionMetrics) => void;
  isFront?: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, onSwipe, isFront = true }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [audioPlayedCount, setAudioPlayedCount] = useState(0);
  const startTimeRef = useRef(Date.now());
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);
  const opacity = useTransform(x, [-250, -100, 0, 100, 250], [0, 1, 1, 1, 0]);

  // 左滑指示器透明度（已掌握）
  const leftIndicatorOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  // 右滑指示器透明度（待复习）
  const rightIndicatorOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1]);

  const triggerSwipe = useCallback((direction: 'left' | 'right') => {
    const metrics: InteractionMetrics = {
      durationMs: Date.now() - startTimeRef.current,
      isFlipped,
      audioPlayedCount,
      direction,
    };
    const targetX = direction === 'left' ? -600 : 600;
    animate(x, targetX, {
      type: 'spring',
      stiffness: 400,
      damping: 35,
      onComplete: () => onSwipe(direction, metrics),
    });
  }, [isFlipped, audioPlayedCount, onSwipe, x]);

  const handleDragStart = (_: any, info: any) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (_: any, info: any) => {
    isDraggingRef.current = false;
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset < -threshold || velocity < -500) {
      triggerSwipe('left');
    } else if (offset > threshold || velocity > 500) {
      triggerSwipe('right');
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 });
      animate(y, 0, { type: 'spring', stiffness: 500, damping: 40 });
    }
  };

  const handleClick = () => {
    if (!isDraggingRef.current && isFront) {
      setIsFlipped(prev => !prev);
    }
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.term);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      setAudioPlayedCount(prev => prev + 1);
    }
  };

  // 背景卡片（堆叠效果）
  if (!isFront) {
    return (
      <div className="w-full h-full rounded-[2rem] bg-white border border-slate-100 shadow-sm" />
    );
  }

  return (
    <motion.div
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      style={{ x, y, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
    >
      {/* 卡片主体 */}
      <div className="relative w-full h-full rounded-[2rem] bg-white border-2 border-slate-100 shadow-2xl overflow-hidden flex flex-col">

        {/* 左滑指示：已掌握 */}
        <motion.div
          className="absolute top-8 left-6 z-10 px-4 py-2 bg-emerald-500 text-white rounded-2xl font-black text-sm tracking-wide -rotate-12 shadow-lg"
          style={{ opacity: leftIndicatorOpacity }}
        >
          ✓ 已掌握
        </motion.div>

        {/* 右滑指示：待复习 */}
        <motion.div
          className="absolute top-8 right-6 z-10 px-4 py-2 bg-rose-500 text-white rounded-2xl font-black text-sm tracking-wide rotate-12 shadow-lg"
          style={{ opacity: rightIndicatorOpacity }}
        >
          ↻ 再复习
        </motion.div>

        {/* 卡片内容 */}
        <div className="flex-1 flex flex-col p-7 pt-8">

          {/* 顶部：单词 + 音标 + 发音 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 pr-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">
                {word.term}
              </h2>
              {word.phonetic && (
                <p className="text-sm text-slate-400 font-medium">{word.phonetic}</p>
              )}
            </div>
            <button
              onClick={handleAudio}
              className="flex-none w-11 h-11 rounded-2xl bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center transition-colors text-slate-500"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* 中间：正面 or 背面内容 */}
          <div className="flex-1 flex flex-col justify-center">
            {!isFlipped ? (
              /* 正面：提示点击翻转 */
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <span className="text-2xl">👆</span>
                </div>
                <p className="text-sm text-slate-400 font-semibold">点击查看释义</p>
              </div>
            ) : (
              /* 背面：释义 + 例句 */
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-base font-bold text-slate-800 leading-relaxed">
                    {word.definition}
                  </p>
                </div>
                {word.exampleSentence && (
                  <div className="bg-indigo-50 rounded-2xl p-4">
                    <p className="text-sm text-indigo-700 italic leading-relaxed">
                      "{word.exampleSentence}"
                    </p>
                    {word.exampleTranslation && (
                      <p className="text-xs text-indigo-400 mt-2 font-medium">
                        {word.exampleTranslation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 底部：标签 + 熟练度 */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
            <div className="flex gap-1.5 flex-wrap">
              {word.tags?.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                (word.totalExposure || 0) === 0 ? 'bg-slate-300' :
                (word.halflife || 0) > 20160 ? 'bg-emerald-400' :
                (word.halflife || 0) > 2880 ? 'bg-indigo-400' : 'bg-rose-400'
              }`} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Lv.{word.totalExposure || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Flashcard;
