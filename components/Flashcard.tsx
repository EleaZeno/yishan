
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
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
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
    utterance.rate = 0.95;
    synth.speak(utterance);
  };

  const handleFlip = () => {
    if (!flipped) {
      playSound('flip');
      setFlipped(true);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      triggerSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      triggerSwipe('left');
    } else {
      animate(x, 0, { type: "spring", stiffness: 450, damping: 25 });
    }
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? 500 : -500;
    const durationMs = Date.now() - mountTimeRef.current;
    
    const metrics: InteractionMetrics = {
      durationMs,
      isFlipped: flipped,
      audioPlayedCount: audioCount,
      direction
    };

    // 原生动画完成后通知父组件
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
    <div className="absolute inset-0 w-full h-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center p-8 backface-hidden border border-slate-100">
         <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-full mb-8 tracking-widest uppercase">
                Memory Node
            </div>
            <h2 className="text-5xl font-extrabold text-slate-800 text-center tracking-tighter break-words max-w-full leading-tight">
                {word.term}
            </h2>
            {word.phonetic && <p className="mt-4 text-slate-400 font-medium text-lg">{word.phonetic}</p>}
            
            <div className="mt-12">
                <button 
                  onClick={handlePlayAudio} 
                  className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-500 transition-all active:scale-90"
                >
                    <Volume2 size={24} />
                </button>
            </div>
         </div>
         <div className="mt-auto flex items-center gap-2 text-slate-300 text-[10px] font-black py-6 uppercase tracking-[0.2em]">
             点击揭开解析
         </div>
    </div>
  );

  const BackFace = () => (
    <div className="absolute inset-0 w-full h-full bg-slate-50 rounded-[2.5rem] shadow-lg flex flex-col p-8 backface-hidden rotate-y-180 border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{word.term}</h3>
            <button onClick={handlePlayAudio} className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400 active:scale-90"><Volume2 size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
            <div className="mb-6">
               <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1.5">释义</p>
               <p className="text-2xl text-slate-800 font-bold leading-snug">{word.definition}</p>
            </div>
            
            {word.exampleSentence && (
                <div className="bg-white/90 p-5 rounded-3xl border border-white shadow-sm mb-4">
                    <p className="text-slate-600 font-medium text-base leading-relaxed mb-2 italic">"{word.exampleSentence}"</p>
                    <p className="text-slate-400 text-xs font-medium">{word.exampleTranslation}</p>
                </div>
            )}
        </div>
        
        <div className="mt-auto py-4 flex flex-col items-center">
            <div className="h-1 w-12 bg-slate-200 rounded-full mb-2"></div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">掌握后右滑通过</p>
        </div>
    </div>
  );

  if (!isFront) {
      return (
        <div className="absolute top-0 left-0 w-full h-full bg-slate-200 rounded-[2.5rem] opacity-20 transform scale-95 translate-y-6" />
      );
  }

  return (
    <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing perspective-1000 touch-none"
        style={{ x, rotate, opacity: cardOpacity, zIndex: 10 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onClick={handleFlip}
    >
        <motion.div style={{ opacity: leftOpacity }} className="absolute inset-0 z-30 bg-rose-500 rounded-[2.5rem] pointer-events-none flex items-center justify-end pr-10">
             <div className="flex flex-col items-center text-white">
                <ChevronLeft size={32} strokeWidth={3} />
                <span className="font-black text-xs uppercase tracking-widest">不熟悉</span>
             </div>
        </motion.div>
        <motion.div style={{ opacity: rightOpacity }} className="absolute inset-0 z-30 bg-emerald-500 rounded-[2.5rem] pointer-events-none flex items-center justify-start pl-10">
             <div className="flex flex-col items-center text-white">
                <ChevronRight size={32} strokeWidth={3} />
                <span className="font-black text-xs uppercase tracking-widest">已掌握</span>
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
