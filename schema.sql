-- Users table to store authentication info
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Words table to store vocabulary data
-- We store the complex JSON structure in the 'data' column
DROP TABLE IF EXISTS words;
CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON string of the Word object
  due_date INTEGER,   -- Indexed for fast queries on due words
  created_at INTEGER,
  is_deleted INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_words_user ON words(user_id);
CREATE INDEX IF NOT EXISTS idx_words_due ON words(due_date);
