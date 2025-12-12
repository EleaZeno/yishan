
import React, { useState, useEffect, useRef } from 'react';
import { Word, Grade } from '../types';
import { Volume2, Sparkles, Brain, XCircle, CheckCircle2, Eye } from 'lucide-react';
import clsx from 'clsx';
import { playSound } from '../lib/sound';

interface FlashcardProps {
  word: Word;
  onResult: (grade: Grade) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, onResult }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Swipe logic state
  const [swipeState, setSwipeState] = useState({ x: 0, rotation: 0, opacity: 1, text: '' });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        switch(e.code) {
            case 'Space':
            case 'Enter':
                e.preventDefault();
                if (!showAnswer) handleReveal();
                break;
            case 'KeyS':
                e.preventDefault();
                handlePlayAudio();
                break;
            case 'Digit1': if (showAnswer) handleGrade(Grade.Blackout); break;
            case 'Digit2': if (showAnswer) handleGrade(Grade.Hard); break;
            case 'Digit3': if (showAnswer) handleGrade(Grade.Good); break;
            case 'Digit4': if (showAnswer) handleGrade(Grade.Easy); break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, word]);

  useEffect(() => {
    // Reset state on new word
    setShowAnswer(false);
    setSwipeState({ x: 0, rotation: 0, opacity: 1, text: '' });
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    }
  }, [word]);

  const handleReveal = () => {
      playSound('flip');
      setShowAnswer(true);
  };

  const handleGrade = (grade: Grade) => {
      if (grade === Grade.Easy) playSound('victory');
      else if (grade >= Grade.Good) playSound('success');
      else playSound('forgot');
      
      onResult(grade);
  };

  const handlePlayAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playSound('click');
    
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (isPlaying) { 
        synth.cancel(); 
        setIsPlaying(false); 
        return; 
    }
    
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(word.term);
    utteranceRef.current = utterance;
    utterance.lang = 'en-US';
    utterance.rate = 0.85; 
    
    const voices = synth.getVoices();
    const bestVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US');
    if (bestVoice) utterance.voice = bestVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
        setIsPlaying(false);
        utteranceRef.current = null;
    };
    utterance.onerror = () => setIsPlaying(false);
    
    synth.speak(utterance);
  };

  // --- Gesture Logic ---
  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!showAnswer) {
        // Allow tracking for tap detection even if not revealed
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        startPos.current = { x: clientX, y: 0 };
        return;
    }

    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    startPos.current = { x: clientX, y: 0 };
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const deltaX = clientX - startPos.current.x;

    if (!showAnswer) {
        return; // Disable swiping when not revealed
    }
    
    const rotation = deltaX * 0.05;
    let text = '';
    
    if (deltaX > 80) text = '简单';
    else if (deltaX < -80) text = '忘记';

    setSwipeState(prev => ({ ...prev, x: deltaX, rotation, text }));
  };

  const onTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(false);
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const deltaX = clientX - startPos.current.x;
    
    if (!showAnswer) {
        // Tap detection to reveal
        if (Math.abs(deltaX) < 5) {
            handleReveal();
        }
        return;
    }

    // Grading logic
    const { x } = swipeState;
    const threshold = 100;

    if (x > threshold) {
        animateOut(500, Grade.Easy);
        return;
    } else if (x < -threshold) {
        animateOut(-500, Grade.Blackout);
        return;
    }
    
    // Reset if not swiped far enough
    setSwipeState({ x: 0, rotation: 0, opacity: 1, text: '' });
  };

  const animateOut = (endX: number, grade: Grade) => {
      setSwipeState(prev => ({ ...prev, x: endX, opacity: 0 }));
      handleGrade(grade);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px] select-none">
        
        {/* Swipe Feedback Badge */}
        {swipeState.text && (
            <div className={clsx(
                "absolute top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full font-bold text-xl shadow-xl border-2 transition-all pointer-events-none",
                swipeState.text === '忘记' ? "bg-red-500 text-white border-red-600" : "bg-green-500 text-white border-green-600",
            )}>
                {swipeState.text}
            </div>
        )}

        {/* Card Main Container */}
        <div 
            ref={cardRef}
            className="w-full h-full bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden transition-transform duration-100 ease-out"
            style={{
                transform: `translate3d(${swipeState.x}px, 0, 0) rotate(${swipeState.rotation}deg)`,
                opacity: swipeState.opacity,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            onMouseDown={onTouchStart} onMouseMove={onTouchMove} onMouseUp={onTouchEnd} onMouseLeave={onTouchEnd}
        >
             {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white z-0 pointer-events-none" />
            
            {/* --- TOP SECTION (Word) --- */}
            <div className={clsx(
                "relative z-10 flex flex-col items-center justify-center p-8 transition-all duration-500 ease-out",
                showAnswer ? "flex-none pt-12 pb-2" : "flex-1"
            )}>
                 <span className="text-xs uppercase tracking-[0.2em] text-indigo-300 font-bold mb-6">Vocabulary</span>
                 
                 <h2 className={clsx(
                     "font-black text-gray-800 tracking-tight leading-tight transition-all duration-500",
                     showAnswer ? "text-4xl mb-3" : "text-5xl md:text-6xl mb-8"
                 )}>
                    {word.term}
                 </h2>
                 
                 {word.phonetic && (
                    <div 
                        onClick={handlePlayAudio}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all group shadow-sm active:scale-95"
                    >
                        <span className="font-mono text-gray-500 text-lg group-hover:text-indigo-600 transition-colors">{word.phonetic}</span>
                        <Volume2 size={18} className={clsx("text-gray-400 group-hover:text-indigo-600", isPlaying && "animate-pulse")} />
                    </div>
                )}
            </div>

            {/* --- MIDDLE SECTION (Answer / Reveal Prompt) --- */}
            {showAnswer ? (
                <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">
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
                        <span className="text-sm font-medium">点击查看释义</span>
                    </div>
                </div>
            )}

            {/* --- BOTTOM SECTION (Grading) --- */}
            {showAnswer && (
                <div 
                    className="relative z-20 flex-none bg-white border-t border-gray-100 p-3 grid grid-cols-4 gap-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]" 
                    onMouseDown={e => e.stopPropagation()}
                    onTouchStart={e => e.stopPropagation()}
                >
                    <GradeButton 
                        grade={Grade.Blackout} 
                        label="忘记" 
                        subLabel="1"
                        icon={<XCircle size={20} />}
                        color="text-rose-500 bg-rose-50 hover:bg-rose-100 border-rose-100"
                        onClick={() => handleGrade(Grade.Blackout)}
                    />
                    <GradeButton 
                        grade={Grade.Hard} 
                        label="困难" 
                        subLabel="2"
                        icon={<Brain size={20} />}
                        color="text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100"
                        onClick={() => handleGrade(Grade.Hard)}
                    />
                    <GradeButton 
                        grade={Grade.Good} 
                        label="记得" 
                        subLabel="3"
                        icon={<CheckCircle2 size={20} />}
                        color="text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100"
                        onClick={() => handleGrade(Grade.Good)}
                    />
                    <GradeButton 
                        grade={Grade.Easy} 
                        label="简单" 
                        subLabel="4"
                        icon={<Sparkles size={20} />}
                        color="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100"
                        onClick={() => handleGrade(Grade.Easy)}
                    />
                </div>
            )}
        </div>
    </div>
  );
};

// Sub-component for buttons
const GradeButton = ({ grade, label, subLabel, icon, color, onClick }: any) => (
    <button 
        onClick={onClick} 
        className={clsx(
            "flex flex-col items-center justify-center py-3 rounded-xl border transition-all active:scale-95 duration-200",
            color
        )}
    >
        <div className="mb-1">{icon}</div>
        <span className="text-xs font-bold">{label}</span>
        <span className="text-[10px] opacity-60 font-mono mt-0.5">{subLabel}d</span>
    </button>
);

export default Flashcard;
