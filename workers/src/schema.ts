/**
 * yishan Workers - Drizzle ORM Schema Bindings
 * Type-safe bindings for Cloudflare D1
 */

import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

// Users
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  lastLoginAt: integer('last_login_at'),
  settings: text('settings').default('{}'),
})

// Words
export const words = sqliteTable('words', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  term: text('term').notNull(),
  phonetic: text('phonetic'),
  definition: text('definition').notNull(),
  exampleSentence: text('example_sentence'),
  exampleTranslation: text('example_translation'),
  contentType: text('content_type').default('word'),
  tags: text('tags').default('[]'),
  notes: text('notes'),
  alpha: real('alpha').default(1),
  beta: real('beta').default(1),
  halflife: real('halflife').default(1440),
  lastSeen: integer('last_seen'),
  totalExposure: integer('total_exposure').default(0),
  dueDate: integer('due_date'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
})

// Review Logs
export const reviewLogs = sqliteTable('review_logs', {
  id: text('id').primaryKey(),
  wordId: text('word_id').notNull(),
  userId: text('user_id').notNull(),
  direction: text('direction').notNull(),
  durationMs: integer('duration_ms'),
  isFlipped: integer('is_flipped').default(0),
  audioPlayedCount: integer('audio_played_count').default(0),
  predictedProb: real('predicted_prob'),
  actualProb: real('actual_prob'),
  reviewTime: integer('review_time').notNull(),
  clientTimezone: text('client_timezone'),
  deviceType: text('device_type'),
})

// Sync Metadata
export const syncMeta = sqliteTable('sync_meta', {
  userId: text('user_id').primaryKey(),
  lastSyncAt: integer('last_sync_at').notNull(),
  syncVersion: integer('sync_version').notNull().default(1),
  deviceId: text('device_id').notNull(),
  pendingChanges: integer('pending_changes').default(0),
  lastServerHash: text('last_server_hash'),
})

// Achievements
export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  achievementId: text('achievement_id').notNull(),
  unlockedAt: integer('unlocked_at').notNull(),
  metadata: text('metadata').default('{}'),
})

// Study Plans
export const studyPlans = sqliteTable('study_plans', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  planType: text('plan_type').notNull(),
  targetCount: integer('target_count').default(50),
  reminderTimes: text('reminder_times').default('[]'),
  enabled: integer('enabled').default(1),
  createdAt: integer('created_at').notNull(),
})

// Stats Daily
export const statsDaily = sqliteTable('stats_daily', {
  userId: text('user_id').notNull(),
  date: text('date').notNull(),
  newWords: integer('new_words').default(0),
  reviewedWords: integer('reviewed_words').default(0),
  masteredWords: integer('mastered_words').default(0),
  avgRecallProb: real('avg_recall_prob').default(0),
  studyDurationMinutes: integer('study_duration_minutes').default(0),
})

// User Sessions
export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  deviceId: text('device_id').notNull(),
  deviceName: text('device_name'),
  lastActiveAt: integer('last_active_at').notNull(),
  createdAt: integer('created_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
})
