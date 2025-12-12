import React, { useState } from 'react';
import { Word, Grade } from '../types';
import Flashcard from './Flashcard';
import { CheckCircle, Search, Plus, BookDown, Loader2 } from 'lucide-react';
import { db } from '../services/storage';
import { calculateReview } from '../lib/sm2';

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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);

  const handleReviewResult = async (grade: Grade) => {
    const currentWord = dueWords[currentCardIndex];
    if (!currentWord) return;

    // 1. Calculate new state
    const updatedFields = calculateReview(currentWord, grade);
    const updatedWord = { ...currentWord, ...updatedFields };

    // 2. Update DB asynchronously
    try {
        await db.updateWord(updatedWord);
        onUpdateWord(updatedWord); // Update local cache if needed
    } catch (err) {
        console.error("Failed to sync word", err);
    }

    // 3. Move UI forward
    const nextIndex = currentCardIndex + 1;
    setSessionProgress(Math.round((nextIndex / dueWords.length) * 100));

    if (nextIndex < dueWords.length) {
      setCurrentCardIndex(nextIndex);
    } else {
      setSessionCompleted(true);
    }
  };

  if (sessionCompleted) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-green-200 shadow-lg">
                <CheckCircle size={48} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">太棒了！</h2>
            <p className="text-gray-500 max-w-xs mx-auto mb-8">你已经完成了当前队列。保持这个节奏！</p>
            <button 
                onClick={onComplete}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all active:scale-95"
            >
                返回概览
            </button>
        </div>
    );
  }

  if (dueWords.length === 0) {
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

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-140px)] flex flex-col">
         {/* Progress Bar */}
         <div className="mb-6">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                <span>Session Progress</span>
                <span>{Math.round(sessionProgress)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                    style={{ width: `${sessionProgress}%` }}
                />
            </div>
         </div>

         {/* Card Area */}
         <div className="flex-1 relative">
            <Flashcard 
                // Add key to force remount when index changes
                key={dueWords[currentCardIndex].id}
                word={dueWords[currentCardIndex]} 
                onResult={handleReviewResult}
            />
         </div>
    </div>
  );
};

export default StudySession;