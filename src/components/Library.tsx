
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Word } from '../types';
import { Search, BookDown, Loader2, Trash2, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import { db } from '../services/storage';
import { getBooksWithFallback, getBookWordsWithFallback } from '../services/vocabulary';
import BookSelector from './BookSelector';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LibraryProps {
  onImportCore: () => void;
  isImporting: boolean;
  onDelete: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({ onImportCore, isImporting, onDelete }) => {
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>();
  const [isImportingBook, setIsImportingBook] = useState(false);
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
  const filteredWords = words.filter(w => (w.term || '').toLowerCase().includes(searchTerm.toLowerCase()));

  // 导入词汇书（从云端获取）
  const handleImportBook = async (bookId: string) => {
    setIsImportingBook(true);
    try {
        // 优先从云端获取词汇
        const bookWords = await getBookWordsWithFallback(bookId);
        if (bookWords.length === 0) {
            alert('该词汇书暂无内容');
            return;
        }
        const wordsToImport: Word[] = bookWords.map(v => ({
            id: v.id || crypto.randomUUID(),
            term: v.term,
            definition: v.definition,
            phonetic: v.phonetic,
            exampleSentence: v.exampleSentence,
            tags: v.tags || [],
            alpha: 3,
            beta: 1,
            halflife: 1440,
            lastSeen: 0,
            totalExposure: 0,
            dueDate: Date.now(),
            createdAt: Date.now(),
        }));
        await db.importWords(wordsToImport);
        // 重新加载数据
        setPage(1);
        setWords([]);
        setHasMore(true);
        fetchWords(1, true);
        alert(`成功导入 ${wordsToImport.length} 个词汇！`);
    } catch (e) {
        console.error(e);
        alert('导入失败');
    } finally {
        setIsImportingBook(false);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
                <Input 
                    type="text" 
                    placeholder="搜索已加载单词..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-6 rounded-xl shadow-sm bg-background"
                />
            </div>
            <Button 
                variant="outline"
                onClick={() => setShowBookSelector(true)}
                disabled={isImporting}
                className="h-12 px-4 rounded-xl shadow-sm"
            >
                {isImporting ? <Loader2 size={18} className="animate-spin mr-2"/> : <BookOpen size={18} className="mr-2" />}
                <span className="hidden sm:inline">词库</span>
            </Button>
            <Button 
                onClick={onImportCore}
                disabled={isImporting}
                className="h-12 px-4 rounded-xl shadow-sm"
            >
                {isImporting ? <Loader2 size={18} className="animate-spin mr-2"/> : <BookDown size={18} className="mr-2" />}
                <span className="hidden sm:inline">导入</span>
            </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pb-20">
            {filteredWords.length === 0 && !loading ? (
                <div className="text-center py-10 text-muted-foreground">列表为空</div>
            ) : (
                filteredWords.map((word, index) => {
                    const isLast = index === filteredWords.length - 1;
                    return (
                        <Card 
                            key={word.id} 
                            ref={isLast ? lastWordElementRef : null}
                            className="hover:shadow-md transition-shadow"
                        >
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-foreground text-lg">{word.term}</h4>
                                    <p className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-md">{word.definition}</p>
                                    <div className="flex gap-2 mt-2">
                                        {(word.tags || []).map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5 rounded">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="outline" className={clsx(
                                        "text-xs font-bold px-2 py-1 rounded-full",
                                        (word.stability ?? 0) > 28800 ? 'bg-green-100 text-green-700 border-green-200' : 
                                        (word.stability ?? 0) > 7200 ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    )}>
                                        Lv.{word.totalExposure}
                                    </Badge>
                                    <Button 
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(word.id);
                                            setWords(prev => prev.filter(w => w.id !== word.id));
                                        }}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            )}
            {loading && (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            )}
        </div>
        
        {/* 词汇书选择弹窗 */}
        {showBookSelector && (
            <BookSelector
                learnedWords={new Set(words.map(w => w.term))}
                selectedBookId={selectedBookId}
                onSelectBook={(bookId) => {
                    setSelectedBookId(bookId);
                    setShowBookSelector(false);
                    // 导入选中的词汇书
                    handleImportBook(bookId);
                }}
                onClose={() => setShowBookSelector(false)}
            />
        )}
    </div>
  );
};

export default Library;
