
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import AddWordModal from './components/AddWordModal';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import StudySession from './components/StudySession';
import Library from './components/Library';
import { Word, Stats, User } from './types';
import { db } from './services/storage';
import { authService } from './services/auth';
import { getInitialWordState } from './lib/sm2';
import { Loader2 } from 'lucide-react';
import { getCoreVocabulary } from './data/vocabulary';
import { initAudio } from './lib/sound';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [stats, setStats] = useState<Stats>({ totalWords: 0, dueToday: 0, learned: 0, retentionRate: 0 });
  const [chartData, setChartData] = useState<Word[]>([]); // Small subset for charts
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Network Listeners
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

  // Audio Unlocker for Mobile
  useEffect(() => {
    const unlockAudio = () => {
        initAudio(); // Initialize and Resume AudioContext on first touch
        // Remove listener after first interaction
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Check Auth on Mount
  useEffect(() => {
    const token = authService.getToken();
    const currentUser = authService.getCurrentUser();
    if (token && currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
    }
    setAuthChecking(false);
  }, []);

  // Load Dashboard Data (Only specific needed data)
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const due = await db.getDueWords();
      setDueWords(due);

      const statsWords = await db.getAllWordsForStats();
      setChartData(statsWords);
      
      setStats({
        totalWords: statsWords.length, // Approximation in cloud mode
        dueToday: due.length,
        learned: statsWords.filter(w => w.interval > 1).length,
        // Use average strength for retention rate. Strength is 0-1.
        retentionRate: statsWords.length > 0 ? Math.round((statsWords.reduce((acc, w) => acc + (w.strength || 0), 0) / statsWords.length) * 100) : 0
      });

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
      // Seed if empty
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
    if(confirm('确定要删除这个单词吗？')) {
        await db.deleteWord(id);
        // We don't reload dashboard to avoid flickering library view, library handles its own state
    }
  }
  
  const handleImportCore = async () => {
      if (!confirm('确定要导入50个核心词汇到你的词库吗？')) return;
      setIsImporting(true);
      try {
          const vocab = getCoreVocabulary().map(v => ({
            ...v, id: crypto.randomUUID(), term: v.term!, definition: v.definition!, tags: v.tags!,
            ...getInitialWordState(), createdAt: Date.now()
          } as Word));
          
          await db.importWords(vocab);
          await loadDashboardData();
          alert('导入成功');
      } catch (e) {
          console.error(e);
      } finally {
          setIsImporting(false);
      }
  };

  if (authChecking) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-indigo-600" size={32}/></div>
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
    >
      {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            wordsForChart={chartData} 
            isOnline={isOnline}
            onStartStudy={() => setActiveTab('study')}
          />
      )}
      
      {activeTab === 'study' && (
          <StudySession 
            dueWords={dueWords}
            onComplete={() => setActiveTab('dashboard')}
            onAddWord={() => setIsAddModalOpen(true)}
            onImportCore={handleImportCore}
            isImporting={isImporting}
            onUpdateWord={(updated) => {
                // Optional: Update local dueWords cache to reflect immediate change if needed
            }}
          />
      )}

      {activeTab === 'library' && (
          <Library 
            onImportCore={handleImportCore}
            isImporting={isImporting}
            onDelete={handleDeleteWord}
          />
      )}

      <AddWordModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddWord}
      />
    </Layout>
  );
};

export default App;