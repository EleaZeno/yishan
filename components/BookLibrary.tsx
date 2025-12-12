import React, { useMemo, useState } from 'react';
import { Plus, Check, Search, Book } from 'lucide-react';
import { JUNIOR_HIGH_WORDS } from '../data/presets';
import { PresetWord, Word } from '../types';
import { getInitialWordState } from '../lib/sm2';

interface BookLibraryProps {
  existingWords: Set<string>;
  onAddWord: (word: Word) => void;
}

const BookLibrary: React.FC<BookLibraryProps> = ({ existingWords, onAddWord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredWords = useMemo(() => {
    return JUNIOR_HIGH_WORDS.filter(w => 
      w.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
      w.definition.includes(searchTerm)
    );
  }, [searchTerm]);

  const handleAdd = (preset: PresetWord) => {
    const newWord: Word = {
      id: crypto.randomUUID(),
      term: preset.term,
      definition: preset.definition,
      phonetic: preset.phonetic,
      exampleSentence: preset.exampleSentence,
      exampleTranslation: preset.exampleTranslation,
      tags: [...preset.tags],
      ...getInitialWordState(),
      createdAt: Date.now(),
    };
    onAddWord(newWord);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
         <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
                <Book size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold">初中核心词汇库</h2>
         </div>
         <p className="text-emerald-100 text-sm opacity-90">
            精选 {JUNIOR_HIGH_WORDS.length} 个教育部大纲核心词汇，无需 AI 生成，一键添加。
         </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
            type="text" 
            placeholder="在词库中搜索..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-20 space-y-2">
        {filteredWords.map((word) => {
          const isAdded = existingWords.has(word.term);
          return (
            <div key={word.term} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-emerald-200 transition-colors">
              <div className="flex-1">
                 <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-lg">{word.term}</h3>
                    <span className="text-sm font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{word.phonetic}</span>
                 </div>
                 <p className="text-gray-600 text-sm mt-1">{word.definition}</p>
                 <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{word.exampleSentence}</p>
              </div>
              
              <button
                onClick={() => !isAdded && handleAdd(word)}
                disabled={isAdded}
                className={`
                    ml-4 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all active:scale-95
                    ${isAdded 
                        ? 'bg-gray-100 text-gray-400 cursor-default' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-sm'
                    }
                `}
              >
                {isAdded ? (
                    <>
                        <Check size={18} />
                        <span className="hidden sm:inline">已添加</span>
                    </>
                ) : (
                    <>
                        <Plus size={18} />
                        <span className="hidden sm:inline">添加</span>
                    </>
                )}
              </button>
            </div>
          );
        })}
        {filteredWords.length === 0 && (
            <div className="text-center py-12 text-gray-400">
                未找到匹配的单词
            </div>
        )}
      </div>
    </div>
  );
};

export default BookLibrary;
