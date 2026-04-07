#pragma once

#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

#include "state/game_state.hpp"

struct GameRecord {
  int game_id;
  int user_id;
  GameState state;
  bool is_finished;
  std::string winner;
};

class GameRepository {
 public:
  std::optional<GameRecord> GetLastActiveGame(int user_id);

  int CreateGame(int user_id, const GameState& state);

  void UpdateGame(int game_id, const GameState& state);

  void FinishGame(int game_id, const GameState& state,
                  const std::string& winner);

 private:
  int next_id_ = 1;
  std::unordered_map<int, GameRecord> games_;
  std::vector<int> order_;
};