
import React, { useState, useEffect, useRef } from 'react';
import { Word, InteractionMetrics } from '../types';
import { Volume2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
  const leftOpacity = useTransform(x, [-150, -50], [1, 0]);
  const rightOpacity = useTransform(x, [50, 150], [0, 1]);
  const cardOpacity = useTransform(x, [-350, 0, 350], [0, 1, 0]);

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
    const utterance = new SpeechSynthesisUtterance(word.term);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleFlip = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (!flipped) {
      playSound('flip');
      setFlipped(true);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) triggerSwipe('right');
    else if (info.offset.x < -swipeThreshold) triggerSwipe('left');
    else animate(x, 0, { type: "spring", stiffness: 450, damping: 28 });
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? 800 : -800;
    const durationMs = Date.now() - mountTimeRef.current;
    
    const metrics: InteractionMetrics = {
      durationMs,
      isFlipped: flipped,
      audioPlayedCount: audioCount,
      direction
    };

    animate(x, targetX, { 
      type: "spring", 
      stiffness: 250, 
      damping: 35,
      onComplete: () => onSwipe(direction, metrics)
    });
  };

  const FrontFace = () => (
    <div className="absolute inset-0 w-full h-full bg-white rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-8 backface-hidden border border-slate-100/50 overflow-hidden">
         {/* Background accent */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
         
         <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50/80 text-indigo-400 text-[9px] font-black rounded-full mb-10 tracking-[0.2em] uppercase">
                <Sparkles size={10} />
                Cognitive Node
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 text-center tracking-tighter leading-[1.1] break-words max-w-full">
                {word.term}
            </h2>
            {word.phonetic && <p className="mt-6 text-slate-400 font-medium text-xl md:text-2xl font-mono">{word.phonetic}</p>}
            
            <button 
              onClick={handlePlayAudio} 
              className="mt-12 w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all active:scale-90 border border-slate-100 shadow-sm"
            >
                <Volume2 size={28} />
            </button>
         </div>
         <div className="mt-auto py-6 flex flex-col items-center gap-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Tap to decrypt</p>
         </div>
    </div>
  );

  const BackFace = () => (
    <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col p-8 backface-hidden rotate-y-180 border border-slate-800 overflow-hidden">
        <div className="flex justify-between items-center mb-8 flex-none border-b border-slate-800 pb-4">
            <h3 className="text-2xl font-black text-white tracking-tight truncate">{word.term}</h3>
            <button 
              onClick={handlePlayAudio} 
              className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-indigo-400 active:scale-90 transition-colors"
            >
              <Volume2 size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
            <div className="space-y-3">
               <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Semantic Definition</p>
               <p className="text-3xl text-slate-100 font-bold leading-tight">
                  {word.definition}
               </p>
            </div>
            
            {word.exampleSentence && (
                <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800">
                    <p className="text-slate-300 font-medium text-lg leading-relaxed italic mb-3">
                      "{word.exampleSentence}"
                    </p>
                    <p className="text-slate-500 text-sm font-medium">
                      {word.exampleTranslation}
                    </p>
                </div>
            )}
        </div>
        
        <div className="flex-none mt-6 pt-4 flex justify-between items-center opacity-30">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">YiShan Neural v4.2</span>
            <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-indigo-500 rounded-full" />)}
            </div>
        </div>
    </div>
  );

  if (!isFront) {
      return (
        <div className="absolute top-0 left-0 w-full h-full bg-slate-200 rounded-[2.5rem] opacity-20 transform scale-95 translate-y-8" />
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
        <motion.div style={{ opacity: leftOpacity }} className="absolute inset-0 z-30 bg-emerald-500/90 backdrop-blur-sm rounded-[2.5rem] pointer-events-none flex items-center justify-end pr-12">
             <div className="flex flex-col items-center text-white">
                <ChevronLeft size={64} strokeWidth={3} className="mb-2" />
                <span className="font-black text-xs uppercase tracking-[0.3em]">掌握</span>
             </div>
        </motion.div>
        <motion.div style={{ opacity: rightOpacity }} className="absolute inset-0 z-30 bg-rose-500/90 backdrop-blur-sm rounded-[2.5rem] pointer-events-none flex items-center justify-start pl-12">
             <div className="flex flex-col items-center text-white">
                <ChevronRight size={64} strokeWidth={3} className="mb-2" />
                <span className="font-black text-xs uppercase tracking-[0.3em]">生疏</span>
             </div>
        </motion.div>
        <motion.div className="relative w-full h-full preserve-3d" initial={false} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
            <FrontFace />
            <BackFace />
        </motion.div>
    </motion.div>
  );
};

export default Flashcard;
