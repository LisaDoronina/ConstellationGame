INSERT INTO users (id, username, passwordHash)
VALUES 
  (1, 'test_user', 'test_hash');


INSERT INTO games (userid, path, winner, finished)
VALUES (
  1,
  '{
    "start": "Волк",
    "finish": "Цефей",
    "current": "Волк",
    "player_lives": 3,
    "model_lives": 3,
    "player_turn": true,
    "game_over": false,
    "path": ["Волк"],
    "visited": []
  }',
  NULL,
  false
)
ON CONFLICT DO NOTHING;

-- Игра 1: Незаконченная игра (в процессе)
INSERT INTO games (userid, path, winner, finished)
VALUES (
           1,
           '{
             "start": "Волк",
             "finish": "Цефей",
             "current": "Кассиопея",
             "player_lives": 2,
             "model_lives": 2,
             "player_turn": true,
             "game_over": false,
             "path": ["Волк", "Малая Медведица", "Кассиопея"],
             "visited": ["Волк", "Малая Медведица"]
           }',
           NULL,
           false
       );

-- Игра 2: Победил игрок
INSERT INTO games (userid, path, winner, finished)
VALUES (
           1,
           '{
             "start": "Орион",
             "finish": "Андромеда",
             "current": "Андромеда",
             "player_lives": 1,
             "model_lives": 0,
             "player_turn": false,
             "game_over": true,
             "path": ["Орион", "Большой Пёс", "Гончие Псы", "Андромеда"],
             "visited": ["Орион", "Большой Пёс", "Гончие Псы", "Андромеда"]
           }',
           'player',
           true
       );

-- Игра 3: Победила модель (компьютер)
INSERT INTO games (userid, path, winner, finished)
VALUES (
           1,
           '{
             "start": "Лира",
             "finish": "Геркулес",
             "current": "Лебедь",
             "player_lives": 0,
             "model_lives": 2,
             "player_turn": false,
             "game_over": true,
             "path": ["Лира", "Дракон", "Лебедь"],
             "visited": ["Лира", "Дракон"]
           }',
           'model',
           true
       );

-- Игра 4: Завершенная игра с победой игрока (альтернативный путь)
INSERT INTO games (userid, path, winner, finished)
VALUES (
           1,
           '{
             "start": "Большая Медведица",
             "finish": "Рак",
             "current": "Рак",
             "player_lives": 2,
             "model_lives": 0,
             "player_turn": false,
             "game_over": true,
             "path": ["Большая Медведица", "Лев", "Гидра", "Рак"],
             "visited": ["Большая Медведица", "Лев", "Гидра", "Рак"]
           }',
           'player',
           true
       );

-- Игра 5: Незаконченная игра, ход модели
INSERT INTO games (userid, path, winner, finished)
VALUES (
           1,
           '{
             "start": "Пегас",
             "finish": "Кит",
             "current": "Андромеда",
             "player_lives": 3,
             "model_lives": 1,
             "player_turn": false,
             "game_over": false,
             "path": ["Пегас", "Андромеда"],
             "visited": ["Пегас"]
           }',
           NULL,
           false
       );

-- Игра 6: Победа игрока с минимальными потерями
INSERT INTO games (userid, path, winner, finished)
VALUES (
           1,
           '{
             "start": "Скорпион",
             "finish": "Стрелец",
             "current": "Стрелец",
             "player_lives": 3,
             "model_lives": 3,
             "player_turn": false,
             "game_over": true,
             "path": ["Скорпион", "Стрелец"],
             "visited": ["Скорпион", "Стрелец"]
           }',
           'player',
           true
       );

-- Игра 7: Поражение модели (завершена)
INSERT INTO games (userid, path, winner, finished)
VALUES (
           1,
           '{
             "start": "Телец",
             "finish": "Близнецы",
             "current": "Близнецы",
             "player_lives": 1,
             "model_lives": 0,
             "player_turn": false,
             "game_over": true,
             "path": ["Телец", "Возничий", "Близнецы"],
             "visited": ["Телец", "Возничий", "Близнецы"]
           }',
           'player',
           true
       );

-- Проверить все игры пользователя 1
SELECT
    id as game_id,
    userid,
    winner,
    finished,
    path::json->>'start' as start_constellation,
    path::json->>'finish' as finish_constellation,
    path::json->>'player_lives' as player_lives,
    path::json->>'model_lives' as model_lives
FROM games
WHERE userid = 1
ORDER BY id DESC;

--SELECT '=== USERS ===' as "";
--SELECT id, username FROM users;

--SELECT '=== GAMES ===' as "";
--SELECT userid, path, winner, finished FROM games ORDER BY userid;