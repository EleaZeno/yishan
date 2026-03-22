import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Word, InteractionMetrics } from '../types';
import { Volume2, Sparkles } from 'lucide-react';
import { playSound } from '../lib/sound';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

interface FlashcardProps {
  word: Word;
  onSwipe: (direction: 'left' | 'right', metrics: InteractionMetrics) => void;
  isFront?: boolean;
}

// ==================== 常量配置 ====================
const CONFIG = {
  SWIPE_THRESHOLD: 100,
  VELOCITY_THRESHOLD: 400,
  ANIMATION_SPRING: { stiffness: 300, damping: 28, mass: 0.8 },
  AUDIO_DURATION_MS: 3000,
};

const Flashcard: React.FC<FlashcardProps> = ({ word, onSwipe, isFront = true }) => {
  const [flipped, setFlipped] = useState(false);
  const [audioCount, setAudioCount] = useState(0);
  const mountTimeRef = useRef<number>(Date.now());

  // ==================== 动画优化 ====================
  const xBase = useMotionValue(0);
  
  // 使用 useSpring 优化动画性能
  const x = useSpring(xBase, { stiffness: CONFIG.ANIMATION_SPRING.stiffness, damping: CONFIG.ANIMATION_SPRING.damping });
  
  // 旋转 - 限制范围避免过度计算
  const rotate = useTransform(x, [-250, 250], [-12, 12]);
  
  // 缩放 - 使用更平滑的曲线
  const scale = useTransform(x, [-150, 0, 150], [0.96, 1, 0.96]);

  // 透明度控制 - 使用 useMemo 缓存
  const leftOpacity = useTransform(x, [-150, -50], [1, 0]);
  const rightOpacity = useTransform(x, [50, 150], [0, 1]);
  const cardOpacity = useTransform(x, [-480, -400, 0, 400, 480], [0, 1, 1, 1, 0]);

  // ==================== 重置逻辑 ====================
  useEffect(() => {
    mountTimeRef.current = Date.now();
    setFlipped(false);
    setAudioCount(0);
    xBase.set(0);
  }, [word, xBase]);

  // ==================== 音频播放 ====================
  const handlePlayAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAudioCount(prev => prev + 1);
    playSound('click');
    
    const utterance = new SpeechSynthesisUtterance(word.term);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // ==================== 点击翻转 ====================
  const handleFlip = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    
    if (Math.abs(xBase.get()) < 5) {
      playSound('flip');
      setFlipped(!flipped);
    }
  };

  // ==================== 拖拽结束处理 ====================
  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { offset, velocity } = info;
    
    if (offset.x > CONFIG.SWIPE_THRESHOLD || velocity.x > CONFIG.VELOCITY_THRESHOLD) {
      triggerSwipe('right');
    } else if (offset.x < -CONFIG.SWIPE_THRESHOLD || velocity.x < -CONFIG.VELOCITY_THRESHOLD) {
      triggerSwipe('left');
    } else {
      // 弹回
      xBase.set(0);
    }
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? 800 : -800;
    const durationMs = Date.now() - mountTimeRef.current;

    const metrics: InteractionMetrics = {
      durationMs,
      isFlipped: flipped,
      audioPlayedCount: audioCount,
      direction,
    };

    xBase.set(targetX);
    onSwipe(direction, metrics);
  };

  // ==================== 正面卡片 ====================
  const FrontFace = memo(() => (
    <div className="absolute inset-0 w-full h-full bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-8 backface-hidden border border-slate-100/50 overflow-hidden group">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-full -translate-y-24 translate-x-24 blur-3xl" />
      
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
        {/* 标签 */}
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50/80 text-indigo-600 text-[10px] font-black rounded-full mb-12 tracking-[0.2em] uppercase">
          <Sparkles size={12} className="fill-indigo-600" />
          NEURAL NODE
        </div>
        
        {/* 单词 */}
        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight break-words max-w-full text-center">
          {word.term}
        </h2>
        
        {/* 音标 */}
        {word.phonetic && (
          <p className="mt-6 text-slate-400 font-semibold text-xl md:text-2xl font-mono">
            {word.phonetic}
          </p>
        )}
        
        {/* 音频按钮 */}
        <button
          onClick={handlePlayAudio}
          className="mt-14 w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all active:scale-90 border border-slate-100 shadow-sm"
        >
          <Volume2 size={28} />
        </button>
      </div>
      
      <div className="mt-auto py-6 opacity-30">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Tap to Inspect</p>
      </div>
    </div>
  ));

  // ==================== 背面卡片 ====================
  const BackFace = memo(() => (
    <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col p-8 backface-hidden rotate-y-180 border border-slate-800 overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      
      {/* 单词标题 */}
      <div className="flex justify-between items-center mb-10 flex-none border-b border-slate-800/50 pb-6">
        <h3 className="text-2xl font-black text-white tracking-tight truncate">
          {word.term}
        </h3>
        <button
          onClick={handlePlayAudio}
          className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-400 active:scale-95 transition-colors"
        >
          <Volume2 size={20} />
        </button>
      </div>

      {/* 释义区域 */}
      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
        <div className="space-y-4">
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Signal Definition</p>
          <p className="text-3xl text-slate-100 font-bold leading-tight">
            {word.definition}
          </p>
        </div>
        
        {/* 例句 */}
        {word.exampleSentence && (
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
            <p className="text-slate-300 font-medium text-lg leading-relaxed italic mb-4">
              "{word.exampleSentence}"
            </p>
            {word.exampleTranslation && (
              <p className="text-slate-500 text-sm font-medium">
                {word.exampleTranslation}
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* 底部信息 */}
      <div className="flex-none mt-6 pt-4 flex justify-between items-center opacity-40">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">YiShan v4.2</span>
        <div className="flex gap-1.5">
          {[1,2,3].map(i => (
            <div key={i} className={`w-1 h-1 rounded-full ${i <= 3 - (audioCount % 4) ? 'bg-indigo-500' : 'bg-indigo-500/20'}`} />
          ))}
        </div>
      </div>
    </div>
  ));

  // ==================== 渲染 ====================
  if (!isFront) {
    return (
      <div className="absolute top-0 left-0 w-full h-full bg-white rounded-[2.5rem] shadow-sm border border-slate-100 transform scale-95 translate-y-2 -z-10 opacity-30" />
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing perspective-[1200px] touch-none select-none"
      style={{ x, rotate, scale, opacity: cardOpacity, zIndex: 10 }}
      drag="x"
      dragElastic={0.01}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onClick={handleFlip}
    >
      {/* 滑动指示器 */}
      <motion.div
        style={{ opacity: leftOpacity }}
        className="absolute inset-0 z-[-30] bg-emerald-500/90 backdrop-blur-[4px] rounded-[2.5rem] pointer-events-none flex items-center justify-start pl-16"
      >
        <span className="font-black text-3xl text-white uppercase tracking-[0.3em]">Mastered</span>
      </motion.div>

      <motion.div
        style={{ opacity: rightOpacity }}
        className="absolute inset-0 z-[-30] bg-rose-500/90 backdrop-blur-[4px] rounded-[2.5rem] pointer-events-none flex items-center justify-end pr-16"
      >
        <span className="font-black text-3xl text-white uppercase tracking-[0.3em]">Review</span>
      </motion.div>

      {/* 翻转容器 */}
      <motion.div
        className="relative w-full h-full preserve-3d"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.8 }}
      >
        <FrontFace />
        <BackFace />
      </motion.div>
    </motion.div>
  );
};

// 性能优化：使用 React.memo 避免不必要的重渲染
export default memo(Flashcard);
