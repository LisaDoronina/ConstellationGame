INSERT INTO users (username, passwordHash, gameIds) VALUES
    ('lisalisa', 'hash_alice_123', '{}'),
    ('bob', 'hash_bob_456', '{}'),
    ('charlie', 'hash_charlie_789', '{}'),
    ('diana', 'hash_diana_123', ARRAY[7, 8, 9]),
    ('eve', 'hash_eve_456', ARRAY[10])
ON CONFLICT (username) DO NOTHING;


INSERT INTO games (userId, path, winner, finished) VALUES
   (1, 'path', 'model', TRUE),
   (1, 'path', NULL, FALSE),
   (1, 'path', 'user', TRUE),

   (2, 'path', 'model', FALSE),
   (2, 'path', 'user', TRUE),
   (2, 'path', NULL, FALSE),

   (3, 'path', 'user', TRUE),
   (3, 'path', NULL, FALSE),
   (3, 'path', NULL, FALSE)
ON CONFLICT DO NOTHING;

SELECT '=== USERS ===' as "";
SELECT id, username FROM users;

SELECT '=== GAMES ===' as "";
SELECT id, userId, path, winner, finished FROM games ORDER BY userId;