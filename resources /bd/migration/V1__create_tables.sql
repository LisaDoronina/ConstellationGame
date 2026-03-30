CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS games (
    id BIGSERIAL PRIMARY KEY,
    game_path TEXT,
    game_result TEXT
);

CREATE TABLE user_games (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    game_id BIGINT ON DELETE CASCADE,
    PRIMARY KEY (user_id, game_id)
);