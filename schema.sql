-- ============================================================
-- yishan D1 Database Schema v2.0
-- Cloudflare D1: Local-first sync backend
-- ============================================================

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    last_login_at INTEGER,
    settings TEXT DEFAULT '{}'  -- JSON: {language, theme, dailyGoal, reviewTime...}
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- Words (Memory Cards)
-- ============================================================
CREATE TABLE IF NOT EXISTS words (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    
    -- Content
    term TEXT NOT NULL,
    phonetic TEXT,
    definition TEXT NOT NULL,
    example_sentence TEXT,
    example_translation TEXT,
    
    -- Metadata
    content_type TEXT DEFAULT 'word' CHECK(content_type IN ('word', 'formula', 'knowledge', 'mistake', 'definition')),
    tags TEXT DEFAULT '[]',  -- JSON array
    notes TEXT,
    
    -- Bayesian memory model
    alpha REAL DEFAULT 1,
    beta REAL DEFAULT 1,
    halflife REAL DEFAULT 1440,  -- minutes
    
    -- State
    last_seen INTEGER,
    total_exposure INTEGER DEFAULT 0,
    due_date INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    
    -- Sync
    deleted_at INTEGER,  -- Soft delete for sync
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_words_user_id ON words(user_id);
CREATE INDEX IF NOT EXISTS idx_words_due_date ON words(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_words_content_type ON words(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON words(user_id, created_at);

-- ============================================================
-- Review Logs (for algorithm training & analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS review_logs (
    id TEXT PRIMARY KEY,
    word_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    
    -- Interaction metrics
    direction TEXT NOT NULL CHECK(direction IN ('left', 'right')),  -- left=mastered, right=review
    duration_ms INTEGER,
    is_flipped INTEGER DEFAULT 0,
    audio_played_count INTEGER DEFAULT 0,
    
    -- Computed values
    predicted_prob REAL,
    actual_prob REAL,
    
    -- Context
    review_time INTEGER NOT NULL DEFAULT (unixepoch()),
    client_timezone TEXT,
    device_type TEXT,
    
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_review_logs_word_id ON review_logs(word_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_user_id ON review_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_time ON review_logs(user_id, review_time);

-- ============================================================
-- Sync Metadata (for conflict resolution)
-- ============================================================
CREATE TABLE IF NOT EXISTS sync_meta (
    user_id TEXT PRIMARY KEY,
    last_sync_at INTEGER NOT NULL,
    sync_version INTEGER NOT NULL DEFAULT 1,
    device_id TEXT NOT NULL,
    pending_changes INTEGER DEFAULT 0,
    last_server_hash TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at INTEGER NOT NULL DEFAULT (unixepoch()),
    metadata TEXT DEFAULT '{}',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_achievements_user_achievement ON achievements(user_id, achievement_id);

-- ============================================================
-- Reminders / Study Plans
-- ============================================================
CREATE TABLE IF NOT EXISTS study_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK(plan_type IN ('daily', 'weekly', 'custom')),
    target_count INTEGER DEFAULT 50,
    reminder_times TEXT DEFAULT '[]',  -- JSON array: ["07:00", "21:00"]
    enabled INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Statistics Snapshot (for charts, daily aggregation)
-- ============================================================
CREATE TABLE IF NOT EXISTS stats_daily (
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,  -- YYYY-MM-DD
    new_words INTEGER DEFAULT 0,
    reviewed_words INTEGER DEFAULT 0,
    mastered_words INTEGER DEFAULT 0,
    avg_recall_prob REAL DEFAULT 0,
    study_duration_minutes INTEGER DEFAULT 0,
    
    PRIMARY KEY (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stats_daily_user_date ON stats_daily(user_id, date DESC);

-- ============================================================
-- User Sessions (for multi-device detection)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    device_name TEXT,
    last_active_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    expires_at INTEGER NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
