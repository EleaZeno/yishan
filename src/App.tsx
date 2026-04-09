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
import PrivacyPolicy from './components/PrivacyPolicy';
import Onboarding from './components/Onboarding';
import LearningSettings from './components/LearningSettings';
import AchievementSharing from './components/AchievementSharing';
import VocabularySharingAndCommunity from './components/VocabularySharingAndCommunity';
import Profile from './components/Profile';
import { Word, Stats, User } from './types';
import { db } from './services/storage';
import { authService } from './services/auth';
import { getInitialWordState, predictRecallProbability } from './lib/algorithm';
import { Loader2, Database, BookOpen, Brain, TrendingUp, RefreshCw, Download, Zap } from 'lucide-react';
import { Button } from './components/ui/button';
import { getCoreVocabulary } from './data/vocabulary';
import { VOCAB_DATA } from './data/vocab-data';
import { initAudio } from './lib/sound';
import { setupErrorHandling } from './lib/error-handler';
import { ThemeProvider } from './contexts/ThemeProvider';
import './i18n';
import { Toaster, toast } from 'sonner';
import AdminDashboard from './components/AdminDashboard';
import EnhancementPack from './components/EnhancementPack';
import ShortcutsHelp from './lib/keyboard-shortcuts';
import GlobalSearch from './components/GlobalSearch';
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS, Shortcut } from './lib/keyboard-shortcuts';
import { ToastContainer } from './components/NotificationCenter';
import { ShortcutsHelp as ShortcutsHelpComponent } from './lib/keyboard-shortcuts';
import { motion } from 'framer-motion';

