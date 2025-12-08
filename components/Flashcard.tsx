import React, { useState, useEffect, useRef } from 'react';
import { Word, Grade, IWindow } from '../types';
import { Eye, Volume2, Mic, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { fetchWordAudio } from '../services/geminiService';

interface FlashcardProps {
  word: Word;
  onResult: (grade: Grade) => void;
}

type SpeechStatus = 'idle' | 'listening' | 'processing' | 'success' | 'fail' | 'unsupported';

const Flashcard: React.FC<FlashcardProps> = ({ word, onResult }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Speech Recognition State
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Reset state when word changes
  useEffect(() => {
    setIsFlipped(false);
    setSpeechStatus('idle');
    setTranscript('');
    stopRecognition();
  }, [word]);

  // Check browser support
  useEffect(() => {
    const win = window as unknown as IWindow;
    if (!win.SpeechRecognition && !win.webkitSpeechRecognition) {
        setSpeechStatus('unsupported');
    }
  }, []);

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
        const audioBuffer = await fetchWordAudio(word.term);
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = ctx.createBufferSource();
        const decoded = await ctx.decodeAudioData(audioBuffer);
        source.buffer = decoded;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start(0);
    } catch (err) {
        console.error("Audio playback failed", err);
        setIsPlaying(false);
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
        try {
            recognitionRef.current.stop();
        } catch (e) {
            // ignore
        }
        recognitionRef.current = null;
    }
  };

  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (speechStatus === 'listening') {
        stopRecognition();
        setSpeechStatus('idle');
        return;
    }

    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US'; // Default to English
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        setSpeechStatus('listening');
        setTranscript('');
    };

    recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        setTranscript(text);
        
        // Normalize comparison (remove punctuation, lowercase)
        const cleanInput = text.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanTarget = word.term.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (cleanInput === cleanTarget || cleanInput.includes(cleanTarget)) {
            setSpeechStatus('success');
            // Play success sound logic could go here
        } else {
            setSpeechStatus('fail');
        }
    };

    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
            alert("请允许浏览器访问麦克风以使用跟读功能");
        }
        setSpeechStatus('idle');
    };

    recognition.onend = () => {
        // If it ended without success/fail (e.g. silence), reset to idle unless we already have a result
        setSpeechStatus(prev => (prev === 'listening' ? 'idle' : prev));
        recognitionRef.current = null;
    };

    recognition.start();
  };

  const renderSpeechFeedback = () => {
      if (speechStatus === 'idle' || speechStatus === 'unsupported') return null;

      return (
        <div className={clsx(
            "mt-6 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all animate-in fade-in slide-in-from-bottom-2",
            speechStatus === 'listening' && "bg-indigo-50 text-indigo-600 border border-indigo-100",
            speechStatus === 'success' && "bg-green-50 text-green-700 border border-green-200",
            speechStatus === 'fail' && "bg-red-50 text-red-700 border border-red-200"
        )}>
            {speechStatus === 'listening' && (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>请大声朗读...</span>
                </>
            )}
            {speechStatus === 'success' && (
                <>
                    <CheckCircle2 size={18} />
                    <span>发音正确！ ({transcript})</span>
                </>
            )}
            {speechStatus === 'fail' && (
                <>
                    <XCircle size={18} />
                    <span>识别为: "{transcript}"，请重试</span>
                </>
            )}
        </div>
      );
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
        <div 
            className="flex-1 relative perspective-1000 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={clsx(
                "w-full h-full transition-all duration-500 transform preserve-3d relative bg-white rounded-3xl shadow-lg border border-gray-200 flex flex-col justify-center items-center text-center p-8",
                isFlipped ? "rotate-y-180" : ""
            )}>
                {/* Front Side */}
                <div className="absolute backface-hidden inset-0 flex flex-col justify-center items-center z-10">
                    <span className="text-sm uppercase tracking-wider text-gray-400 font-semibold mb-4">Word</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 break-all">{word.term}</h2>
                    
                    {word.phonetic && (
                        <div className="mt-4 flex items-center gap-3">
                             <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                                <span className="text-indigo-600 font-mono text-lg">{word.phonetic}</span>
                                <button 
                                    onClick={handlePlayAudio}
                                    className="p-1.5 rounded-full hover:bg-indigo-100 text-indigo-600 transition-colors"
                                    title="播放发音"
                                >
                                    <Volume2 size={18} className={clsx(isPlaying && "animate-pulse")} />
                                </button>
                            </div>

                            {/* Mic Button */}
                            {speechStatus !== 'unsupported' && (
                                <button
                                    onClick={handleMicClick}
                                    className={clsx(
                                        "p-2.5 rounded-full transition-all shadow-sm border",
                                        speechStatus === 'listening' 
                                            ? "bg-red-100 text-red-600 border-red-200 animate-pulse ring-2 ring-red-200" 
                                            : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                                    )}
                                    title="跟读评测"
                                >
                                    <Mic size={20} />
                                </button>
                            )}
                        </div>
                    )}
                    
                    {renderSpeechFeedback()}

                    <p className="mt-8 text-gray-400 text-sm flex items-center gap-2 absolute bottom-8">
                        <Eye size={16} /> 点击翻转查看释义
                    </p>
                </div>

                {/* Back Side */}
                <div className="absolute backface-hidden inset-0 flex flex-col justify-center items-center z-0 rotate-y-180 bg-slate-50 rounded-3xl">
                     <div className="w-full h-full p-8 flex flex-col justify-center overflow-y-auto">
                        <div className="mb-6">
                            <span className="text-xs uppercase text-gray-400 font-bold tracking-widest">Definition</span>
                            <p className="text-xl md:text-2xl font-medium text-gray-800 mt-1">{word.definition}</p>
                        </div>

                        {word.exampleSentence && (
                            <div className="text-left bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-gray-700 italic text-lg font-serif">"{word.exampleSentence}"</p>
                                <p className="text-gray-500 mt-2 text-sm">{word.exampleTranslation}</p>
                            </div>
                        )}
                        
                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                            {word.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-md">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="mt-6 h-24">
            {!isFlipped ? (
                <div className="flex justify-center items-center h-full">
                    <button 
                        onClick={() => setIsFlipped(true)}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        显示答案
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-3 h-full">
                    <button onClick={() => onResult(Grade.Blackout)} className="flex flex-col items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors">
                        <span className="text-lg font-bold text-gray-700">忘记</span>
                        <span className="text-xs text-gray-500">重来</span>
                    </button>
                    <button onClick={() => onResult(Grade.Hard)} className="flex flex-col items-center justify-center bg-rose-100 hover:bg-rose-200 rounded-xl transition-colors">
                        <span className="text-lg font-bold text-rose-700">困难</span>
                        <span className="text-xs text-rose-500">很快</span>
                    </button>
                    <button onClick={() => onResult(Grade.Good)} className="flex flex-col items-center justify-center bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-colors">
                        <span className="text-lg font-bold text-indigo-700">记得</span>
                        <span className="text-xs text-indigo-500">明天</span>
                    </button>
                    <button onClick={() => onResult(Grade.Easy)} className="flex flex-col items-center justify-center bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors">
                        <span className="text-lg font-bold text-emerald-700">简单</span>
                        <span className="text-xs text-emerald-500">4天后</span>
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default Flashcard;