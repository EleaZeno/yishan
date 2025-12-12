import React, { useState, useEffect, useRef } from 'react';
import { Word, Grade, IWindow } from '../types';
import { Volume2, RotateCw, ThumbsUp, Zap } from 'lucide-react';
import clsx from 'clsx';

interface FlashcardProps {
  word: Word;
  onResult: (grade: Grade) => void;
}

// 简单的 Levenshtein 距离算法
const calculateSimilarity = (target: string, input: string): number => {
  if (!target || !input) return 0;
  const s1 = target.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = input.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s1 === s2) return 100;
  if (s2.includes(s1)) return 100;
  const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) { track[0][i] = i; }
  for (let j = 0; j <= s2.length; j += 1) { track[j][0] = j; }
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(track[j][i - 1] + 1, track[j - 1][i] + 1, track[j - 1][i - 1] + indicator);
    }
  }
  return Math.max(0, Math.round((1 - track[s2.length][s1.length] / Math.max(s1.length, s2.length)) * 100));
};

const Flashcard: React.FC<FlashcardProps> = ({ word, onResult }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [swipeState, setSwipeState] = useState({ x: 0, y: 0, rotation: 0, opacity: 1, text: '' });
  const [isDragging, setIsDragging] = useState(false);
  
  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  
  // TTS State
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // TTS Warm-up
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        // Just accessing getVoices() warms up the engine in Chrome
        window.speechSynthesis.getVoices();
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Only trigger if no input is focused
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                flipCard();
                break;
            case 'KeyS':
                e.preventDefault();
                handlePlayAudio();
                break;
            case 'Digit1': // 忘记
                if (isFlipped) onResult(Grade.Blackout);
                break;
            case 'Digit2': // 困难
                if (isFlipped) onResult(Grade.Hard);
                break;
            case 'Digit3': // 记得
                if (isFlipped) onResult(Grade.Good);
                break;
            case 'Digit4': // 简单
                if (isFlipped) onResult(Grade.Easy);
                break;
            case 'ArrowLeft': // Force "Forgot" via arrow if flipped
                if (isFlipped) onResult(Grade.Blackout);
                break;
             case 'ArrowRight': // Force "Easy" via arrow if flipped
                if (isFlipped) onResult(Grade.Easy);
                break;
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, word]); // Dependencies needed to capture latest state

  // Reset state when word changes
  useEffect(() => {
    setIsFlipped(false);
    setSwipeState({ x: 0, y: 0, rotation: 0, opacity: 1, text: '' });
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    
    // Cancel any playing audio when word changes
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    }
  }, [word]);

  const flipCard = () => setIsFlipped(prev => !prev);

  const handlePlayAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const synth = window.speechSynthesis;
    if (!synth) {
        alert("Your browser does not support Text-to-Speech.");
        return;
    }

    if (isPlaying) { 
        synth.cancel(); 
        setIsPlaying(false); 
        return; 
    }
    
    // Cancel any previous utterances
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word.term);
    // Keep reference to prevent garbage collection
    utteranceRef.current = utterance;

    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    
    // Attempt to select a better voice
    const voices = synth.getVoices();
    const bestVoice = voices.find(v => v.name.includes('Google US English')) 
                   || voices.find(v => v.lang === 'en-US' || v.lang === 'en_US');
    if (bestVoice) utterance.voice = bestVoice;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
        setIsPlaying(false);
        utteranceRef.current = null;
    };
    utterance.onerror = (event) => {
        // Log actual error for debugging
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
            console.error('Speech synthesis error:', event.error);
        }
        setIsPlaying(false);
        utteranceRef.current = null;
    };
    
    synth.speak(utterance);
  };

  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("浏览器不支持"); return; }

    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        const score = calculateSimilarity(word.term, text);
        alert(`识别: ${text}\n得分: ${score}`);
    };
    recognition.start();
  };

  // --- Gesture Logic ---

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    startPos.current = { x: clientX, y: clientY };
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    
    // Rotation physics: 100px move = 10deg rotation
    const rotation = deltaX * 0.1;
    
    // Feedback text
    let text = '';
    if (isFlipped) {
        if (deltaX > 100) text = '简单';
        else if (deltaX < -100) text = '忘记';
        else if (deltaY < -100) text = '记得'; // Up swipe
    }

    setSwipeState({ x: deltaX, y: deltaY, rotation, opacity: 1, text });
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    const { x, y } = swipeState;
    const threshold = 100;

    // Handle Swipe Actions (Only if flipped)
    if (isFlipped) {
        if (x > threshold) {
            // Swipe Right -> Easy
            animateOut(500, 0, Grade.Easy);
            return;
        } else if (x < -threshold) {
            // Swipe Left -> Forgot
            animateOut(-500, 0, Grade.Blackout);
            return;
        } else if (y < -threshold) {
             // Swipe Up -> Good
             animateOut(0, -500, Grade.Good);
             return;
        }
    } else {
        // If not flipped, simple tap detection to flip
        if (Math.abs(x) < 5 && Math.abs(y) < 5) {
            flipCard();
        }
    }

    // Reset if threshold not met
    setSwipeState({ x: 0, y: 0, rotation: 0, opacity: 1, text: '' });
  };

  const animateOut = (endX: number, endY: number, grade: Grade) => {
      setSwipeState(prev => ({ ...prev, x: endX, y: endY, opacity: 0 }));
      setTimeout(() => {
          onResult(grade);
      }, 200);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto h-[480px] md:h-[520px] select-none">
        
        {/* Swipe Feedback Overlay */}
        {swipeState.text && (
            <div className={clsx(
                "absolute top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-2 rounded-full font-bold text-xl shadow-lg border-2 animate-in zoom-in-95",
                swipeState.text === '忘记' && "bg-red-50 text-red-600 border-red-200",
                swipeState.text === '简单' && "bg-green-50 text-green-600 border-green-200",
                swipeState.text === '记得' && "bg-blue-50 text-blue-600 border-blue-200",
            )}>
                {swipeState.text}
            </div>
        )}

        {/* Card Container */}
        <div 
            ref={cardRef}
            className="w-full h-full relative perspective-1000 touch-none"
            style={{
                transform: `translate3d(${swipeState.x}px, ${swipeState.y}px, 0) rotate(${swipeState.rotation}deg)`,
                opacity: swipeState.opacity,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s',
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onTouchStart}
            onMouseMove={onTouchMove}
            onMouseUp={onTouchEnd}
            onMouseLeave={onTouchEnd}
        >
             <div className={clsx(
                "w-full h-full transition-transform duration-500 transform preserve-3d relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100",
                isFlipped ? "rotate-y-180" : ""
            )}>
                
                {/* Front */}
                <div className="absolute backface-hidden inset-0 flex flex-col justify-center items-center z-10 p-6">
                    <div className="flex-1 flex flex-col justify-center items-center w-full">
                        <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-6">Word</span>
                        <h2 className="text-5xl font-bold text-gray-800 break-all text-center mb-6">{word.term}</h2>
                        
                        {word.phonetic && (
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500 font-mono text-lg">{word.phonetic}</span>
                                <button 
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={handlePlayAudio}
                                    className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                >
                                    <Volume2 size={24} className={clsx(isPlaying && "animate-pulse")} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="h-16 flex items-end justify-center pb-4 text-gray-300 text-sm gap-2">
                        <RotateCw size={16} /> 点击或按空格翻转
                    </div>
                </div>

                {/* Back */}
                <div className="absolute backface-hidden inset-0 flex flex-col z-0 rotate-y-180 bg-slate-50 rounded-3xl overflow-hidden">
                    <div className="flex-1 p-8 flex flex-col justify-center overflow-y-auto">
                        <div className="mb-6">
                            <span className="text-xs uppercase text-gray-400 font-bold tracking-widest">Definition</span>
                            <p className="text-2xl font-bold text-gray-800 mt-2 leading-relaxed">{word.definition}</p>
                        </div>

                        {word.exampleSentence && (
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-4">
                                <p className="text-gray-700 text-lg font-serif italic mb-2">"{word.exampleSentence}"</p>
                                <p className="text-gray-400 text-sm">{word.exampleTranslation}</p>
                            </div>
                        )}
                         <div className="flex flex-wrap gap-2">
                            {word.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded-md">#{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Action Bar (For users who prefer tapping) */}
                    <div className="h-20 bg-white border-t border-gray-100 grid grid-cols-4 divide-x divide-gray-100" onMouseDown={e => e.stopPropagation()}>
                         <button onClick={() => onResult(Grade.Blackout)} className="flex flex-col items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <RotateCw size={20} />
                            <span className="text-xs font-bold mt-1">忘 (1)</span>
                        </button>
                        <button onClick={() => onResult(Grade.Hard)} className="flex flex-col items-center justify-center hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors">
                            <Zap size={20} />
                            <span className="text-xs font-bold mt-1">难 (2)</span>
                        </button>
                        <button onClick={() => onResult(Grade.Good)} className="flex flex-col items-center justify-center hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                            <ThumbsUp size={20} />
                            <span className="text-xs font-bold mt-1">记 (3)</span>
                        </button>
                        <button onClick={() => onResult(Grade.Easy)} className="flex flex-col items-center justify-center hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors">
                            <ThumbsUp size={20} className="text-green-500" />
                            <span className="text-xs font-bold mt-1">简 (4)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Gesture Hints (Only visible when flipped) */}
        {isFlipped && (
            <>
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-12 hidden md:flex flex-col items-center text-gray-300">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center mb-2"><RotateCw size={16}/></div>
                    <span className="text-xs font-bold">左滑忘记</span>
                </div>
                 <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-12 hidden md:flex flex-col items-center text-gray-300">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center mb-2"><ThumbsUp size={16}/></div>
                    <span className="text-xs font-bold">右滑简单</span>
                </div>
            </>
        )}
    </div>
  );
};

export default Flashcard;