// 初始化错误处理
setupErrorHandling();

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
  const [allWords, setAllWords] = useState<Word[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Keyboard shortcuts
  const shortcuts: Shortcut[] = [
    {
      key: DEFAULT_SHORTCUTS.ESCAPE.key,
      modifiers: DEFAULT_SHORTCUTS.ESCAPE.modifiers,
      description: DEFAULT_SHORTCUTS.ESCAPE.description,
      descriptionZh: DEFAULT_SHORTCUTS.ESCAPE.descriptionZh,
      action: () => {
        setIsAddModalOpen(false);
        setActiveTest(null);
      },
      requireNoInput: false,
    },
    {
      key: DEFAULT_SHORTCUTS.ADD_WORD.key,
      modifiers: DEFAULT_SHORTCUTS.ADD_WORD.modifiers,
      description: DEFAULT_SHORTCUTS.ADD_WORD.description,
      descriptionZh: DEFAULT_SHORTCUTS.ADD_WORD.descriptionZh,
      action: () => setIsAddModalOpen(true),
    },
    {
      key: DEFAULT_SHORTCUTS.START_STUDY.key,
      modifiers: DEFAULT_SHORTCUTS.START_STUDY.modifiers,
      description: DEFAULT_SHORTCUTS.START_STUDY.description,
      descriptionZh: DEFAULT_SHORTCUTS.START_STUDY.descriptionZh,
      action: () => setActiveTab('study'),
    },
    {
      key: DEFAULT_SHORTCUTS.QUICK_REVIEW.key,
      modifiers: DEFAULT_SHORTCUTS.QUICK_REVIEW.modifiers,
      description: DEFAULT_SHORTCUTS.QUICK_REVIEW.description,
      descriptionZh: DEFAULT_SHORTCUTS.QUICK_REVIEW.descriptionZh,
      action: () => setActiveTab('study'),
    },
    {
      key: DEFAULT_SHORTCUTS.GO_DASHBOARD.key,
      modifiers: DEFAULT_SHORTCUTS.GO_DASHBOARD.modifiers,
      description: DEFAULT_SHORTCUTS.GO_DASHBOARD.description,
      descriptionZh: DEFAULT_SHORTCUTS.GO_DASHBOARD.descriptionZh,
      action: () => setActiveTab('dashboard'),
    },
    {
      key: DEFAULT_SHORTCUTS.GO_STUDY.key,
      modifiers: DEFAULT_SHORTCUTS.GO_STUDY.modifiers,
      description: DEFAULT_SHORTCUTS.GO_STUDY.description,
      descriptionZh: DEFAULT_SHORTCUTS.GO_STUDY.descriptionZh,
      action: () => setActiveTab('study'),
    },
    {
      key: DEFAULT_SHORTCUTS.GO_LIBRARY.key,
      modifiers: DEFAULT_SHORTCUTS.GO_LIBRARY.modifiers,
      description: DEFAULT_SHORTCUTS.GO_LIBRARY.description,
      descriptionZh: DEFAULT_SHORTCUTS.GO_LIBRARY.descriptionZh,
      action: () => setActiveTab('library'),
    },
    {
      key: DEFAULT_SHORTCUTS.GO_ANALYTICS.key,
      modifiers: DEFAULT_SHORTCUTS.GO_ANALYTICS.modifiers,
      description: DEFAULT_SHORTCUTS.GO_ANALYTICS.description,
      descriptionZh: DEFAULT_SHORTCUTS.GO_ANALYTICS.descriptionZh,
      action: () => setActiveTab('analytics'),
    },
    {
      key: DEFAULT_SHORTCUTS.HELP.key,
      modifiers: DEFAULT_SHORTCUTS.HELP.modifiers,
      description: DEFAULT_SHORTCUTS.HELP.description,
      descriptionZh: DEFAULT_SHORTCUTS.HELP.descriptionZh,
      action: () => setShowShortcuts(true),
    },
    {
      key: DEFAULT_SHORTCUTS.SEARCH.key,
      modifiers: DEFAULT_SHORTCUTS.SEARCH.modifiers,
      description: DEFAULT_SHORTCUTS.SEARCH.description,
      descriptionZh: DEFAULT_SHORTCUTS.SEARCH.descriptionZh,
      action: () => setShowSearch(true),
    },
    {
      key: DEFAULT_SHORTCUTS.SYNC.key,
      modifiers: DEFAULT_SHORTCUTS.SYNC.modifiers,
      description: DEFAULT_SHORTCUTS.SYNC.description,
      descriptionZh: DEFAULT_SHORTCUTS.SYNC.descriptionZh,
      action: async () => {
        const result = await db.sync();
        toast(result.synced > 0 ? `已同步 ${result.synced} 条` : '已是最新');
      },
    },
  ];

  useKeyboardShortcuts({ shortcuts, enabled: isAuthenticated && !showShortcuts });

  // Network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Audio init
  useEffect(() => {
    const unlockAudio = () => {
      initAudio();
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    return () => window.removeEventListener('touchstart', unlockAudio);
  }, []);

  // Auth check
  useEffect(() => {
    const token = authService.getToken();
    const currentUser = authService.getCurrentUser();
    if (token && currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setAuthChecking(false);
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const due = await db.getDueWords();
      setDueWords(due);
      const statsWords = await db.getAllWordsForStats();
      setChartData(statsWords);
      setAllWords(statsWords);
      const now = Date.now();
      const avgProb = statsWords.length > 0
        ? statsWords.reduce((acc, w) => acc + predictRecallProbability(w, now), 0) / statsWords.length : 0;
      const connectivity = statsWords.length > 0
        ? Math.round((statsWords.filter(w => w.halflife > 10080).length / statsWords.length) * 100) : 0;
      setStats({
        totalSignals: statsWords.length,
        fadingSignals: due.length,
        averageRecallProb: Math.round(avgProb * 100),
        connectivity
      });
    } catch (e) {
      console.error(e);
    }
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
        ...v, id: crypto.randomUUID(), term: v.term!, definition: v.definition!,
        tags: v.tags!, ...getInitialWordState(), createdAt: Date.now()
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
  };

  const handleUpdateWord = (updatedWord: Word) => {
    setChartData(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
  };

  const handleImportCore = async () => {
    setIsImporting(true);
    try {
      const vocab = VOCAB_DATA.map(v => ({
        id: crypto.randomUUID(),
        term: v.word,
        definition: `${v.pos} ${v.translation}`,
        phonetic: undefined,
        tags: [`level${v.level}`],
        ...getInitialWordState(),
        createdAt: Date.now()
      } as Word));
      console.log('Importing', vocab.length, 'words');
      await db.importWords(vocab);
      await loadDashboardData();
      toast(`Successfully imported ${vocab.length} words!`);
    } catch (e) {
      console.error('Import error:', e);
      toast.error('Import failed: ' + String(e));
    }
    setIsImporting(false);
  };

  // Handle start study event from notifications
  useEffect(() => {
    const handleStartStudy = () => setActiveTab('study');
    window.addEventListener('yishan:start-study', handleStartStudy);
    return () => window.removeEventListener('yishan:start-study', handleStartStudy);
  }, []);

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="animate-spin text-primary/30" size={48} />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} onGuestAccess={handleGuestAccess} />;
  }

  return (
    <ThemeProvider>
      <Onboarding onComplete={() => {}} />
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
            onNavigateToPractice={() => setActiveTab('practice')}
          />
        )}
        {activeTab === 'study' && (
          <StudySession
            dueWords={dueWords}
            onComplete={() => { setActiveTab('dashboard'); loadDashboardData(); }}
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
        {activeTab === 'diagnose' && !activeTest && (
          <DiagnosticCenter userId={user?.id} onStartTest={(testType: string) => {
            if (testType === 'practice') setActiveTab('practice');
            else setActiveTest(testType);
          }} />
        )}
        {activeTab === 'diagnose' && activeTest === 'vocab' && (
          <VocabTest userId={user?.id} onBack={() => setActiveTest(null)} />
        )}
        {activeTab === 'diagnose' && activeTest === 'grammar' && (
          <GrammarTest userId={user?.id} onBack={() => setActiveTest(null)} />
        )}
        {activeTab === 'diagnose' && activeTest === 'reading' && (
          <ReadingTest userId={user?.id} onBack={() => setActiveTest(null)} />
        )}
        {activeTab === 'diagnose' && activeTest === 'listening' && (
          <ListeningTest userId={user?.id} onBack={() => setActiveTest(null)} />
        )}
        {activeTab === 'diagnose' && activeTest === 'writing' && (
          <WritingTest userId={user?.id} onBack={() => setActiveTest(null)} />
        )}
        {activeTab === 'practice' && (
          <Practice userId={user?.id} onBack={() => setActiveTab('diagnose')} />
        )}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'plans' && <StudyPlanGenerator />}
        {activeTab === 'achievements' && <AchievementSystem />}
        {activeTab === 'reminders' && <ReminderSystem />}
        {activeTab === 'backup' && <CloudBackupSystem />}
        {activeTab === 'history' && <LearningHistoryTracker />}
        {activeTab === 'privacy' && <PrivacySettings />}
        {activeTab === 'privacy-policy' && <PrivacyPolicy />}
        {activeTab === 'learning-settings' && <LearningSettings />}
        {activeTab === 'sharing' && <AchievementSharing />}
        {activeTab === 'community' && <VocabularySharingAndCommunity />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'profile' && <Profile user={user} onNavigate={setActiveTab} onLogout={handleLogout} />}

        <AddWordModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddWord}
        />

        <Toaster />
        <ToastContainer />

        {/* Enhancement Pack: AI + Graph + Notifications */}
        <EnhancementPack
          words={allWords}
          stats={stats}
          studyHistory={[]}
          activeTab={activeTab}
          onNavigate={setActiveTab}
        />

        {/* Global Search */}
        <GlobalSearch
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onNavigate={setActiveTab}
          onWordSelect={(word) => {
            // Switch to library and highlight the word
            setActiveTab('library');
          }}
        />

        {/* Shortcuts Help */}
        <ShortcutsHelpComponent
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
          shortcuts={shortcuts}
        />
      </Layout>
    </ThemeProvider>
  );
};

export default App;
