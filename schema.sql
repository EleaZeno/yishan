-- !!! 请将此文件重命名为 schema.sql !!!

DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  salt TEXT,
  created_at INTEGER
);

DROP TABLE IF EXISTS words;
CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data TEXT, -- Stores the full JSON structure of the Word object
  due_date INTEGER,
  created_at INTEGER,
  is_deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_words_user ON words(user_id);
CREATE INDEX IF NOT EXISTS idx_words_due ON words(due_date);
