﻿﻿import React, { useState, useEffect, useCallback } from 'react';
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
import { Word, Stats, User } from './types';
import { db } from './services/storage';
import { authService } from './services/auth';
import { getInitialWordState, predictRecallProbability } from './lib/algorithm';
import { Loader2, Database, BookOpen, Brain, TrendingUp, RefreshCw, Download, Zap } from 'lucide-react';
import { Button } from './components/ui/button';

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

  return React.createElement('div', { className: 'space-y-6 max-w-5xl mx-auto' }, [
    // Header
    React.createElement('div', { key: 'h', className: 'flex items-center justify-between' }, [
      React.createElement('div', { key: 't' }, [
        React.createElement('h1', { key: 'h1', className: 'text-2xl font-black tracking-tight' }, 'Admin Panel'),
        React.createElement('p', { key: 'p', className: 'text-sm text-muted-foreground mt-1' }, 'Connected to IndexedDB'),
      ]),
      React.createElement('div', { key: 'btns', className: 'flex gap-2' }, [
        React.createElement(Button, { key: 'r', variant: 'outline', size: 'sm', onClick: load }, [React.createElement(RefreshCw, { key: 'i', size: 14 }), ' Refresh']),
        React.createElement(Button, { key: 'e', variant: 'outline', size: 'sm', onClick: () => {
          const b = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' });
          const u = URL.createObjectURL(b);
          const a = document.createElement('a');
          a.href = u; a.download = 'yishan-words.json'; a.click();
          URL.revokeObjectURL(u);
        }}, [React.createElement(Download, { key: 'i', size: 14 }), ' Export']),
      ]),
    ]),

    // Stats
    React.createElement('div', { key: 'stats', className: 'grid grid-cols-2 md:grid-cols-4 gap-3' }, [
      React.createElement('div', { key: 's1', className: 'bg-white rounded-2xl p-4 border border-slate-100' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center gap-3' }, [
          React.createElement('div', { key: 'ic', className: 'w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center' }, [
            React.createElement(Database, { key: 'i', size: 18, className: 'text-white' }),
          ]),
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'v', className: 'text-2xl font-black' }, total),
            React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground font-semibold' }, 'Total Words'),
          ]),
        ]),
      ]),
      React.createElement('div', { key: 's2', className: 'bg-white rounded-2xl p-4 border border-slate-100' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center gap-3' }, [
          React.createElement('div', { key: 'ic', className: 'w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center' }, [
            React.createElement(Brain, { key: 'i', size: 18, className: 'text-white' }),
          ]),
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'v', className: 'text-2xl font-black' }, mastered),
            React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground font-semibold' }, 'Mastered'),
          ]),
        ]),
      ]),
      React.createElement('div', { key: 's3', className: 'bg-white rounded-2xl p-4 border border-slate-100' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center gap-3' }, [
          React.createElement('div', { key: 'ic', className: 'w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center' }, [
            React.createElement(TrendingUp, { key: 'i', size: 18, className: 'text-white' }),
          ]),
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'v', className: 'text-2xl font-black' }, learning),
            React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground font-semibold' }, 'Learning'),
          ]),
        ]),
      ]),
      React.createElement('div', { key: 's4', className: 'bg-white rounded-2xl p-4 border border-slate-100' }, [
        React.createElement('div', { key: 'd', className: 'flex items-center gap-3' }, [
          React.createElement('div', { key: 'ic', className: 'w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center' }, [
            React.createElement(Zap, { key: 'i', size: 18, className: 'text-white' }),
          ]),
          React.createElement('div', { key: 't' }, [
            React.createElement('p', { key: 'v', className: 'text-2xl font-black' }, fresh),
            React.createElement('p', { key: 'l', className: 'text-xs text-muted-foreground font-semibold' }, 'New Words'),
          ]),
        ]),
      ]),
    ]),

    // Progress bar
    React.createElement('div', { key: 'prog', className: 'bg-white rounded-2xl p-4 border border-slate-100' }, [
      React.createElement('p', { key: 't', className: 'text-sm font-black mb-3' }, 'Proficiency'),
      React.createElement('div', { key: 'bar', className: 'flex h-3 rounded-full overflow-hidden gap-0.5 mb-2' }, [
        total > 0 && React.createElement('div', { key: 'f', className: 'bg-slate-200 rounded-l-full', style: { width: Math.max(2, fresh / total * 100) + '%' } }),
        total > 0 && React.createElement('div', { key: 'l', className: 'bg-amber-400', style: { width: Math.max(2, learning / total * 100) + '%' } }),
        total > 0 && React.createElement('div', { key: 'm', className: 'bg-emerald-500 rounded-r-full', style: { width: Math.max(2, mastered / total * 100) + '%' } }),
      ]),
      React.createElement('div', { key: 'leg', className: 'flex justify-between text-xs text-muted-foreground font-medium' }, [
        React.createElement('span', { key: '1' }, `New Words ${fresh}`),
        React.createElement('span', { key: '2' }, `Learning ${learning}`),
        React.createElement('span', { key: '3' }, `Mastered ${mastered}`),
      ]),
    ]),

    // Word list
    React.createElement('div', { key: 'list', className: 'bg-white rounded-2xl border border-slate-100 overflow-hidden' }, [
      React.createElement('div', { key: 'lh', className: 'px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center' }, [
        React.createElement('p', { key: 't', className: 'text-sm font-black' }, [
          React.createElement(BookOpen, { key: 'i', size: 14, className: 'inline mr-2' }),
          'Word List',
        ]),
        React.createElement('span', { key: 'c', className: 'text-xs text-muted-foreground' }, `${words.length} words`),
      ]),
      loading ? React.createElement('div', { key: 'loading', className: 'flex items-center justify-center py-12' }, [
        React.createElement(Loader2, { key: 'i', className: 'animate-spin text-muted-foreground', size: 24 }),
      ]) : words.length === 0 ? React.createElement('div', { key: 'empty', className: 'text-center py-12 text-muted-foreground' }, [
        React.createElement('p', { key: 'p', className: 'font-medium' }, 'No words yet，Import vocabulary first'),
      ]) : React.createElement('div', { key: 'words', className: 'divide-y divide-slate-50 max-h-96 overflow-y-auto' },
        words.map((w, i) =>
          React.createElement('div', { key: i, className: 'px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors' }, [
            React.createElement('div', { key: 'l' }, [
              React.createElement('p', { key: 't', className: 'font-black text-sm' }, w.term || '?'),
              React.createElement('p', { key: 'd', className: 'text-xs text-muted-foreground truncate max-w-xs' }, (w.definition || '').substring(0, 40)),
            ]),
            React.createElement('div', { key: 'r', className: 'flex items-center gap-2' }, [
              React.createElement('span', { key: 'lvl', className: `text-xs px-2 py-1 rounded-lg font-bold ${
                (w.totalExposure || 0) === 0 ? 'bg-slate-200 text-slate-600' :
                (w.halflife || 0) > 20160 ? 'bg-emerald-100 text-emerald-700' :
                'bg-amber-100 text-amber-700'
              }` }, `Lv.${w.totalExposure || 0}`),
              React.createElement('span', { key: 'hl', className: 'text-xs text-muted-foreground font-mono' },
                `${Math.round((w.halflife || 1440) / 60)}h`
              ),
            ]),
          ])
        )
      ),
    ]),
  ]);
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

  const handleDeleteWord = async (id: string) => {
    if(confirm('Remove this word?')) {
        await db.deleteWord(id);
        loadDashboardData();
    }
  }

  const handleUpdateWord = (updatedWord: Word) => {
    setChartData(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
  };
  
  const handleImportCore = async () => {
      if (!confirm('Import core vocabulary?')) return;
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
  };

  if (authChecking) {
      return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-white' },
        React.createElement(Loader2, { className: 'animate-spin text-slate-300', size: 32 })
      );
  }

  if (!isAuthenticated) {
      return React.createElement(AuthPage, { onLoginSuccess: handleLoginSuccess, onGuestAccess: handleGuestAccess });
  }

  return React.createElement(Layout, {
    activeTab,
    onTabChange: setActiveTab,
    onAddClick: () => setIsAddModalOpen(true),
    user,
    onLogout: handleLogout,
  },
    activeTab === 'dashboard' && React.createElement(Dashboard, { stats, wordsForChart: chartData, isOnline, onStartStudy: () => setActiveTab('study') }),
    activeTab === 'study' && React.createElement(StudySession, { dueWords, onComplete: () => { setActiveTab('dashboard'); loadDashboardData(); }, onAddWord: () => setIsAddModalOpen(true), onImportCore: handleImportCore, isImporting, onUpdateWord: handleUpdateWord }),
    activeTab === 'library' && React.createElement(Library, { onImportCore: handleImportCore, isImporting, onDelete: handleDeleteWord }),
    activeTab === 'diagnose' && !activeTest && React.createElement(DiagnosticCenter, { userId: user?.id, onStartTest: (testType: string) => {
      if (testType === 'practice') setActiveTab('practice');
      else setActiveTest(testType);
    }}),
    activeTab === 'diagnose' && activeTest === 'vocab' && React.createElement(VocabTest, { userId: user?.id, onBack: () => setActiveTest(null) }),
    activeTab === 'diagnose' && activeTest === 'grammar' && React.createElement(GrammarTest, { userId: user?.id, onBack: () => setActiveTest(null) }),
    activeTab === 'diagnose' && activeTest === 'reading' && React.createElement(ReadingTest, { userId: user?.id, onBack: () => setActiveTest(null) }),
    activeTab === 'diagnose' && activeTest === 'listening' && React.createElement(ListeningTest, { userId: user?.id, onBack: () => setActiveTest(null) }),
    activeTab === 'diagnose' && activeTest === 'writing' && React.createElement(WritingTest, { userId: user?.id, onBack: () => setActiveTest(null) }),
    activeTab === 'practice' && React.createElement(Practice, { userId: user?.id, onBack: () => setActiveTab('diagnose') }),
    activeTab === 'analytics' && React.createElement(AnalyticsPage),
    activeTab === 'plans' && React.createElement(StudyPlanGenerator),
    activeTab === 'achievements' && React.createElement(AchievementSystem),
    activeTab === 'reminders' && React.createElement(ReminderSystem),
    activeTab === 'admin' && React.createElement(AdminPanel),
    React.createElement(AddWordModal, { isOpen: isAddModalOpen, onClose: () => setIsAddModalOpen(false), onSave: handleAddWord }),
  );
};

export default App;
