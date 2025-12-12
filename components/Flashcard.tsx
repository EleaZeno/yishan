import React, { useState, useEffect, useRef } from 'react';
import { Word, InteractionMetrics } from '../types';
import { Volume2, RefreshCw, Eye, Check, X, RotateCw } from 'lucide-react';
import clsx from 'clsx';
import { playSound } from '../lib/sound';
import { motion, useMotionValue, useTransform, animate, PanInfo, AnimatePresence } from "framer-motion";

interface FlashcardProps {
  word: Word;
  onResult: (metrics: InteractionMetrics) => void;
  isFront?: boolean; // Used for the background stack card
}

const Flashcard: React.FC<FlashcardProps> = ({ word, onResult, isFront = true }) => {
  const [flipped, setFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Metrics
  const startTimeRef = useRef<number>(Date.now());
  const [audioCount, setAudioCount] = useState(0);

  // Framer Motion Values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  // Opacity overlays for visual feedback
  const rightOpacity = useTransform(x, [50, 150], [0, 1]);
  const leftOpacity = useTransform(x, [-150, -50], [1, 0]);
  
  // Card scale/opacity while dragging (optional subtle effect)
  const scale = useTransform(x, [-200, 0, 200], [1, 1, 1]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setFlipped(false);
    setAudioCount(0);
    x.set(0);
  }, [word, x]);

  // TTS Logic
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
    utterance.onerror = () => setIsPlaying(false);
    
    synth.speak(utterance);
  };

  // Keyboard support re-implemented for new logic
  useEffect(() => {
    if (!isFront) return;
    const handleKeyDown = (e: KeyboardEvent) => {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            setFlipped(prev => !prev);
            playSound('flip');
        } else if (e.code === 'ArrowLeft') {
            flyOut(-300);
        } else if (e.code === 'ArrowRight') {
            flyOut(300);
        } else if (e.code === 'KeyS') {
            handlePlayAudio();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFront, word]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    const velocityThreshold = 500;
    
    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
        flyOut(400); // Swipe Right (Remember)
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
        flyOut(-400); // Swipe Left (Forget)
    } else {
        // Spring back
        animate(x, 0, { type: "spring", stiffness: 400, damping: 25 });
    }
  };

  const flyOut = (targetX: number) => {
    animate(x, targetX, { 
        duration: 0.2, 
        ease: "easeOut",
        onComplete: () => completeInteraction(targetX > 0 ? 'right' : 'left')
    });
  };

  const completeInteraction = (direction: 'left' | 'right') => {
      const durationMs = Date.now() - startTimeRef.current;
      
      if (direction === 'right') playSound('success');
      else playSound('forgot');

      onResult({
          durationMs,
          flipped,
          audioPlayed: audioCount,
          exampleExpanded: flipped,
          direction
      });
  };

  // --- Content Components ---
  const FrontFace = () => (
    <div className="absolute inset-0 w-full h-full bg-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center p-8 backface-hidden z-20">
         <div className="absolute top-6 right-6 text-gray-300">
             <RotateCw size={20} />
         </div>
         
         <div className="flex-1 flex flex-col items-center justify-center w-full">
            <span className="text-xs font-bold tracking-widest text-indigo-400 mb-6 uppercase">Vocabulary</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-800 text-center tracking-tight leading-tight break-words max-w-full">
                {word.term}
            </h2>
            
            <div className="mt-8 flex items-center justify-center">
                <button 
                    onClick={handlePlayAudio}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors active:scale-95"
                >
                    <Volume2 size={20} className={isPlaying ? "animate-pulse" : ""} />
                    {word.phonetic && <span className="font-mono text-sm font-medium">{word.phonetic}</span>}
                </button>
            </div>
         </div>
         
         <div className="mt-auto pt-6 text-gray-400 text-sm font-medium animate-pulse flex items-center gap-2">
            <Eye size={16} /> 点击翻转查看详情
         </div>
    </div>
  );

  const BackFace = () => (
    <div className="absolute inset-0 w-full h-full bg-slate-50 rounded-[2rem] shadow-xl flex flex-col p-8 backface-hidden rotate-y-180 z-20 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-gray-800">{word.term}</h3>
            <button onClick={handlePlayAudio} className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
                <Volume2 size={18} />
            </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
            <div className="mb-6">
                <div className="text-xs font-bold text-gray-400 uppercase mb-1">Definition</div>
                <p className="text-xl text-gray-700 font-medium leading-relaxed">{word.definition}</p>
            </div>

            {word.exampleSentence && (
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-4">
                    <div className="flex gap-3">
                        <div className="w-1 bg-indigo-400 rounded-full shrink-0" />
                        <div>
                            <p className="text-gray-800 font-serif italic text-lg leading-relaxed mb-2">
                                "{word.exampleSentence}"
                            </p>
                            <p className="text-gray-500 text-sm">{word.exampleTranslation}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
                {word.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-400 text-xs font-medium rounded-md">
                        {tag}
                    </span>
                ))}
            </div>
        </div>

        {/* Footer Hint */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-400">
             <span className="flex items-center gap-1 text-red-400"><X size={16}/> 忘记 (左滑)</span>
             <span className="flex items-center gap-1 text-green-500">记得 (右滑) <Check size={16}/></span>
        </div>
    </div>
  );

  if (!isFront) {
      // Simple static card for background
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
        dragElastic={0.1} // Resistance feel
        onDragEnd={handleDragEnd}
        onClick={() => { 
            setFlipped(!flipped); 
            playSound('flip');
        }}
    >
        {/* Color Overlays for Feedback */}
        <motion.div style={{ opacity: rightOpacity }} className="absolute inset-0 z-30 bg-green-500/20 rounded-[2rem] pointer-events-none border-4 border-green-500" />
        <motion.div style={{ opacity: leftOpacity }} className="absolute inset-0 z-30 bg-red-500/20 rounded-[2rem] pointer-events-none border-4 border-red-500" />
        
        {/* Swipe Text Indicators */}
        <motion.div style={{ opacity: rightOpacity }} className="absolute top-10 left-10 z-40 transform -rotate-12 border-4 border-green-500 text-green-600 bg-white/90 px-4 py-1 rounded-lg font-black text-3xl shadow-sm tracking-widest pointer-events-none">
            记得
        </motion.div>
        <motion.div style={{ opacity: leftOpacity }} className="absolute top-10 right-10 z-40 transform rotate-12 border-4 border-red-500 text-red-600 bg-white/90 px-4 py-1 rounded-lg font-black text-3xl shadow-sm tracking-widest pointer-events-none">
            忘记
        </motion.div>

        {/* 3D Flipping Container */}
        <motion.div 
            className="relative w-full h-full preserve-3d transition-transform duration-500"
            animate={{ rotateY: flipped ? 180 : 0 }}
        >
            <FrontFace />
            <BackFace />
        </motion.div>
    </motion.div>
  );
};

export default Flashcard;