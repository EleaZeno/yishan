
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Word, InteractionMetrics } from '../types';
import Flashcard from './Flashcard';
import { Search, Plus, BookDown, Loader2, PartyPopper } from 'lucide-react';
import { db } from '../services/storage';
import { evaluateInteraction } from '../lib/algorithm';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { playSound } from '../lib/sound';

interface StudySessionProps {
  dueWords: Word[];
  onComplete: () => void;
  onAddWord: () => void;
  onImportCore: () => void;
  isImporting: boolean;
  onUpdateWord: (word: Word) => void;
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
    scale: 0.9,
    rotate: direction > 0 ? 12 : -12,
    zIndex: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
    zIndex: 1,
    transition: {
      x: { type: "spring", stiffness: 450, damping: 40, mass: 0.8 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.3, ease: "easeOut" }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 500 : -500,
    opacity: 0,
    scale: 0.9,
    rotate: direction < 0 ? 12 : -12,
    zIndex: 0,
    transition: {
      x: { type: "spring", stiffness: 450, damping: 40 },
      opacity: { duration: 0.15 }
    }
  })
};

const StudySession: React.FC<StudySessionProps> = ({ 
  dueWords, onComplete, onAddWord, onImportCore, isImporting, onUpdateWord 
}) => {
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
      setSessionWords(dueWords);
      setCurrentIndex(0);
      setCompletedSet(new Set());
      setIsFinished(false);
  }, [dueWords]);

  const handleSwipe = useCallback(async (swipeDir: 'left' | 'right', metrics: InteractionMetrics) => {
    const currentWord = sessionWords[currentIndex];
    if (!currentWord || isFinished) return;

    // 立即计算下一步状态，实现乐观 UI 更新
    // Fix: Correctly destructure alpha, beta, and halflife from evaluateInteraction result
    const { alpha, beta, halflife, dueDate } = evaluateInteraction(currentWord, metrics);
    const updatedWord: Word = {
        ...currentWord,
        alpha,
        beta,
        halflife,
        dueDate,
        lastSeen: Date.now(),
        totalExposure: (currentWord.totalExposure || 0) + 1
    };

    // 背景保存，不干扰动画
    db.updateWord(updatedWord).then(() => onUpdateWord(updatedWord)).catch(console.error);

    if (swipeDir === 'left') {
        setCompletedSet(prev => new Set(prev).add(currentWord.id));
        playSound(metrics.durationMs < 900 && !metrics.isFlipped ? 'victory' : 'success');

        if (currentIndex < sessionWords.length - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    } else {
        playSound('forgot');
        const remaining = [...sessionWords];
        const [failedWord] = remaining.splice(currentIndex, 1);
        remaining.push(failedWord); 
        
        setSessionWords(remaining);
        setDirection(1);
        // 如果卡片列表刷新，自动切换到下一个
    }
  }, [currentIndex, sessionWords, isFinished, onUpdateWord]);

  // 背景层级渲染优化
  const backgroundStack = useMemo(() => {
    const next = sessionWords[currentIndex + 1];
    return (
        <AnimatePresence mode="popLayout">
            {next && (
                <motion.div 
                    key={next.id}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 0.3, scale: 0.95, y: 10 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none gpu-accelerated"
                >
                    <Flashcard word={next} onSwipe={() => {}} isFront={false} />
                </motion.div>
            )}
        </AnimatePresence>
    );
  }, [sessionWords, currentIndex]);

  if (isFinished) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8 text-indigo-600">
                <PartyPopper size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">交互圆满</h2>
            <p className="text-slate-400 mb-12 max-w-xs mx-auto text-sm font-semibold leading-relaxed">
                所有认知连接已在当前周期内完成对齐。
            </p>
            <button 
                onClick={onComplete}
                className="w-full max-w-xs px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
            >
                结束交互
            </button>
        </div>
    );
  }

  if (sessionWords.length === 0) {
    return (
         <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                <Search size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">暂无待校准信号</h2>
            <p className="text-slate-400 text-sm mt-3 font-medium">目前的记忆稳定性均处于高阈值区间。</p>
            <div className="flex flex-col gap-4 mt-12 w-full max-w-xs">
                 <button 
                    onClick={onAddWord}
                    className="w-full px-6 py-5 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                >
                    <Plus size={20} /> 添加新单词
                </button>
                <button 
                    onClick={onImportCore}
                    disabled={isImporting}
                    className="w-full px-6 py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-95 transition-all"
                >
                    {isImporting ? <Loader2 size={20} className="animate-spin"/> : <BookDown size={20} />} 导入核心词包
                </button>
            </div>
         </div>
    );
  }

  const progress = sessionWords.length > 0 ? Math.min(100, (completedSet.size / sessionWords.length) * 100) : 0;
  const currentWord = sessionWords[currentIndex];

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative pt-6 pb-12 px-5 md:px-0">
         {/* 进度控制 */}
         <div className="flex-none mb-10">
            <div className="flex justify-between items-end mb-5 px-1">
                <div className="space-y-1">
                    <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">FLUX ENGINE V4.2</h2>
                    <p className="text-xs text-slate-400 font-bold">无感认知环境</p>
                </div>
                <div className="text-right">
                    <span className="text-lg font-black text-slate-900 tracking-tighter">
                        {completedSet.size}<span className="text-slate-200 mx-1">/</span>{sessionWords.length}
                    </span>
                </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100/80 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-indigo-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </div>
         </div>

         {/* 卡片容器 */}
         <div className="flex-1 relative w-full perspective-1200 min-h-[440px] md:min-h-[540px]">
            {backgroundStack}

            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={currentWord.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full h-full absolute inset-0 gpu-accelerated"
                >
                    <Flashcard 
                        word={currentWord} 
                        onSwipe={handleSwipe}
                    />
                </motion.div>
            </AnimatePresence>
         </div>
         
         {/* 操作辅助 */}
         <div className="flex-none mt-14 flex justify-center gap-10">
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">向左: 已掌握</span>
            </div>
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">向右: 需复习</span>
            </div>
         </div>
    </div>
  );
};

export default StudySession;