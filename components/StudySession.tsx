import React, { useState, useEffect, useCallback } from 'react';
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
  // Use a local queue state to manage immediate repetitions
  const [queue, setQueue] = useState<Word[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalSessionWords, setTotalSessionWords] = useState(0);
  
  // Initialize queue
  useEffect(() => {
      setQueue(dueWords);
      setTotalSessionWords(dueWords.length);
      setCompletedCount(0);
  }, [dueWords]);

  const handleInteraction = async (metrics: InteractionMetrics) => {
    const currentWord = queue[0];
    if (!currentWord) return;

    // 1. Calculate new Strength based on Behavior
    const strength = calculateStrength(currentWord, metrics);
    
    // 2. Schedule Next Review
    const { interval, dueDate, repetitions } = scheduleNextReview(strength, currentWord.interval || 0);

    const updatedWord: Word = {
        ...currentWord,
        strength,
        interval,
        dueDate,
        repetitions: (currentWord.repetitions || 0) + repetitions
    };

    // 3. Persist
    try {
        await db.updateWord(updatedWord);
        onUpdateWord(updatedWord);
    } catch (err) {
        console.error("Failed to sync word", err);
    }

    // 4. Queue Management Logic
    const newQueue = queue.slice(1); // Remove current
    
    // If interval is very short (< 10 mins), it means user forgot or it's hard. 
    // Re-queue it in this session!
    if (interval <= 10) {
        // Insert back into queue at position 3 or end, whichever is closer, to ensure spaced rep within session
        const reInsertIndex = Math.min(newQueue.length, 3);
        newQueue.splice(reInsertIndex, 0, updatedWord);
        // Don't increment completed count yet as we will see it again
    } else {
        setCompletedCount(prev => prev + 1);
    }

    setQueue(newQueue);
  };

  if (queue.length === 0 && totalSessionWords > 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-green-200 shadow-lg">
                <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">本次复习完成！</h2>
            <p className="text-gray-500 max-w-xs mx-auto mb-8">
                智能算法已根据你的滑动行为更新了记忆模型。
            </p>
            <button 
                onClick={onComplete}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all active:scale-95"
            >
                返回概览
            </button>
        </div>
    );
  }

  if (queue.length === 0) {
    return (
         <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Search size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">没有待复习的单词</h2>
            <div className="flex gap-4 mt-8">
                 <button 
                    onClick={onAddWord}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium flex items-center gap-2"
                >
                    <Plus size={18} /> 添加单词
                </button>
                <button 
                    onClick={onImportCore}
                    disabled={isImporting}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50"
                >
                    {isImporting ? <Loader2 size={18} className="animate-spin"/> : <BookDown size={18} />} 导入核心词库
                </button>
            </div>
         </div>
    );
  }

  const progress = totalSessionWords > 0 ? Math.min(100, Math.round((completedCount / totalSessionWords) * 100)) : 0;

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-140px)] flex flex-col">
         {/* Progress Bar */}
         <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                <span>Session Progress</span>
                <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
         </div>

         {/* Card Area */}
         <div className="flex-1 relative">
            <Flashcard 
                key={queue[0].id} // Force remount for new word
                word={queue[0]} 
                onResult={handleInteraction}
            />
         </div>
    </div>
  );
};

export default StudySession;