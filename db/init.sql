CREATE TABLE IF NOT EXISTS users (
                                     id BIGSERIAL PRIMARY KEY,
                                     username TEXT NOT NULL UNIQUE,
                                     passwordHash TEXT NOT NULL,
                                     gameIds BIGINT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS games (
                                     id BIGSERIAL PRIMARY KEY,
                                     userId BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                     path TEXT,
                                     winner TEXT,
                                     finished BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_games_userId ON games(userId);
CREATE INDEX IF NOT EXISTS idx_users_gameIds ON users USING GIN(gameIds);