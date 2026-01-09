
import React, { useState, useEffect } from 'react';
import { Word, InteractionMetrics } from '../types';
import Flashcard from './Flashcard';
import { Search, Plus, BookDown, Loader2, PartyPopper, ChevronLeft, ChevronRight } from 'lucide-react';
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

// 动画变体：定义轮盘切换效果
// Added explicit type Variants to resolve type incompatibility with motion.div which expects literal types for transitions
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? -400 : 400,
    opacity: 0,
    scale: 0.8,
    rotateY: direction > 0 ? -15 : 15,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.3 }
    }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? -400 : 400,
    opacity: 0,
    scale: 0.8,
    rotateY: direction < 0 ? 15 : -15,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
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
  // direction: 1 为右滑（向右移），-1 为左滑（向左移）
  const [swipeDir, setSwipeDir] = useState<number>(0);

  useEffect(() => {
      setSessionWords(dueWords);
      setCurrentIndex(0);
      setCompletedSet(new Set());
      setIsFinished(false);
      setSwipeDir(0);
  }, [dueWords]);

  const handleSwipe = async (direction: 'left' | 'right', metrics: InteractionMetrics) => {
    const currentWord = sessionWords[currentIndex];
    if (!currentWord) return;

    // 更新滑动方向状态以触发动画
    const dirValue = direction === 'right' ? 1 : -1;
    setSwipeDir(dirValue);

    // 1. 调用隐式评估算法
    const { weight, stability, dueDate } = evaluateInteraction(currentWord, metrics);

    const updatedWord: Word = {
        ...currentWord,
        weight,
        stability,
        dueDate,
        lastSeen: Date.now(),
        totalExposure: (currentWord.totalExposure || 0) + 1
    };

    // 2. 持久化
    db.updateWord(updatedWord).then(() => onUpdateWord(updatedWord)).catch(console.error);

    // 3. 标记完成逻辑
    if (direction === 'right') {
        setCompletedSet(prev => new Set(prev).add(currentWord.id));
        
        if (metrics.durationMs < 1000 && !metrics.isFlipped) {
            playSound('victory');
        } else {
            playSound('success');
        }

        if (currentIndex < sessionWords.length - 1) {
            // 延迟微小时间让 Flashcard 的原生动画先运行完成
            setTimeout(() => setCurrentIndex(prev => prev + 1), 50);
        } else {
            if (completedSet.size + 1 >= sessionWords.length) {
                setTimeout(() => setIsFinished(true), 300);
            }
        }
    } else {
        playSound('forgot');
        if (currentIndex > 0) {
            setTimeout(() => setCurrentIndex(prev => prev - 1), 50);
        } else {
            // 如果是第一个且左滑，仅重置状态
            setSwipeDir(0);
        }
    }
  };

  if (isFinished) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8 text-indigo-500">
                <PartyPopper size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter">本组复习完成</h2>
            <p className="text-slate-400 mb-10 max-w-xs mx-auto text-sm font-medium leading-relaxed">
                所有到期信号已根据您的交互行为重新校准。
            </p>
            <button 
                onClick={onComplete}
                className="w-full max-w-xs px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
                结束会话
            </button>
        </div>
    );
  }

  if (sessionWords.length === 0) {
    return (
         <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Search size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">当前没有到期的信号</h2>
            <p className="text-slate-400 text-sm mt-2">您的所有记忆节点目前都处于稳定状态。</p>
            <div className="flex flex-col gap-3 mt-10 w-full max-w-xs">
                 <button 
                    onClick={onAddWord}
                    className="w-full px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-50"
                >
                    <Plus size={18} /> 载入新信息
                </button>
                <button 
                    onClick={onImportCore}
                    disabled={isImporting}
                    className="w-full px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                    {isImporting ? <Loader2 size={18} className="animate-spin"/> : <BookDown size={18} />} 导入核心词库
                </button>
            </div>
         </div>
    );
  }

  const progress = sessionWords.length > 0 ? Math.min(100, Math.round((completedSet.size / sessionWords.length) * 100)) : 0;
  const currentWord = sessionWords[currentIndex];

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto relative pt-6 pb-10">
         <div className="flex-none px-6 mb-8">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">认知交互流</h2>
                    <p className="text-xs text-indigo-500 font-bold mt-0.5">轮盘无感评估 (Flux-v4)</p>
                </div>
                <span className="text-sm font-black text-slate-800 tracking-tighter">
                    {currentIndex + 1} <span className="text-slate-300 mx-1">/</span> {sessionWords.length}
                </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-600 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
         </div>

         <div className="flex-1 relative w-full perspective-1000 px-6 overflow-visible">
            <AnimatePresence initial={false} custom={swipeDir} mode="popLayout">
                <motion.div
                    key={currentWord.id}
                    custom={swipeDir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full h-full absolute inset-0 px-6"
                >
                    <Flashcard 
                        word={currentWord} 
                        onSwipe={handleSwipe}
                    />
                </motion.div>
            </AnimatePresence>
         </div>
         
         <div className="flex-none px-6 mt-8 flex justify-center text-slate-300 gap-8">
             <div className="flex flex-col items-center gap-1 opacity-40">
                <ChevronLeft size={16} />
                <span className="text-[8px] font-black uppercase tracking-widest">左滑: 不熟</span>
             </div>
             <div className="flex flex-col items-center gap-1 opacity-40">
                <ChevronRight size={16} />
                <span className="text-[8px] font-black uppercase tracking-widest">右滑: 掌握</span>
             </div>
         </div>
    </div>
  );
};

export default StudySession;
