import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import AddWordModal from './components/AddWordModal';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import StudySession from './components/StudySession';
import Library from './components/Library';
import DiagnosticCenter from './components/DiagnosticCenter';
import VocabTest from './components/VocabTest';
import GrammarTest from './components/GrammarTest';
import ReadingTest from './components/ReadingTest';
import ListeningTest from './components/ListeningTest';
import WritingTest from './components/WritingTest';
import Practice from './components/Practice';
import AnalyticsPage from './components/AnalyticsPage';
import StudyPlanGenerator from './components/StudyPlanGenerator';
import AchievementSystem from './components/AchievementSystem';
import ReminderSystem from './components/ReminderSystem';
import CloudBackupSystem from './components/CloudBackupSystem';
import LearningHistoryTracker from './components/LearningHistoryTracker';
import PrivacySettings from './components/PrivacySettings';
import AchievementSharing from './components/AchievementSharing';
import VocabularySharingAndCommunity from './components/VocabularySharingAndCommunity';
import { Word, Stats, User } from './types';
import { db } from './services/storage';
import { authService } from './services/auth';
import { getInitialWordState, predictRecallProbability } from './lib/algorithm';
import { Loader2, Database, BookOpen, Brain, TrendingUp, RefreshCw, Download, Zap } from 'lucide-react';
import { Button } from './components/ui/button';
import { getCoreVocabulary } from './data/vocabulary';
import { initAudio } from './lib/sound';
import { Toaster, toast } from 'sonner';

