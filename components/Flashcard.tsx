
import React, { useState, useEffect, useRef } from 'react';
import { Word, InteractionMetrics } from '../types';
import { Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import { playSound } from '../lib/sound';
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";

interface FlashcardProps {
  word: Word;
  onSwipe: (direction: 'left' | 'right', metrics: InteractionMetrics) => void;
  isFront?: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, onSwipe, isFront = true }) => {
  const [flipped, setFlipped] = useState(false);
  const [audioCount, setAudioCount] = useState(0);
  
  const mountTimeRef = useRef<number>(Date.now());

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const leftOpacity = useTransform(x, [-150, -50], [0.9, 0]);
  const rightOpacity = useTransform(x, [50, 150], [0, 0.9]);
  const cardOpacity = useTransform(x, [-300, 0, 300], [0, 1, 0]);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    setFlipped(false);
    setAudioCount(0);
    x.set(0);
  }, [word, x]);

  const handlePlayAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAudioCount(prev => prev + 1);
    playSound('click');
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(word.term);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    synth.speak(utterance);
  };

  const handleFlip = (e: React.MouseEvent) => {
    // 阻止点击发音按钮或链接时触发翻转
    if ((e.target as HTMLElement).closest('button')) return;
    
    if (!flipped) {
      playSound('flip');
      setFlipped(true);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 80;
    if (info.offset.x > swipeThreshold) {
      triggerSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      triggerSwipe('left');
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
    }
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? 600 : -600;
    const durationMs = Date.now() - mountTimeRef.current;
    
    const metrics: InteractionMetrics = {
      durationMs,
      isFlipped: flipped,
      audioPlayedCount: audioCount,
      direction
    };

    animate(x, targetX, { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      onComplete: () => {
        onSwipe(direction, metrics);
      }
    });
  };

  const FrontFace = () => (
    <div className="absolute inset-0 w-full h-full bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-6 md:p-10 backface-hidden border border-slate-100">
         <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-full mb-6 md:mb-10 tracking-widest uppercase">
                Memory Node
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-800 text-center tracking-tighter break-words max-w-full leading-tight">
                {word.term}
            </h2>
            {word.phonetic && <p className="mt-3 md:mt-5 text-slate-400 font-medium text-lg md:text-xl">{word.phonetic}</p>}
            
            <div className="mt-8 md:mt-12">
                <button 
                  onClick={handlePlayAudio} 
                  className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-500 transition-all active:scale-90 border border-slate-100"
                >
                    <Volume2 size={24} />
                </button>
            </div>
         </div>
         <div className="mt-auto flex items-center gap-2 text-slate-300 text-[10px] font-black py-4 md:py-6 uppercase tracking-[0.2em]">
             点击揭开解析
         </div>
    </div>
  );

  const BackFace = () => (
    <div className="absolute inset-0 w-full h-full bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] shadow-lg flex flex-col p-6 md:p-10 backface-hidden rotate-y-180 border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center mb-4 md:mb-6 flex-none">
            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight truncate pr-4">{word.term}</h3>
            <button 
              onClick={handlePlayAudio} 
              className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-500 active:scale-90 border border-slate-100"
            >
              <Volume2 size={18} />
            </button>
        </div>

        {/* 核心改动：增加滚动区域并优化最大高度 */}
        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-4 md:space-y-6">
            <div>
               <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1.5">释义</p>
               <p className="text-xl md:text-3xl text-slate-800 font-bold leading-tight md:leading-snug">
                  {word.definition}
               </p>
            </div>
            
            {word.exampleSentence && (
                <div className="bg-white/80 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white shadow-sm">
                    <p className="text-slate-600 font-medium text-base md:text-lg leading-relaxed mb-2 md:mb-3 italic">
                      "{word.exampleSentence}"
                    </p>
                    <p className="text-slate-400 text-xs md:text-sm font-medium">
                      {word.exampleTranslation}
                    </p>
                </div>
            )}

            {word.tags && word.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {word.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            )}
        </div>
        
        <div className="flex-none mt-4 pt-2 border-t border-slate-200/50 flex flex-col items-center">
            <div className="h-1 w-10 bg-slate-200 rounded-full mb-2"></div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">掌握后右滑/键盘右键通过</p>
        </div>
    </div>
  );

  if (!isFront) {
      return (
        <div className="absolute top-0 left-0 w-full h-full bg-slate-200 rounded-[2rem] md:rounded-[2.5rem] opacity-20 transform scale-95 translate-y-6" />
      );
  }

  return (
    <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing perspective-1000 touch-none select-none"
        style={{ x, rotate, opacity: cardOpacity, zIndex: 10 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onClick={handleFlip}
    >
        <motion.div style={{ opacity: leftOpacity }} className="absolute inset-0 z-30 bg-rose-500 rounded-[2rem] md:rounded-[2.5rem] pointer-events-none flex items-center justify-end pr-10">
             <div className="flex flex-col items-center text-white">
                <ChevronLeft size={48} strokeWidth={3} className="mb-1" />
                <span className="font-black text-sm uppercase tracking-[0.2em]">不熟悉</span>
             </div>
        </motion.div>
        <motion.div style={{ opacity: rightOpacity }} className="absolute inset-0 z-30 bg-emerald-500 rounded-[2rem] md:rounded-[2.5rem] pointer-events-none flex items-center justify-start pl-10">
             <div className="flex flex-col items-center text-white">
                <ChevronRight size={48} strokeWidth={3} className="mb-1" />
                <span className="font-black text-sm uppercase tracking-[0.2em]">已掌握</span>
             </div>
        </motion.div>
        <motion.div className="relative w-full h-full preserve-3d" initial={false} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <FrontFace />
            <BackFace />
        </motion.div>
    </motion.div>
  );
};

export default Flashcard;
