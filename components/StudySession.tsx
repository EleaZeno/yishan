import React, { useState, useEffect } from 'react';
import { Word, InteractionMetrics } from '../types';
import Flashcard from './Flashcard';
import { CheckCircle, Search, Plus, BookDown, Loader2 } from 'lucide-react';
import { db } from '../services/storage';
import { calculateStrength, scheduleNextReview } from '../lib/algorithm';

interface StudySessionProps {
  dueWords: Word[];
  onComplete: () => void;
  onAddWord: () => void;
  onImportCore: () => void;
  isImporting: boolean;
  onUpdateWord: (word: Word) => void;
}

const StudySession: React.FC<StudySessionProps> = ({ 
  dueWords, onComplete, onAddWord, onImportCore, isImporting, onUpdateWord 
}) => {
  const [queue, setQueue] = useState<Word[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalSessionWords, setTotalSessionWords] = useState(0);
  
  useEffect(() => {
      setQueue(dueWords);
      setTotalSessionWords(dueWords.length);
      setCompletedCount(0);
  }, [dueWords]);

  const handleInteraction = async (metrics: InteractionMetrics) => {
    const currentWord = queue[0];
    if (!currentWord) return;

    // 1. Algorithmic update
    const strength = calculateStrength(currentWord, metrics);
    const { interval, dueDate, repetitions } = scheduleNextReview(strength, currentWord.interval || 0);

    const updatedWord: Word = {
        ...currentWord,
        strength,
        interval,
        dueDate,
        repetitions: (currentWord.repetitions || 0) + repetitions
    };

    // 2. Persist
    db.updateWord(updatedWord).then(() => onUpdateWord(updatedWord)).catch(console.error);

    // 3. Queue Management
    const nextQueue = queue.slice(1);

    if (interval <= 10) {
        // Re-insert if hard/forgotten (interval minutes small)
        // Insert at pos 3 or end to ensure it doesn't appear immediately if queue is small
        const insertAt = Math.min(nextQueue.length, 3);
        nextQueue.splice(insertAt, 0, updatedWord);
    } else {
        setCompletedCount(prev => prev + 1);
    }

    setQueue(nextQueue);
  };

  if (queue.length === 0 && totalSessionWords > 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95 p-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-green-200 shadow-lg">
                <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">All Done!</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                本次复习已完成，智能算法已为您安排了下次复习时间。
            </p>
            <button 
                onClick={onComplete}
                className="w-full max-w-xs px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all active:scale-95"
            >
                返回概览
            </button>
        </div>
    );
  }

  if (queue.length === 0) {
    return (
         <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Search size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">暂无复习任务</h2>
            <div className="flex flex-col gap-3 mt-8 w-full max-w-xs">
                 <button 
                    onClick={onAddWord}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} /> 添加新单词
                </button>
                <button 
                    onClick={onImportCore}
                    disabled={isImporting}
                    className="w-full px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                    {isImporting ? <Loader2 size={18} className="animate-spin"/> : <BookDown size={18} />} 导入核心词库
                </button>
            </div>
         </div>
    );
  }

  const progress = totalSessionWords > 0 ? Math.min(100, Math.round((completedCount / totalSessionWords) * 100)) : 0;

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto relative pt-4 pb-4">
         {/* Top Bar */}
         <div className="flex-none px-4 mb-4">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span>Today's Review</span>
                <span>{completedCount} / {totalSessionWords}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
         </div>

         {/* Card Stack Area */}
         <div className="flex-1 relative w-full perspective-1000 px-2">
            {/* Background Card (The 'Next' Card) */}
            {queue.length > 1 && (
                <div className="absolute inset-0 z-0 pointer-events-none px-2" style={{ top: 0 }}>
                    <Flashcard 
                        key={`bg-${queue[1].id}`} 
                        word={queue[1]} 
                        onResult={() => {}} 
                        isFront={false} 
                    />
                </div>
            )}

            {/* Foreground Card (Active) */}
            <div className="absolute inset-0 z-10 px-2" style={{ top: 0 }}>
                <Flashcard 
                    key={queue[0].id} 
                    word={queue[0]} 
                    onResult={handleInteraction}
                />
            </div>
         </div>
         
         <div className="h-8 flex-none" /> {/* Bottom spacer */}
    </div>
  );
};

export default StudySession;