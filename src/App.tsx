
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import AddWordModal from './components/AddWordModal';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import StudySession from './components/StudySession';
import Library from './components/Library';
import PricingModal from './components/PricingModal';
import { Word, Stats, User } from './types';
import { db } from './services/storage';
import { authService } from './services/auth';
import { getInitialWordState, predictRecallProbability } from './lib/algorithm';
import { Loader2 } from 'lucide-react';
import { getCoreVocabulary } from './data/vocabulary';
import { initAudio } from './lib/sound';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [stats, setStats] = useState<Stats>({ 
      totalSignals: 0, 
      fadingSignals: 0, 
      averageRecallProb: 0, 
      connectivity: 0,
      estimatedVocab: 0
  });
  const [chartData, setChartData] = useState<Word[]>([]); 
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedVocab = localStorage.getItem('yishan_vocab_est');
    if (storedVocab) {
      setStats(prev => ({ ...prev, estimatedVocab: parseInt(storedVocab) }));
    }
  }, []);

  useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      }
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
        initAudio();
        window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    return () => window.removeEventListener('touchstart', unlockAudio);
  }, []);

  useEffect(() => {
    const token = authService.getToken();
    const currentUser = authService.getCurrentUser();
    if (token && currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
    }
    setAuthChecking(false);
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const due = await db.getDueWords();
      setDueWords(due);

      const statsWords = await db.getAllWordsForStats();
      setChartData(statsWords);
      
      const now = Date.now();
      const avgProb = statsWords.length > 0 
          ? statsWords.reduce((acc, w) => acc + predictRecallProbability(w, now), 0) / statsWords.length
          : 0;

      const connectivity = statsWords.length > 0 
          ? Math.round((statsWords.filter(w => w.halflife > 10080).length / statsWords.length) * 100) 
          : 0;

      setStats(prev => ({
        ...prev,
        totalSignals: statsWords.length,
        fadingSignals: due.length,
        averageRecallProb: Math.round(avgProb * 100),
        connectivity
      }));

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadDashboardData();
  }, [isAuthenticated, loadDashboardData]);

  const handleLoginSuccess = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsAuthenticated(true);
  };

  const handleGuestAccess = async () => {
      setUser(null);
      setIsAuthenticated(true);
      const due = await db.getDueWords();
      if (due.length === 0) {
          const vocab = getCoreVocabulary().map(v => ({
            ...v, id: crypto.randomUUID(), term: v.term!, definition: v.definition!, tags: v.tags!,
            ...getInitialWordState(), createdAt: Date.now()
          } as Word));
          await db.importWords(vocab);
      }
      loadDashboardData();
  };

  const handleLogout = () => {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setActiveTab('dashboard');
  };

  const handleAddWord = async (word: Word) => {
    await db.addWord(word);
    loadDashboardData();
  };

  const handleDeleteWord = async (id: string) => {
    if(confirm('移除此信号连接？')) {
        await db.deleteWord(id);
        loadDashboardData();
    }
  }

  const handleUpdateWord = (updatedWord: Word) => {
    setChartData(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
  };

  const handleVocabUpdate = (vocab: number) => {
    localStorage.setItem('yishan_vocab_est', vocab.toString());
    setStats(prev => ({ ...prev, estimatedVocab: vocab }));
  };
  
  const handleImportCore = async () => {
      // 收费逻辑检查
      if (!user?.isPro) {
          setIsPricingModalOpen(true);
          return;
      }

      if (!confirm('导入预设信号包？')) return;
      setIsImporting(true);
      try {
          const vocab = getCoreVocabulary().map(v => ({
            ...v, id: crypto.randomUUID(), term: v.term!, definition: v.definition!, tags: v.tags!,
            ...getInitialWordState(), createdAt: Date.now()
          } as Word));
          await db.importWords(vocab);
          await loadDashboardData();
      } catch (e) {
          console.error(e);
      } finally {
          setIsImporting(false);
      }
  };

  const handleUpgradeSuccess = () => {
      if (user) {
          const updatedUser = { ...user, isPro: true };
          setUser(updatedUser);
          localStorage.setItem('yishan_user', JSON.stringify(updatedUser));
          // 这里实际应调用后端更新接口，MVP 版本通过 localStorage 模拟
      }
  };

  if (authChecking) {
      return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-slate-300" size={32}/></div>
  }

  if (!isAuthenticated) {
      return <AuthPage onLoginSuccess={handleLoginSuccess} onGuestAccess={handleGuestAccess} />
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onAddClick={() => setIsAddModalOpen(true)}
      user={user}
      onLogout={handleLogout}
      onUpgradeClick={() => setIsPricingModalOpen(true)}
    >
      {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            wordsForChart={chartData} 
            isOnline={isOnline}
            onStartStudy={() => setActiveTab('study')}
            onVocabUpdate={handleVocabUpdate}
          />
      )}
      
      {activeTab === 'study' && (
          <StudySession 
            dueWords={dueWords}
            onComplete={() => {
                setActiveTab('dashboard');
                loadDashboardData();
            }}
            onAddWord={() => setIsAddModalOpen(true)}
            onImportCore={handleImportCore}
            isImporting={isImporting}
            onUpdateWord={handleUpdateWord}
          />
      )}

      {activeTab === 'library' && (
          <Library 
            onImportCore={handleImportCore}
            isImporting={isImporting}
            onDelete={handleDeleteWord}
            user={user}
          />
      )}

      <AddWordModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddWord}
      />

      <PricingModal 
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSuccess={handleUpgradeSuccess}
      />
    </Layout>
  );
};

export default App;
