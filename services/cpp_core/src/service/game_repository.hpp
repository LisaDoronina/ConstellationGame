#pragma once

#include <optional>
#include <pqxx/pqxx>

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
  GameRepository(const std::string& conn_str);

  std::optional<GameRecord> GetLastActiveGame(int user_id);

  int CreateGame(int user_id, const GameState& state);

  void UpdateGame(int game_id, const GameState& state);

  void FinishGame(int game_id, const GameState& state,
                  const std::string& winner);

 private:
  pqxx::connection conn_;
};