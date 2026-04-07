#include "game_repository.hpp"

std::optional<GameRecord> GameRepository::GetLastActiveGame(int user_id) {
  for (auto it = order_.rbegin(); it != order_.rend(); ++it) {
    int id = *it;
    const auto& game = games_[id];

    if (game.user_id == user_id && !game.is_finished) {
      return game;
    }
  }

  return std::nullopt;
}

int GameRepository::CreateGame(int user_id, const GameState& state) {
  int id = next_id_++;

  games_[id] = GameRecord{id, user_id, state, false, ""};

  order_.push_back(id);

  return id;
}

void GameRepository::UpdateGame(int game_id, const GameState& state) {
  auto it = games_.find(game_id);
  if (it != games_.end()) {
    it->second.state = state;
  }
}

void GameRepository::FinishGame(int game_id, const GameState& state,
                                const std::string& winner) {
  auto it = games_.find(game_id);
  if (it != games_.end()) {
    it->second.state = state;
    it->second.is_finished = true;
    it->second.winner = winner;
  }
}