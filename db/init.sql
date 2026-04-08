CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT
);

CREATE TABLE IF NOT EXISTS games (
  id BIGSERIAL PRIMARY KEY,
  userid BIGINT REFERENCES users(id) ON DELETE CASCADE,

  path TEXT,
  winner TEXT,
  finished BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_games_userid
ON games(userid);