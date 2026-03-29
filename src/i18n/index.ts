import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  zh: {
    translation: {
      // 通用
      app_name: '忆闪',
      loading: '加载中...',
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      search: '搜索',
      back: '返回',
      close: '关闭',
      
      // 导航
      nav_dashboard: '首页',
      nav_study: '学习',
      nav_library: '词库',
      nav_diagnose: '诊断',
      nav_profile: '我的',
      
      // 首页
      dashboard_title: '今日学习',
      dashboard_due: '待复习',
      dashboard_total: '总词汇',
      dashboard_mastered: '已掌握',
      dashboard_start_study: '开始学习',
      
      // 学习
      study_empty: '暂无待复习单词',
      study_import: '导入词库',
      study_select_book: '选择词库',
      study_add_word: '添加单词',
      study_swipe_left: '向左：已掌握',
      study_swipe_right: '向右：需复习',
      study_complete: '学习完成！',
      study_finish: '结束学习',
      
      // 词库
      library_my: '我的词库',
      library_market: '词库市场',
      library_empty: '词库为空',
      library_import_core: '导入核心词包',
      
      // 设置
      settings_theme: '主题',
      settings_theme_light: '浅色',
      settings_theme_dark: '深色',
      settings_theme_auto: '自动',
      settings_language: '语言',
      settings_clear_cache: '清除缓存并更新',
      settings_logout: '退出登录',
      
      // 隐私
      privacy_title: '隐私政策',
      
      // 错误
      error_load: '加载失败',
      error_save: '保存失败',
      error_import: '导入失败',
    }
  },
  en: {
    translation: {
      // Common
      app_name: 'Yishan',
      loading: 'Loading...',
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      search: 'Search',
      back: 'Back',
      close: 'Close',
      
      // Navigation
      nav_dashboard: 'Home',
      nav_study: 'Study',
      nav_library: 'Library',
      nav_diagnose: 'Diagnose',
      nav_profile: 'Profile',
      
      // Dashboard
      dashboard_title: "Today's Study",
      dashboard_due: 'Due',
      dashboard_total: 'Total',
      dashboard_mastered: 'Mastered',
      dashboard_start_study: 'Start Study',
      
      // Study
      study_empty: 'No words due for review',
      study_import: 'Import Vocabulary',
      study_select_book: 'Select Book',
      study_add_word: 'Add Word',
      study_swipe_left: 'Left: Mastered',
      study_swipe_right: 'Right: Review Again',
      study_complete: 'Session Complete!',
      study_finish: 'Finish',
      
      // Library
      library_my: 'My Library',
      library_market: 'Market',
      library_empty: 'Library is empty',
      library_import_core: 'Import Core Vocabulary',
      
      // Settings
      settings_theme: 'Theme',
      settings_theme_light: 'Light',
      settings_theme_dark: 'Dark',
      settings_theme_auto: 'Auto',
      settings_language: 'Language',
      settings_clear_cache: 'Clear Cache & Update',
      settings_logout: 'Logout',
      
      // Privacy
      privacy_title: 'Privacy Policy',
      
      // Errors
      error_load: 'Failed to load',
      error_save: 'Failed to save',
      error_import: 'Failed to import',
    }
  },
  ja: {
    translation: {
      app_name: '憶閃',
      loading: '読み込み中...',
      confirm: '確認',
      cancel: 'キャンセル',
      save: '保存',
      delete: '削除',
      search: '検索',
      back: '戻る',
      close: '閉じる',
      nav_dashboard: 'ホーム',
      nav_study: '学習',
      nav_library: '単語帳',
      nav_diagnose: '診断',
      nav_profile: 'プロフィール',
      dashboard_title: '今日の学習',
      dashboard_due: '復習待ち',
      dashboard_total: '合計',
      dashboard_mastered: '習得済み',
      dashboard_start_study: '学習開始',
      study_empty: '復習する単語がありません',
      study_import: '単語帳をインポート',
      study_select_book: '単語帳を選択',
      study_add_word: '単語を追加',
      study_swipe_left: '左：習得',
      study_swipe_right: '右：再復習',
      study_complete: '学習完了！',
      study_finish: '終了',
      library_my: 'マイ単語帳',
      library_market: 'マーケット',
      library_empty: '単語帳が空です',
      library_import_core: 'コア単語帳をインポート',
      settings_theme: 'テーマ',
      settings_theme_light: 'ライト',
      settings_theme_dark: 'ダーク',
      settings_theme_auto: '自動',
      settings_language: '言語',
      settings_clear_cache: 'キャッシュをクリア',
      settings_logout: 'ログアウト',
      privacy_title: 'プライバシーポリシー',
      error_load: '読み込み失敗',
      error_save: '保存失敗',
      error_import: 'インポート失敗',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
