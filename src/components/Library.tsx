
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Word, User } from '../types';
import { Search, BookDown, Loader2, Trash2, Crown, Zap } from 'lucide-react';
import clsx from 'clsx';
import { db } from '../services/storage';

interface LibraryProps {
  onImportCore: () => void;
  isImporting: boolean;
  onDelete: (id: string) => void;
  user: User | null;
}

const Library: React.FC<LibraryProps> = ({ onImportCore, isImporting, onDelete, user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'my' | 'market'>('my');
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

  const fetchWords = async (pageNum: number, isRefresh = false) => {
    setLoading(true);
    try {
        if (searchTerm) {
            // If searching, we need to fetch all words and filter
            // In a real app, we'd use a search endpoint or an index, but for now we fetch all
            const allWords = await db.getAllWordsForStats();
            const filtered = allWords.filter(w => 
                w.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                w.definition.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setWords(filtered);
            setHasMore(false);
        } else {
            const newWords = await db.getLibraryWords(pageNum, 20);
            setWords(prev => isRefresh ? newWords : [...prev, ...newWords]);
            setHasMore(newWords.length === 20);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setWords([]);
    setHasMore(true);
    if (activeSubTab === 'my') {
        fetchWords(1, true);
    }
  }, [activeSubTab, searchTerm]);

  useEffect(() => {
    if (page > 1 && activeSubTab === 'my' && !searchTerm) fetchWords(page);
  }, [page]);

  const filteredWords = words;

  const marketPacks = [
      { id: 'cet4', name: '大学英语四级核心词', count: 2400, premium: false, tags: ['考试', '基础'] },
      { id: 'cet6', name: '大学英语六级进阶', count: 1800, premium: true, tags: ['考试', '中级'] },
      { id: 'ielts', name: '雅思 8.0 冲刺词库', count: 3200, premium: true, tags: ['出国', '高级'] },
      { id: 'dev', name: '硅谷工程师日常英语', count: 1200, premium: true, tags: ['职场', '专业'] },
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
        {/* Tabs */}
        <div className="flex bg-muted p-1.5 rounded-2xl w-full max-w-xs mx-auto mb-2">
            <button 
                onClick={() => setActiveSubTab('my')}
                className={clsx(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    activeSubTab === 'my' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
            >
                我的信号
            </button>
            <button 
                onClick={() => setActiveSubTab('market')}
                className={clsx(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1",
                    activeSubTab === 'market' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
            >
                信号市场 <Zap size={10} className="fill-current"/>
            </button>
        </div>

        {activeSubTab === 'my' ? (
            <>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                        <input 
                            type="text" 
                            placeholder="搜索信号库..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pb-24 no-scrollbar">
                    {filteredWords.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Search size={48} strokeWidth={1} className="mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-[0.2em]">No Signals Detected</p>
                        </div>
                    ) : (
                        filteredWords.map((word, index) => {
                            const isLast = index === filteredWords.length - 1;
                            return (
                                <div 
                                    key={word.id} 
                                    ref={isLast ? lastWordElementRef : null}
                                    className="bg-card p-5 rounded-[1.5rem] border border-border shadow-sm flex justify-between items-center hover:shadow-md hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-black text-foreground text-xl tracking-tight truncate">{word.term}</h4>
                                            {word.phonetic && <span className="text-xs text-muted-foreground font-medium font-mono">[{word.phonetic.replace(/\//g, '')}]</span>}
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium truncate leading-relaxed">{word.definition}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 flex-none">
                                        <div className={clsx(
                                            "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                                            word.halflife > 20160 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                            word.halflife > 4320 ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 
                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        )}>
                                            {word.halflife > 20160 ? 'Deep' : word.halflife > 4320 ? 'Stable' : 'Fading'}
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(word.id);
                                                setWords(prev => prev.filter(w => w.id !== word.id));
                                            }}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {loading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={24} /></div>}
                </div>
            </>
        ) : (
            <div className="flex-1 overflow-y-auto space-y-4 pb-24 no-scrollbar">
                <div className="bg-primary p-8 rounded-[2.5rem] text-primary-foreground relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Zap size={160} /></div>
                    <h3 className="text-2xl font-black mb-2 tracking-tight">发现专业级信号流</h3>
                    <p className="text-primary-foreground/80 text-xs font-medium max-w-xs leading-relaxed">
                        订阅 Pro 版可解锁所有词库。针对不同场景优化的贝叶斯训练模型。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {marketPacks.map(pack => (
                        <div key={pack.id} className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-wrap gap-2">
                                    {pack.tags.map(t => <span key={t} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-muted text-muted-foreground rounded-md border border-border">{t}</span>)}
                                </div>
                                {pack.premium && <Crown size={16} className="text-amber-500" />}
                            </div>
                            <h4 className="text-lg font-black text-foreground mb-1 leading-tight">{pack.name}</h4>
                            <p className="text-muted-foreground text-xs font-bold mb-6">{pack.count} 个认知信号节点</p>
                            
                            <button 
                                onClick={onImportCore}
                                disabled={isImporting}
                                className={clsx(
                                    "mt-auto w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                    pack.premium && !user?.isPro ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20" : "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                            >
                                {isImporting ? <Loader2 size={14} className="animate-spin"/> : <BookDown size={14} />}
                                {pack.premium && !user?.isPro ? 'Pro 解锁' : '立即导入'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default Library;