const AdminPanel = () => {
  const [total, setTotal] = useState(0);
  const [mastered, setMastered] = useState(0);
  const [learning, setLearning] = useState(0);
  const [fresh, setFresh] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await db.getAllWordsForStats();
      setWords(all);
      setTotal(all.length);
      setMastered(all.filter(w => (w.halflife || 0) > 20160).length);
      setLearning(all.filter(w => (w.halflife || 0) > 2880 && (w.halflife || 0) <= 20160).length);
      setFresh(all.filter(w => (w.totalExposure || 0) === 0).length);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Connected to IndexedDB</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw size={14} className="mr-2" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const b = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' });
            const u = URL.createObjectURL(b);
            const a = document.createElement('a');
            a.href = u; a.download = 'yishan-words.json'; a.click();
            URL.revokeObjectURL(u);
          }}>
            <Download size={14} className="mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black">{total}</p>
              <p className="text-xs text-muted-foreground font-semibold">Total Words</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black">{mastered}</p>
              <p className="text-xs text-muted-foreground font-semibold">Mastered</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black">{learning}</p>
              <p className="text-xs text-muted-foreground font-semibold">Learning</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black">{fresh}</p>
              <p className="text-xs text-muted-foreground font-semibold">New Words</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <p className="text-sm font-black mb-3">Proficiency</p>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-2">
          {total > 0 && <div className="bg-slate-200 rounded-l-full" style={{ width: Math.max(2, fresh / total * 100) + '%' }} />}
          {total > 0 && <div className="bg-amber-400" style={{ width: Math.max(2, learning / total * 100) + '%' }} />}
          {total > 0 && <div className="bg-emerald-500 rounded-r-full" style={{ width: Math.max(2, mastered / total * 100) + '%' }} />}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>New Words {fresh}</span>
          <span>Learning {learning}</span>
          <span>Mastered {mastered}</span>
        </div>
      </div>

      {/* Word list */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <p className="text-sm font-black">
            <BookOpen size={14} className="inline mr-2" />
            Word List
          </p>
          <span className="text-xs text-muted-foreground">{words.length} words</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : words.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-medium">No words yet，Import vocabulary first</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {words.map((w, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-black text-sm">{w.term || '?'}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{(w.definition || '').substring(0, 40)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                    (w.totalExposure || 0) === 0 ? 'bg-slate-200 text-slate-600' :
                    (w.halflife || 0) > 20160 ? 'bg-emerald-100 text-emerald-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    Lv.{w.totalExposure || 0}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {Math.round((w.halflife || 1440) / 60)}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [stats, setStats] = useState<Stats>({ 
      totalSignals: 0, fadingSignals: 0, averageRecallProb: 0, connectivity: 0 
  });
  const [chartData, setChartData] = useState<Word[]>([]); 
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(false);

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
          ? statsWords.reduce((acc, w) => acc + predictRecallProbability(w, now), 0) / statsWords.length : 0;
      const connectivity = statsWords.length > 0 
          ? Math.round((statsWords.filter(w => w.halflife > 10080).length / statsWords.length) * 100) : 0;
      setStats({ totalSignals: statsWords.length, fadingSignals: due.length, averageRecallProb: Math.round(avgProb * 100), connectivity });
    } catch (e) { console.error(e); }
    setLoading(false);
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

  const handleDeleteWord = (id: string) => {
    toast('Remove this word?', {
      action: {
        label: 'Confirm',
        onClick: async () => {
          await db.deleteWord(id);
          loadDashboardData();
        }
      }
    });
  }

  const handleUpdateWord = (updatedWord: Word) => {
    setChartData(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
  };
  
  const handleImportCore = () => {
      toast('Import core vocabulary?', {
        action: {
          label: 'Confirm',
          onClick: async () => {
            setIsImporting(true);
            try {
                const vocab = getCoreVocabulary().map(v => ({
                  ...v, id: crypto.randomUUID(), term: v.term!, definition: v.definition!, tags: v.tags!,
                  ...getInitialWordState(), createdAt: Date.now()
                } as Word));
                await db.importWords(vocab);
                await loadDashboardData();
            } catch (e) { console.error(e); }
            setIsImporting(false);
          }
        }
      });
  };

  if (authChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
      );
  }

  if (!isAuthenticated) {
      return <AuthPage onLoginSuccess={handleLoginSuccess} onGuestAccess={handleGuestAccess} />;
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onAddClick={() => setIsAddModalOpen(true)}
      user={user}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && <Dashboard stats={stats} wordsForChart={chartData} isOnline={isOnline} onStartStudy={() => setActiveTab('study')} />}
      {activeTab === 'study' && <StudySession dueWords={dueWords} onComplete={() => { setActiveTab('dashboard'); loadDashboardData(); }} onAddWord={() => setIsAddModalOpen(true)} onImportCore={handleImportCore} isImporting={isImporting} onUpdateWord={handleUpdateWord} />}
      {activeTab === 'library' && <Library onImportCore={handleImportCore} isImporting={isImporting} onDelete={handleDeleteWord} />}
      {activeTab === 'diagnose' && !activeTest && <DiagnosticCenter userId={user?.id} onStartTest={(testType: string) => {
        if (testType === 'practice') setActiveTab('practice');
        else setActiveTest(testType);
      }} />}
      {activeTab === 'diagnose' && activeTest === 'vocab' && <VocabTest userId={user?.id} onBack={() => setActiveTest(null)} />}
      {activeTab === 'diagnose' && activeTest === 'grammar' && <GrammarTest userId={user?.id} onBack={() => setActiveTest(null)} />}
      {activeTab === 'diagnose' && activeTest === 'reading' && <ReadingTest userId={user?.id} onBack={() => setActiveTest(null)} />}
      {activeTab === 'diagnose' && activeTest === 'listening' && <ListeningTest userId={user?.id} onBack={() => setActiveTest(null)} />}
      {activeTab === 'diagnose' && activeTest === 'writing' && <WritingTest userId={user?.id} onBack={() => setActiveTest(null)} />}
      {activeTab === 'practice' && <Practice userId={user?.id} onBack={() => setActiveTab('diagnose')} />}
      {activeTab === 'analytics' && <AnalyticsPage />}
      {activeTab === 'plans' && <StudyPlanGenerator />}
      {activeTab === 'achievements' && <AchievementSystem />}
      {activeTab === 'reminders' && <ReminderSystem />}
      {activeTab === 'backup' && <CloudBackupSystem />}
      {activeTab === 'history' && <LearningHistoryTracker />}
      {activeTab === 'privacy' && <PrivacySettings />}
      {activeTab === 'sharing' && <AchievementSharing />}
      {activeTab === 'community' && <VocabularySharingAndCommunity />}
      {activeTab === 'admin' && <AdminPanel />}
      <AddWordModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddWord} />
      <Toaster />
    </Layout>
  );
};

export default App;
