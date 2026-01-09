
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Word } from '../types';
import { Search, BookDown, Loader2, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { db } from '../services/storage';

interface LibraryProps {
  onImportCore: () => void;
  isImporting: boolean;
  onDelete: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({ onImportCore, isImporting, onDelete }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastWordElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Initial Load & Refresh when import happens
  useEffect(() => {
    setPage(1);
    setWords([]);
    setHasMore(true);
    fetchWords(1, true);
  }, []); // Reload triggers manually elsewhere if needed, or by dependency

  const fetchWords = async (pageNum: number, isRefresh = false) => {
    setLoading(true);
    try {
        const newWords = await db.getLibraryWords(pageNum, 20);
        setWords(prev => isRefresh ? newWords : [...prev, ...newWords]);
        setHasMore(newWords.length === 20);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (page > 1) fetchWords(page);
  }, [page]);

  // Client-side filtering for search (simple version)
  // Note: For real scalability, search should be server-side.
  const filteredWords = words.filter(w => w.term.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4 h-full flex flex-col">
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="搜索已加载单词..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                />
            </div>
            <button 
                onClick={onImportCore}
                disabled={isImporting}
                className="px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-indigo-600 font-medium flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
                {isImporting ? <Loader2 size={18} className="animate-spin"/> : <BookDown size={18} />}
                <span className="hidden sm:inline">导入</span>
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pb-20">
            {filteredWords.length === 0 && !loading ? (
                <div className="text-center py-10 text-gray-400">列表为空</div>
            ) : (
                filteredWords.map((word, index) => {
                    const isLast = index === filteredWords.length - 1;
                    return (
                        <div 
                            key={word.id} 
                            ref={isLast ? lastWordElementRef : null}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
                        >
                            <div>
                                <h4 className="font-bold text-gray-800 text-lg">{word.term}</h4>
                                <p className="text-sm text-gray-500 truncate max-w-[200px] md:max-w-md">{word.definition}</p>
                                <div className="flex gap-2 mt-2">
                                    {word.tags.map(tag => (
                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={clsx(
                                    "text-xs font-bold px-2 py-1 rounded-full",
                                    // Use stability instead of interval (minutes)
                                    word.stability > 28800 ? 'bg-green-100 text-green-700' : 
                                    word.stability > 7200 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                )}>
                                    {/* Use totalExposure instead of repetitions */}
                                    Lv.{word.totalExposure}
                                </span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(word.id);
                                        setWords(prev => prev.filter(w => w.id !== word.id));
                                    }}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
            {loading && (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-indigo-500" />
                </div>
            )}
        </div>
    </div>
  );
};

export default Library;