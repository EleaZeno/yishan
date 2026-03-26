// i18n translations
export const translations = {
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      study: 'Study',
      library: 'Library',
      diagnose: 'Diagnose',
      practice: 'Practice',
      analytics: 'Analytics',
      admin: 'Admin',
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      settings: 'Settings',
      logout: 'Logout',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      dueSignals: 'Due Signals',
      totalLoad: 'Total Load',
      retention: 'Retention',
      connectivity: 'Connectivity',
      startStudy: 'Start Study',
    },
    // Admin
    admin: {
      title: 'Admin Panel',
      connected: 'Connected to IndexedDB',
      totalWords: 'Total Words',
      mastered: 'Mastered',
      learning: 'Learning',
      newWords: 'New Words',
      distribution: 'Distribution',
      wordList: 'Word List',
      noWords: 'No words yet',
    },
  },
  zh: {
    // Navigation
    nav: {
      dashboard: '首页',
      study: '学习',
      library: '词库',
      diagnose: '诊断',
      practice: '练习',
      analytics: '分析',
      admin: '后台',
    },
    // Common
    common: {
      loading: '加载中...',
      error: '错误',
      success: '成功',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      edit: '编辑',
      save: '保存',
      export: '导出',
      import: '导入',
      refresh: '刷新',
      search: '搜索',
      filter: '筛选',
      sort: '排序',
      settings: '设置',
      logout: '退出',
    },
    // Dashboard
    dashboard: {
      title: '首页',
      dueSignals: '待复习',
      totalLoad: '总词数',
      retention: '记忆留存',
      connectivity: '连接度',
      startStudy: '开始学习',
    },
    // Admin
    admin: {
      title: '后台管理',
      connected: '已连接 IndexedDB',
      totalWords: '词库总量',
      mastered: '已掌握',
      learning: '学习中',
      newWords: '新词',
      distribution: '熟练度分布',
      wordList: '词库列表',
      noWords: '暂无词汇',
    },
  },
  ja: {
    // Navigation
    nav: {
      dashboard: 'ダッシュボード',
      study: '学習',
      library: '単語帳',
      diagnose: '診断',
      practice: '練習',
      analytics: '分析',
      admin: '管理',
    },
    // Common
    common: {
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      cancel: 'キャンセル',
      confirm: '確認',
      delete: '削除',
      edit: '編集',
      save: '保存',
      export: 'エクスポート',
      import: 'インポート',
      refresh: '更新',
      search: '検索',
      filter: 'フィルター',
      sort: 'ソート',
      settings: '設定',
      logout: 'ログアウト',
    },
    // Dashboard
    dashboard: {
      title: 'ダッシュボード',
      dueSignals: '復習待ち',
      totalLoad: '総単語数',
      retention: '記憶保持率',
      connectivity: '接続度',
      startStudy: '学習開始',
    },
    // Admin
    admin: {
      title: '管理パネル',
      connected: 'IndexedDB に接続',
      totalWords: '単語総数',
      mastered: 'マスター済み',
      learning: '学習中',
      newWords: '新規',
      distribution: '習熟度分布',
      wordList: '単語リスト',
      noWords: '単語がありません',
    },
  },
};

export type Language = keyof typeof translations;

export const useI18n = (lang: Language) => {
  return translations[lang];
};

export const getLanguage = (): Language => {
  const saved = localStorage.getItem('language');
  if (saved && saved in translations) return saved as Language;
  
  const browserLang = navigator.language.split('-')[0];
  if (browserLang in translations) return browserLang as Language;
  
  return 'en';
};
