
import React, { useState, useEffect, useRef } from 'react';
import { Word, InteractionMetrics } from '../types';
import { Volume2, Eye, Check, X, RotateCw } from 'lucide-react';
import clsx from 'clsx';
import { playSound } from '../lib/sound';
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";

interface FlashcardProps {
  word: Word;
  onResult: (metrics: InteractionMetrics) => void;
  isFront?: boolean;
}

const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

const Flashcard: React.FC<FlashcardProps> = ({ word, onResult, isFront = true }) => {
  const [flipped, setFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const [audioCount, setAudioCount] = useState(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const rightOpacity = useTransform(x, [50, 150], [0, 1]);
  const leftOpacity = useTransform(x, [-150, -50], [1, 0]);
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setFlipped(false);
    setAudioCount(0);
    x.set(0);
  }, [word, x]);

  const handlePlayAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAudioCount(prev => prev + 1);
    playSound('click');
    if (!window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(word.term);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    synth.speak(utterance);
  };

  const handleFlip = () => {
      setFlipped(prev => !prev);
      playSound('flip');
      triggerHaptic(5);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
        triggerSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
        triggerSwipe('left');
    } else {
        animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
    }
  };

  const triggerSwipe = (direction: 'left' | 'right') => {
      const targetX = direction === 'right' ? 400 : -400;
      if (direction === 'right') {
          playSound('success');
          triggerHaptic([10, 30, 10]);
      } else {
          playSound('forgot');
          triggerHaptic(20);
      }
      animate(x, targetX, { duration: 0.2, ease: "easeOut", onComplete: () => {
          const durationMs = Date.now() - startTimeRef.current;
          onResult({ durationMs, flipped, audioPlayed: audioCount, exampleExpanded: flipped, direction });
      }});
  };

  const FrontFace = () => (
    <div className="absolute inset-0 w-full h-full bg-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-8 backface-hidden z-20">
         <div className="absolute top-6 right-6 text-gray-300"><RotateCw size={20} /></div>
         <div className="flex-1 flex flex-col items-center justify-center w-full">
            <span className="text-xs font-bold tracking-widest text-indigo-400 mb-6 uppercase">记忆词汇</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-800 text-center tracking-tight break-words max-w-full">{word.term}</h2>
            <div className="mt-8">
                <button onClick={handlePlayAudio} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 active:scale-95 transition-all">
                    <Volume2 size={20} className={isPlaying ? "animate-pulse" : ""} />
                    {word.phonetic && <span className="font-mono text-sm font-medium">{word.phonetic}</span>}
                </button>
            </div>
         </div>
         <div className="mt-auto pt-6 text-gray-400 text-sm font-medium animate-pulse flex items-center gap-2"><Eye size={16} /> 点击翻转查看详情</div>
    </div>
  );

  const BackFace = () => (
    <div className="absolute inset-0 w-full h-full bg-slate-50 rounded-[2rem] shadow-xl flex flex-col p-8 backface-hidden rotate-y-180 z-20 overflow-hidden">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-800">{word.term}</h3>
            <button onClick={handlePlayAudio} className="p-2 bg-white rounded-full shadow-sm text-indigo-600"><Volume2 size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar -mr-4 pr-4">
            <div className="mb-6">
                <div className="text-xs font-bold text-gray-400 uppercase mb-2">释义</div>
                <p className="text-xl text-gray-700 font-medium leading-relaxed">{word.definition}</p>
            </div>

            {word.exampleSentence && (
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-4">
                    <div className="flex gap-3">
                        <div className="w-1 bg-indigo-400 rounded-full shrink-0" />
                        <div>
                            <p className="text-gray-800 font-serif italic text-lg leading-relaxed mb-2">"{word.exampleSentence}"</p>
                            <p className="text-gray-500 text-sm">{word.exampleTranslation}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-400">
             <span className="flex items-center gap-1 text-red-400"><X size={16}/> 忘记 (左滑)</span>
             <span className="flex items-center gap-1 text-green-500">记得 (右滑) <Check size={16}/></span>
        </div>
    </div>
  );

  if (!isFront) {
      return (
        <div className="absolute top-0 left-0 w-full h-full bg-white rounded-[2rem] shadow-md border border-gray-100 flex items-center justify-center p-8 transform scale-95 opacity-50 translate-y-4">
             <h2 className="text-4xl font-bold text-gray-300">{word.term}</h2>
        </div>
      );
  }

  return (
    <motion.div
        className="absolute top-0 left-0 w-full h-full cursor-grab active:cursor-grabbing perspective-1000 touch-none"
        style={{ x, rotate, scale, zIndex: 10 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        onClick={handleFlip}
    >
        <motion.div style={{ opacity: rightOpacity }} className="absolute inset-0 z-30 bg-green-500/10 rounded-[2rem] pointer-events-none border-4 border-green-500/50" />
        <motion.div style={{ opacity: leftOpacity }} className="absolute inset-0 z-30 bg-red-500/10 rounded-[2rem] pointer-events-none border-4 border-red-500/50" />
        <motion.div className="relative w-full h-full preserve-3d" initial={false} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
            <FrontFace />
            <BackFace />
        </motion.div>
    </motion.div>
  );
};

export default Flashcard;
