#include "game_engine.hpp"

#include <algorithm>

using json = nlohmann::json;

GameEngine::GameEngine(ConstellationGraph graph) : graph_(graph) {}

void GameEngine::InitGame(int lives) {
  state_ = {};

  state_.player_lives = lives;
  state_.model_lives = lives;

  state_.start = graph_.GetRandomNode();

  do {
    state_.finish = graph_.GetRandomNode();
  } while (state_.finish == state_.start ||
           graph_.AreNeighbors(state_.start, state_.finish));

  state_.current_pos = state_.start;

  state_.visited.insert(state_.start);
  state_.path.push_back(state_.start);

  state_.player_turn = true;
  state_.game_over = false;
}

void GameEngine::ProcessPlayerMove(const std::string& input) {
  if (!state_.player_turn || state_.game_over) return;

  int move = graph_.GetIdFromFull(input);

  if (move == -1) return;

  if (!ValidateMove(state_.current_pos, move)) return;

  if (state_.visited.count(move)) {
    state_.player_lives--;
  } else {
    ApplyMove(move);
  }

  state_.player_turn = false;

  CheckGameOver();
}

void GameEngine::ProcessModelMove() {
  if (state_.player_turn || state_.game_over) return;

  auto neighbor_ids = graph_.GetNeighbors(state_.current_pos);

  std::vector<std::string> moves;
  for (int id : neighbor_ids) moves.push_back(graph_.GetShortName(id));

  std::vector<std::string> path;
  for (int id : state_.path) path.push_back(graph_.GetShortName(id));

  std::string cur = graph_.GetShortName(state_.current_pos);
  std::string end = graph_.GetShortName(state_.finish);

  std::string answer = model_.GetMove(cur, end, path, moves);

  answer.erase(remove_if(answer.begin(), answer.end(), isspace), answer.end());

  int move = graph_.GetId(answer);

  if (move == -1 || !ValidateMove(state_.current_pos, move)) {
    state_.model_lives--;
  } else if (state_.visited.count(move)) {
    state_.model_lives--;
  } else {
    ApplyMove(move);
  }

  state_.player_turn = true;

  CheckGameOver();
}

bool GameEngine::ValidateMove(int from, int to) const {
  if (to < 0) return false;
  return graph_.AreNeighbors(from, to);
}

void GameEngine::ApplyMove(int move) {
  state_.current_pos = move;
  state_.path.push_back(move);
  state_.visited.insert(move);
}

void GameEngine::CheckGameOver() {
  if (state_.current_pos == state_.finish) {
    state_.game_over = true;
    return;
  }

  if (state_.player_lives <= 0 || state_.model_lives <= 0) {
    state_.game_over = true;
    return;
  }

  auto neighbors = graph_.GetNeighbors(state_.current_pos);

  bool has_new_move = false;

  for (int n : neighbors) {
    if (!state_.visited.count(n)) {
      has_new_move = true;
      break;
    }
  }

  if (!has_new_move) {
    state_.game_over = true;
  }
}

json GameEngine::GetStateJson() const {
  json j;

  j["start"] = graph_.GetFullName(state_.start);
  j["finish"] = graph_.GetFullName(state_.finish);
  j["current"] = graph_.GetFullName(state_.current_pos);

  j["player_lives"] = state_.player_lives;
  j["model_lives"] = state_.model_lives;

  j["player_turn"] = state_.player_turn;
  j["game_over"] = state_.game_over;

  std::vector<std::string> path;
  for (int id : state_.path) path.push_back(graph_.GetShortName(id));

  j["path"] = path;

  if (state_.game_over) {
    if (state_.current_pos == state_.finish) {
      j["winner"] = "player";
    } else if (state_.player_lives <= 0) {
      j["winner"] = "model";
    } else if (state_.model_lives <= 0) {
      j["winner"] = "player";
    } else {
      if (state_.player_turn) {
        j["winner"] = "model";
      } else {
        j["winner"] = "player";
      }
    }
  }

  return j;
}