-- 初始化数据库结构

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS words;

-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- 单词表
-- data 字段存储单词的完整 JSON 对象 (包含 definition, tags, sm2算法数据等)
CREATE TABLE words (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data TEXT NOT NULL,
  due_date INTEGER NOT NULL,
  is_deleted INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

-- 索引优化
CREATE INDEX idx_words_user_due ON words(user_id, due_date);
CREATE INDEX idx_users_email ON users(email);