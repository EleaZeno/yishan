import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Word, InteractionMetrics } from '../types';
import { Volume2, Sparkles } from 'lucide-react';
import { playSound } from '../lib/sound';
import { motion, useMotionValue, useTransform, animate, PanInfo, useSpring } from "framer-motion";

interface FlashcardProps {
  word: Word;
  onSwipe: (direction: 'left' | 'right', metrics: InteractionMetrics) => void;
  isFront?: boolean;
}

const Flashcard: React.FC<FlashcardProps> = React.memo(({ word, onSwipe, isFront = true }) => {
  const [flipped, setFlipped] = useState(false);
  const [audioCount, setAudioCount] = useState(0);
  const mountTimeRef = useRef<number>(Date.now());

  const xBase = useMotionValue(0);
  const x = useSpring(xBase, { stiffness: 600, damping: 60, mass: 0.6 });
  
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  const leftOpacity = useTransform(x, [-150, -50], [1, 0]);
  const rightOpacity = useTransform(x, [50, 150], [0, 1]);
  const cardOpacity = useTransform(x, [-450, -380, 0, 380, 450], [0, 1, 1, 1, 0]);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    setFlipped(false);
    setAudioCount(0);
    xBase.set(0);
  }, [word, xBase]);

  const handlePlayAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAudioCount(prev => prev + 1);
    playSound('click');
    const utterance = new SpeechSynthesisUtterance(word.term);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleFlip = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (Math.abs(xBase.get()) < 5) {
      playSound('flip');
      setFlipped(!flipped);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 100;
    const velocityThreshold = 400;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      triggerSwipe('right');
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      triggerSwipe('left');
    } else {
      animate(xBase, 0, { type: "spring", stiffness: 1000, damping: 50 });
    }
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
    const targetX = direction === 'right' ? 700 : -700;
    const durationMs = Date.now() - mountTimeRef.current;
    
    const metrics: InteractionMetrics = {
      durationMs,
      isFlipped: flipped,
      audioPlayedCount: audioCount,
      direction
    };

    animate(xBase, targetX, { 
      type: "spring", stiffness: 400, damping: 40,
      onComplete: () => onSwipe(direction, metrics)
    });
  };

  const frontFace = (
    <div className="absolute inset-0 w-full h-full bg-card rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center p-8 backface-hidden border border-border will-change-transform">
         <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
         
         <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full mb-12 tracking-[0.25em] uppercase">
                <Sparkles size={12} className="fill-primary" />
                Cognitive Node
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-card-foreground text-center tracking-tighter leading-tight break-words max-w-full">
                {word.term}
            </h2>
            {word.phonetic && <p className="mt-6 text-muted-foreground font-semibold text-xl font-mono">{word.phonetic}</p>}
            
            <button 
              onClick={handlePlayAudio} 
              className="mt-14 w-16 h-16 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all active:scale-90 border border-border shadow-sm"
            >
                <Volume2 size={28} />
            </button>
         </div>
         <div className="mt-auto py-6">
             <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.4em] animate-pulse">Tap to Inspect</p>
         </div>
    </div>
  );

  const backFace = (
    <div className="absolute inset-0 w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] shadow-2xl flex flex-col p-10 backface-hidden rotate-y-180 border border-slate-800 overflow-hidden will-change-transform">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
            <h3 className="text-2xl font-black text-white tracking-tight truncate">{word.term}</h3>
            <button onClick={handlePlayAudio} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-primary active:scale-90 transition-colors">
              <Volume2 size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-10">
            <div className="space-y-4">
               <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">Definition</p>
               <p className="text-3xl text-slate-100 font-bold leading-tight">
                  {word.definition}
               </p>
            </div>
            
            {word.exampleSentence && (
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
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
    </div>
  );

  if (!isFront) {
      return (
        <div className="absolute top-0 left-0 w-full h-full bg-card rounded-[2.5rem] shadow-sm border border-border transform scale-[0.96] translate-y-4 -z-10 opacity-30 will-change-transform" />
      );
  }

  return (
    <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing perspective-1200 touch-none select-none"
        style={{ x, rotate, scale, opacity: cardOpacity, zIndex: 10 }}
        drag="x"
        dragElastic={0.08}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onClick={handleFlip}
    >
        <motion.div 
          style={{ opacity: leftOpacity }} 
          className="absolute inset-0 z-30 bg-emerald-500 rounded-[2.5rem] pointer-events-none flex items-center justify-end pr-14"
        >
             <span className="font-black text-3xl text-white uppercase tracking-[0.4em]">Know</span>
        </motion.div>
        
        <motion.div 
          style={{ opacity: rightOpacity }} 
          className="absolute inset-0 z-30 bg-rose-500 rounded-[2.5rem] pointer-events-none flex items-center justify-start pl-14"
        >
             <span className="font-black text-3xl text-white uppercase tracking-[0.4em]">Review</span>
        </motion.div>

        <motion.div 
          className="relative w-full h-full preserve-3d" 
          animate={{ rotateY: flipped ? 180 : 0 }} 
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
        >
            {frontFace}
            {backFace}
        </motion.div>
    </motion.div>
  );
});

export default Flashcard;