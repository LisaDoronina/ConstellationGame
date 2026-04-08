INSERT INTO users (id, username, passwordHash)
VALUES 
  (1, 'test_user', 'test_hash')
ON CONFLICT (id) DO NOTHING;


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

--SELECT '=== USERS ===' as "";
--SELECT id, username FROM users;

--SELECT '=== GAMES ===' as "";
--SELECT userid, path, winner, finished FROM games ORDER BY userid;