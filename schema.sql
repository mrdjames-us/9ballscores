CREATE TABLE IF NOT EXISTS books (
  code TEXT PRIMARY KEY,
  profiles TEXT NOT NULL DEFAULT '[]',
  history TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);
