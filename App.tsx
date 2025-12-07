import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import StatsChart from './components/StatsChart';
import Flashcard from './components/Flashcard';
import AddWordModal from './components/AddWordModal';
import { Word, Grade, Stats } from './types';
import { db } from './services/storage';
import { calculateReview } from './lib/sm2';
import { Loader2, Plus, Search, Trash2, CalendarClock } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [words, setWords] = useState<Word[]>([]);
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Study Session State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allWords = await db.getAllWords();
      const due = await db.getDueWords();
      setWords(allWords);
      setDueWords(due);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddWord = async (word: Word) => {
    await db.addWord(word);
    loadData();
  };

  const handleDeleteWord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('确定要删除这个单词吗？')) {
        await db.deleteWord(id);
        loadData();
    }
  }

  const startSession = () => {
    if (dueWords.length === 0) return;
    setCurrentCardIndex(0);
    setSessionActive(true);
    setSessionCompleted(false);
  };

  const handleReviewResult = async (grade: Grade) => {
    const currentWord = dueWords[currentCardIndex];
    const updatedFields = calculateReview(currentWord, grade);
    const updatedWord = { ...currentWord, ...updatedFields };

    // Update DB
    await db.updateWord(updatedWord);

    // Update local state for immediate feedback if needed, 
    // but mainly we move to next card
    if (currentCardIndex < dueWords.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setSessionActive(false);
      setSessionCompleted(true);
      loadData(); // Refresh due list
    }
  };

  // Views
  const renderDashboard = () => {
    const stats: Stats = {
      totalWords: words.length,
      dueToday: dueWords.length,
      learned: words.filter(w => w.interval > 1).length,
      retentionRate: words.length > 0 ? Math.round((words.filter(w => w.easiness > 2.5).length / words.length) * 100) : 0
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
            <p className="text-indigo-100 text-sm font-medium mb-1">待复习</p>
            <h3 className="text-4xl font-bold">{stats.dueToday}</h3>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm font-medium mb-1">总词汇量</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalWords}</h3>
          </div>
           <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm font-medium mb-1">已掌握</p>
            <h3 className="text-3xl font-bold text-emerald-600">{stats.learned}</h3>
          </div>
           <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-gray-400 text-sm font-medium mb-1">记忆留存率</p>
            <h3 className="text-3xl font-bold text-amber-500">{stats.retentionRate}%</h3>
          </div>
        </div>

        <StatsChart words={words} />

        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h3 className="text-lg font-bold text-indigo-900">准备好开始复习了吗？</h3>
                <p className="text-indigo-700 mt-1">今天有 {stats.dueToday} 个单词需要巩固。</p>
            </div>
            <button 
                onClick={() => {
                  setActiveTab('study');
                  startSession();
                }}
                disabled={stats.dueToday === 0}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md active:scale-95 w-full md:w-auto"
            >
                开始复习
            </button>
        </div>
      </div>
    );
  };

  const renderStudy = () => {
    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32}/></div>;

    if (sessionCompleted) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in-95">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <CalendarClock size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">今日任务完成！</h2>
                <p className="text-gray-500 max-w-xs mx-auto">你已经完成了所有的复习队列。休息一下，明天再来。</p>
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-8 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors"
                >
                    返回概览
                </button>
            </div>
        )
    }

    if (!sessionActive && dueWords.length > 0) {
        startSession(); // Auto start if tab switched
        return null; 
    }

    if (!sessionActive && dueWords.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Search size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">没有待复习的单词</h2>
                <p className="text-gray-500 mt-2">去词库添加一些新单词吧！</p>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium"
                >
                    添加单词
                </button>
             </div>
        );
    }

    return (
      <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-140px)]">
         <div className="mb-4 flex justify-between items-center text-sm text-gray-500 font-medium">
            <span>进度</span>
            <span>{currentCardIndex + 1} / {dueWords.length}</span>
         </div>
         <div className="h-1 w-full bg-gray-200 rounded-full mb-6 overflow-hidden">
            <div 
                className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                style={{ width: `${((currentCardIndex + 1) / dueWords.length) * 100}%` }}
            />
         </div>
         <div className="h-full">
            <Flashcard 
                word={dueWords[currentCardIndex]} 
                onResult={handleReviewResult}
            />
         </div>
      </div>
    );
  };

  const renderLibrary = () => {
    const filteredWords = words.filter(w => w.term.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="搜索单词..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pb-20">
                {filteredWords.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">未找到单词</div>
                ) : (
                    filteredWords.map(word => (
                        <div key={word.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
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
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${word.interval > 20 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    Lv.{word.repetitions}
                                </span>
                                <button 
                                    onClick={(e) => handleDeleteWord(word.id, e)}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onAddClick={() => setIsAddModalOpen(true)}
    >
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'study' && renderStudy()}
      {activeTab === 'library' && renderLibrary()}

      <AddWordModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddWord}
      />
    </Layout>
  );
};

export default App;
