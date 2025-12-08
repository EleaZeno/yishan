DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

DROP TABLE IF EXISTS words;
CREATE TABLE words (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data TEXT NOT NULL, -- Stores the JSON string of the word object
  due_date INTEGER NOT NULL,
  is_deleted INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_words_user ON words(user_id);
CREATE INDEX idx_words_due ON words(due_date);
CREATE INDEX idx_users_email ON users(email);
