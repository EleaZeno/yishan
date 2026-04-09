import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Clock, BookOpen, Calculator, Lightbulb, AlertTriangle,
  FileText, ArrowRight, Sparkles, TrendingUp, Brain, BarChart3
} from 'lucide-react';
import { Word, ContentType } from '../types';
import { db } from '../services/storage';
import { CONTENT_TYPE_LABELS } from '../types';
import { predictRecallProbability } from '../lib/algorithm';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onWordSelect?: (word: Word) => void;
  onNavigate?: (tab: string) => void;
}

const TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  word: <BookOpen size={12} />,
  formula: <Calculator size={12} />,
  knowledge: <Lightbulb size={12} />,
  mistake: <AlertTriangle size={12} />,
  definition: <FileText size={12} />,
};

const TYPE_COLORS: Record<ContentType, string> = {
  word: 'text-blue-500 bg-blue-500/10',
  formula: 'text-purple-500 bg-purple-500/10',
  knowledge: 'text-green-500 bg-green-500/10',
  mistake: 'text-red-500 bg-red-500/10',
  definition: 'text-amber-500 bg-amber-500/10',
};

// Recent searches
const useRecentSearches = () => {
  const get = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem('yishan_recent_searches') || '[]');
    } catch {
      return [];
    }
  };

  const add = (query: string) => {
    const recent = get().filter(q => q !== query);
    recent.unshift(query);
    localStorage.setItem('yishan_recent_searches', JSON.stringify(recent.slice(0, 5)));
  };

  const clear = () => {
    localStorage.removeItem('yishan_recent_searches');
  };

  return { get, add, clear };
};

// Quick actions
const QUICK_ACTIONS = [
  { icon: <Brain size={16} />, label: '开始学习', action: 'study', description: '复习待校准信号' },
  { icon: <TrendingUp size={16} />, label: '查看统计', action: 'analytics', description: '学习数据分析' },
  { icon: <Sparkles size={16} />, label: 'AI 助手', action: 'ai', description: '智能学习建议' },
  { icon: <BarChart3 size={16} />, label: '成就墙', action: 'achievements', description: '查看已解锁成就' },
];

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onWordSelect, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Word[]>([]);
  const [recentSearches] = useRecentSearches();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchWords = async () => {
      setLoading(true);
      try {
        const allWords = await db.getAllWordsForStats();
        const q = query.toLowerCase();

        const matched = allWords
          .filter(w => {
            if (w.deletedAt) return false;
            return (
              w.term?.toLowerCase().includes(q) ||
              w.definition?.toLowerCase().includes(q) ||
              w.tags?.some(t => t.toLowerCase().includes(q)) ||
              w.phonetic?.toLowerCase().includes(q)
            );
          })
          .slice(0, 10);

        setResults(matched);
        setSelectedIndex(0);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    const debounce = setTimeout(searchWords, 150);
    return () => clearTimeout(debounce);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const totalItems = results.length + QUICK_ACTIONS.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(totalItems, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (query.trim()) {
          // Save to recent
          recentSearches.add(query.trim());
        }
        if (selectedIndex < results.length) {
          onWordSelect?.(results[selectedIndex]);
          onClose();
        } else {
          const actionIdx = selectedIndex - results.length;
          if (actionIdx >= 0 && actionIdx < QUICK_ACTIONS.length) {
            const action = QUICK_ACTIONS[actionIdx].action;
            if (action === 'ai') {
              // Toggle AI panel
              onClose();
            } else {
              onNavigate?.(action);
              onClose();
            }
          }
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  }, [results, selectedIndex, query, onWordSelect, onNavigate, onClose, recentSearches]);

  // Scroll selected item into view
  useEffect(() => {
    const container = resultsRef.current;
    if (!container) return;
    const selected = container.querySelector(`[data-index="${selectedIndex}"]`);
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  const now = Date.now();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-xl bg-card rounded-2xl shadow-2xl border overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b">
            <Search size={20} className="text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索单词、标签、释义..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-muted rounded-lg text-muted-foreground"
              >
                <X size={16} />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 bg-muted rounded-lg text-xs text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
            {/* Word Results */}
            {results.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">
                  信号节点 ({results.length})
                </p>
                {results.map((word, i) => {
                  const recall = predictRecallProbability(word, now);
                  const isSelected = i === selectedIndex;
                  const type = word.contentType || 'word';

                  return (
                    <div
                      key={word.id}
                      data-index={i}
                      onClick={() => { onWordSelect?.(word); onClose(); }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                    >
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${TYPE_COLORS[type]}`}>
                        {TYPE_ICONS[type]}
                        {CONTENT_TYPE_LABELS[type].zh}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground truncate">{word.term}</span>
                          {word.phonetic && (
                            <span className="text-xs text-muted-foreground font-mono">
                              [{word.phonetic.replace(/\//g, '')}]
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{word.definition}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`text-xs font-medium ${
                          recall > 0.7 ? 'text-green-500' : recall > 0.4 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {Math.round(recall * 100)}%
                        </span>
                        <ArrowRight size={14} className="text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Actions */}
            {!query && (
              <div className="p-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">
                  快捷操作
                </p>
                {QUICK_ACTIONS.map((action, i) => {
                  const idx = results.length + i;
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={action.action}
                      data-index={idx}
                      onClick={() => {
                        if (action.action === 'ai') {
                          onClose();
                        } else {
                          onNavigate?.(action.action);
                          onClose();
                        }
                      }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                      <ArrowRight size={14} className="text-muted-foreground" />
                    </div>
                  );
                })}

                {/* Recent Searches */}
                {recentSearches.get().length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-3 py-2 mt-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        最近搜索
                      </p>
                      <button
                        onClick={() => recentSearches.clear()}
                        className="text-xs text-muted-foreground hover:text-primary"
                      >
                        清除
                      </button>
                    </div>
                    {recentSearches.get().map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(q)}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-muted transition-colors text-left"
                      >
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{q}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* No Results */}
            {query && results.length === 0 && !loading && (
              <div className="text-center py-12">
                <Search size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">
                  未找到 "<strong>{query}</strong>" 相关内容
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  尝试其他关键词，或添加新单词
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-5 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> 导航
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> 选中
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">ESC</kbd> 关闭
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalSearch;
