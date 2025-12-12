
import React, { useState, useEffect, useRef } from 'react';
import { Word, InteractionMetrics } from '../types';
import { Volume2, Sparkles, Brain, XCircle, Eye, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { playSound } from '../lib/sound';

interface FlashcardProps {
  word: Word;
  onResult: (metrics: InteractionMetrics) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, onResult }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Metrics State
  const startTimeRef = useRef<number>(0);
  const [audioCount, setAudioCount] = useState(0);
  
  // Swipe logic state
  const [swipeState, setSwipeState] = useState({ x: 0, rotation: 0, opacity: 1, text: '', overlayColor: '' });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    setShowAnswer(false);
    setAudioCount(0);
    setSwipeState({ x: 0, rotation: 0, opacity: 1, text: '', overlayColor: '' });
    
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    }
  }, [word]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        switch(e.code) {
            case 'Space':
            case 'Enter':
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                if (!showAnswer) handleReveal();
                break;
            case 'KeyS':
                e.preventDefault();
                handlePlayAudio();
                break;
            case 'ArrowLeft': 
                e.preventDefault();
                completeInteraction('left'); 
                break;
            case 'ArrowRight': 
                e.preventDefault();
                completeInteraction('right'); 
                break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, word, audioCount]); // Dep update needed for metrics closure

  const handleReveal = () => {
      if (showAnswer) return;
      playSound('flip');
      setShowAnswer(true);
  };

  const handlePlayAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAudioCount(prev => prev + 1);
    // UI Sound
    playSound('click');
    
    const synth = window.speechSynthesis;
    if (!synth) return;

    // Mobile robustness: cancel previous only if speaking to avoid initial lag
    if (synth.speaking || isPlaying) {
        synth.cancel();
        setIsPlaying(false);
    }
    
    const utterance = new SpeechSynthesisUtterance(word.term);
    utteranceRef.current = utterance;
    
    // Explicitly set language for Android/iOS robustness
    utterance.lang = 'en-US'; 
    utterance.rate = 0.85; 
    
    // Try to find a good voice, but don't fail if voices aren't loaded yet
    const voices = synth.getVoices();
    const bestVoice = voices.find(v => v.name.includes('Google US English')) 
                   || voices.find(v => v.lang === 'en-US' && v.localService) // Prefer local for speed
                   || voices.find(v => v.lang === 'en-US');
    if (bestVoice) utterance.voice = bestVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
        setIsPlaying(false);
        utteranceRef.current = null;
    };
    utterance.onerror = (e) => {
        console.error("TTS Error", e);
        setIsPlaying(false);
    };
    
    synth.speak(utterance);
  };

  const completeInteraction = (direction: 'left' | 'right') => {
      const endTime = Date.now();
      const durationMs = endTime - startTimeRef.current;

      if (direction === 'right') playSound('success');
      else playSound('forgot');

      const metrics: InteractionMetrics = {
          durationMs,
          flipped: showAnswer,
          audioPlayed: audioCount,
          exampleExpanded: showAnswer, // Assuming reveal implies looking at details
          direction
      };

      onResult(metrics);
  };

  // --- Gesture Logic ---
  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    startPos.current = { x: clientX, y: 0 };
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const deltaX = clientX - startPos.current.x;

    const rotation = deltaX * 0.05;
    let text = '';
    let overlayColor = '';
    
    if (deltaX > 50) {
        text = '记得';
        overlayColor = 'bg-green-500/10';
    } else if (deltaX < -50) {
        text = '忘记';
        overlayColor = 'bg-red-500/10';
    }

    setSwipeState(prev => ({ ...prev, x: deltaX, rotation, text, overlayColor }));
  };

  const onTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(false);
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const deltaX = clientX - startPos.current.x;
    
    // Tap detection (if movement is small)
    if (Math.abs(deltaX) < 5) {
        handleReveal();
        setSwipeState({ x: 0, rotation: 0, opacity: 1, text: '', overlayColor: '' });
        return;
    }

    const threshold = 100; // Swipe threshold

    if (deltaX > threshold) {
        animateOut(500, 'right');
    } else if (deltaX < -threshold) {
        animateOut(-500, 'left');
    } else {
        // Reset if not swiped far enough
        setSwipeState({ x: 0, rotation: 0, opacity: 1, text: '', overlayColor: '' });
    }
  };

  const animateOut = (endX: number, direction: 'left' | 'right') => {
      setSwipeState(prev => ({ ...prev, x: endX, opacity: 0 }));
      setTimeout(() => {
          completeInteraction(direction);
      }, 200); // Wait for animation
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px] select-none perspective-1000">
        
        {/* Swipe Feedback Badge */}
        {swipeState.text && (
            <div className={clsx(
                "absolute top-8 left-1/2 -translate-x-1/2 z-50 px-8 py-3 rounded-full font-bold text-2xl shadow-xl border-2 transition-all pointer-events-none transform",
                swipeState.text === '忘记' ? "bg-red-500 text-white border-red-600 -rotate-6" : "bg-green-500 text-white border-green-600 rotate-6",
            )}>
                {swipeState.text}
            </div>
        )}

        {/* Card Main Container */}
        <div 
            ref={cardRef}
            className="w-full h-full bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden transition-transform duration-100 ease-out relative"
            style={{
                transform: `translate3d(${swipeState.x}px, 0, 0) rotate(${swipeState.rotation}deg)`,
                opacity: swipeState.opacity,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            onMouseDown={onTouchStart} onMouseMove={onTouchMove} onMouseUp={onTouchEnd} onMouseLeave={onTouchEnd}
        >
             {/* Color Overlay for Swipe Feedback */}
             {swipeState.overlayColor && (
                 <div className={clsx("absolute inset-0 z-0 transition-colors", swipeState.overlayColor)} />
             )}
             
             {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white z-0 pointer-events-none" />
            
            {/* --- TOP SECTION (Word) --- */}
            <div className={clsx(
                "relative z-10 flex flex-col items-center justify-center p-8 transition-all duration-500 ease-out",
                showAnswer ? "flex-none pt-12 pb-2" : "flex-1"
            )}>
                 <span className="text-xs uppercase tracking-[0.2em] text-indigo-300 font-bold mb-6">Vocabulary</span>
                 
                 <h2 className={clsx(
                     "font-black text-gray-800 tracking-tight leading-tight transition-all duration-500 text-center",
                     showAnswer ? "text-4xl mb-3" : "text-5xl md:text-6xl mb-8"
                 )}>
                    {word.term}
                 </h2>
                 
                 <div 
                    onClick={handlePlayAudio}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all group shadow-sm active:scale-95"
                >
                    {word.phonetic && <span className="font-mono text-gray-500 text-lg group-hover:text-indigo-600 transition-colors">{word.phonetic}</span>}
                    <Volume2 size={18} className={clsx("text-gray-400 group-hover:text-indigo-600", isPlaying && "animate-pulse")} />
                </div>
            </div>

            {/* --- MIDDLE SECTION (Answer / Reveal Prompt) --- */}
            {showAnswer ? (
                <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-20 custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="text-center mb-6">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-700 leading-relaxed">
                            {word.definition}
                        </h3>
                    </div>

                    {word.exampleSentence && (
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 text-left">
                            <div className="flex gap-3 mb-2">
                                <div className="w-1 h-auto bg-indigo-400 rounded-full flex-none"></div>
                                <p className="text-gray-700 text-lg font-serif italic leading-relaxed">
                                    "{word.exampleSentence}"
                                </p>
                            </div>
                            <p className="text-gray-400 text-sm pl-4">{word.exampleTranslation}</p>
                        </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {word.tags.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-400 text-xs font-medium rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="relative z-10 flex-none pb-20 flex items-center justify-center animate-pulse">
                    <div className="flex flex-col items-center gap-2 text-indigo-300">
                        <Eye size={24} />
                        <span className="text-sm font-medium">点击查看释义 / 左右滑动记词</span>
                    </div>
                </div>
            )}

            {/* --- BOTTOM SECTION (Controls) --- */}
            <div className="absolute bottom-0 left-0 w-full p-6 z-20 bg-gradient-to-t from-white via-white to-transparent">
                <div className="flex justify-between items-center max-w-xs mx-auto">
                    <button 
                        onClick={(e) => { e.stopPropagation(); animateOut(-500, 'left'); }}
                        className="w-14 h-14 rounded-full bg-white border-2 border-red-100 text-red-400 shadow-lg flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all"
                    >
                        <XCircle size={28} />
                    </button>

                    {!showAnswer && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleReveal(); }}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold shadow-indigo-200 shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                            查看详情
                        </button>
                    )}
                    {showAnswer && (
                         <div className="text-xs text-gray-400 font-medium">
                            ← 忘记 &nbsp;&nbsp; | &nbsp;&nbsp; 记得 →
                        </div>
                    )}

                    <button 
                        onClick={(e) => { e.stopPropagation(); animateOut(500, 'right'); }}
                        className="w-14 h-14 rounded-full bg-indigo-600 border-2 border-indigo-600 text-white shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all"
                    >
                        <Brain size={28} />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Flashcard;
