import { lazy } from 'react';

// 懒加载组件，减少初始包大小
export const LazyAnalyticsPage = lazy(() => import('./AnalyticsPage'));
export const LazyStudyPlanGenerator = lazy(() => import('./StudyPlanGenerator'));
export const LazyAchievementSystem = lazy(() => import('./AchievementSystem'));
export const LazyReminderSystem = lazy(() => import('./ReminderSystem'));
export const LazyCloudBackupSystem = lazy(() => import('./CloudBackupSystem'));
export const LazyLearningHistoryTracker = lazy(() => import('./LearningHistoryTracker'));
export const LazyPrivacySettings = lazy(() => import('./PrivacySettings'));
export const LazyAchievementSharing = lazy(() => import('./AchievementSharing'));
export const LazyVocabularySharingAndCommunity = lazy(() => import('./VocabularySharingAndCommunity'));
export const LazyAdminDashboard = lazy(() => import('./AdminDashboard'));