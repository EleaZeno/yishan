import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Word, User, ContentType } from '../types';
import { Search, BookDown, Loader2, Trash2, Crown, Zap, Filter, X } from 'lucide-react';
import clsx from 'clsx';
import { db } from '../services/storage';
import { CONTENT_TYPE_LABELS } from '../types';
import { BookOpen, Calculator, Lightbulb, AlertTriangle, FileText } from 'lucide-react';

interface LibraryProps {
  onImportCore: () => void;
  isImporting: boolean;
  onDelete: (id: string) => void;
  user: User | null;
}

// Content type visual config
const CONTENT_TYPE_CONFIG: Record<ContentType, { icon: React.ReactNode; bgClass: string; textClass: string }> = {
  word: { 
    icon: <BookOpen size={12} />, 
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400'
  },
  formula: { 
    icon: <Calculator size={12} />, 
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400'
  },
  knowledge: { 
    icon: <Lightbulb size={12} />, 
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-400'
  },
  mistake: { 
    icon: <AlertTriangle size={12} />, 
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400'
  },
  definition: { 
    icon: <FileText size={12} />, 
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400'
  },
};

const Library: React.FC<LibraryProps> = ({ onImportCore, isImporting, onDelete, user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'my' | 'market'>('my');
  const [words, setWords] = useState<Word[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
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
      if (searchTerm || contentTypeFilter !== 'all') {
        const allWords = await db.getAllWordsForStats();
        let filtered = allWords.filter(w => !w.deletedAt);
        
        if (searchTerm) {
          filtered = filtered.filter(w => 
            w.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
            w.definition.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (contentTypeFilter !== 'all') {
          filtered = filtered.filter(w => (w.contentType || 'word') === contentTypeFilter);
        }
        
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
  }, [activeSubTab, searchTerm, contentTypeFilter]);

  useEffect(() => {
    if (page > 1 && activeSubTab === 'my' && !searchTerm && contentTypeFilter === 'all') {
      fetchWords(page);
    }
  }, [page]);

  const contentTypes: (ContentType | 'all')[] = ['all', 'word', 'formula', 'knowledge', 'mistake', 'definition'];

  const marketPacks = [
    { id: 'cet4', name: '大学英语四级核心词', count: 2400, premium: false, tags: ['考试', '基础'], type: 'word' as ContentType },
    { id: 'cet6', name: '大学英语六级进阶', count: 1800, premium: true, tags: ['考试', '中级'], type: 'word' as ContentType },
    { id: 'ielts', name: '雅思 8.0 冲刺词库', count: 3200, premium: true, tags: ['出国', '高级'], type: 'word' as ContentType },
    { id: 'math-formulas', name: '高考数学公式大全', count: 200, premium: false, tags: ['考试', '公式'], type: 'formula' as ContentType },
    { id: 'physics', name: '高中物理知识点', count: 150, premium: true, tags: ['考试', '理科'], type: 'knowledge' as ContentType },
    { id: 'dev', name: '硅谷工程师日常英语', count: 1200, premium: true, tags: ['职场', '专业'], type: 'word' as ContentType },
  ];

  const activeFilterCount = contentTypeFilter !== 'all' ? 1 : 0;

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
          {/* Search and Filters */}
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "p-3 rounded-2xl border transition-all relative",
                showFilters || activeFilterCount > 0
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Filter size={20} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Content Type Filter */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 p-3 bg-card rounded-2xl border border-border">
              {contentTypes.map((type) => {
                const isSelected = contentTypeFilter === type;
                const config = type === 'all' ? null : CONTENT_TYPE_CONFIG[type];
                const labels = type === 'all' ? { zh: '全部' } : CONTENT_TYPE_LABELS[type];
                
                return (
                  <button
                    key={type}
                    onClick={() => setContentTypeFilter(type)}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                      isSelected
                        ? (type === 'all' ? 'bg-primary/10 border-primary/30 text-primary' : `${config?.bgClass} ${config?.textClass} border-current`)
                        : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    {config?.icon}
                    <span>{labels.zh}</span>
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Word List */}
          <div className="flex-1 overflow-y-auto space-y-3 pb-24 no-scrollbar">
            {filteredWords.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Search size={48} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-[0.2em]">No Signals Detected</p>
                {contentTypeFilter !== 'all' && (
                  <button 
                    onClick={() => setContentTypeFilter('all')}
                    className="mt-3 text-xs text-primary hover:underline"
                  >
                    清除筛选
                  </button>
                )}
              </div>
            ) : (
              filteredWords.map((word, index) => {
                const isLast = index === filteredWords.length - 1;
                const contentType = word.contentType || 'word';
                const typeConfig = CONTENT_TYPE_CONFIG[contentType];
                const typeLabels = CONTENT_TYPE_LABELS[contentType];
                
                return (
                  <div 
                    key={word.id} 
                    ref={isLast ? lastWordElementRef : null}
                    className="bg-card p-5 rounded-[1.5rem] border border-border shadow-sm flex justify-between items-center hover:shadow-md hover:border-primary/50 transition-all group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {/* Content Type Badge */}
                        <span className={clsx(
                          "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                          typeConfig.bgClass, typeConfig.textClass
                        )}>
                          {typeConfig.icon}
                          {typeLabels.zh}
                        </span>
                        
                        <h4 className="font-black text-foreground text-xl tracking-tight truncate">{word.term}</h4>
                        {word.phonetic && <span className="text-xs text-muted-foreground font-medium font-mono">[{word.phonetic.replace(/\//g, '')}]</span>}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium truncate leading-relaxed">{word.definition}</p>
                      
                      {/* Tags */}
                      {word.tags && word.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {word.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-muted rounded-md text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
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

          {/* Content Type Filter for Market */}
          <div className="flex flex-wrap gap-2">
            {contentTypes.slice(1).map((type) => {
              const config = CONTENT_TYPE_CONFIG[type];
              const labels = CONTENT_TYPE_LABELS[type];
              const count = marketPacks.filter(p => p.type === type).length;
              
              if (count === 0) return null;
              
              return (
                <button
                  key={type}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                    `${config.bgClass} ${config.textClass} border-current/30`
                  )}
                >
                  {config.icon}
                  <span>{labels.zh}</span>
                  <span className="text-xs opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketPacks.map(pack => {
              const typeConfig = CONTENT_TYPE_CONFIG[pack.type];
              
              return (
                <div key={pack.id} className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                      {pack.tags.map(t => <span key={t} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-muted text-muted-foreground rounded-md border border-border">{t}</span>)}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={clsx("px-2 py-0.5 rounded-md text-xs font-medium", typeConfig.bgClass, typeConfig.textClass)}>
                        {CONTENT_TYPE_LABELS[pack.type].zh}
                      </span>
                      {pack.premium && <Crown size={16} className="text-amber-500" />}
                    </div>
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
