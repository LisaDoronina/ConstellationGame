#include "game_engine.hpp"

#include <algorithm>
#include <iostream>

using json = nlohmann::json;

static std::string NormalizeMove(const std::string& input) {
  std::string result = input;

  std::transform(result.begin(), result.end(), result.begin(),
                 [](unsigned char c) { return std::tolower(c); });
  return result;
}

GameEngine::GameEngine(ConstellationGraph& graph) : graph_(graph) {}

void GameEngine::InitGame(int lives) {
  std::cout << "[InitGame] lives=" << lives << std::endl;

  state_ = {};

  state_.player_lives = lives;
  state_.model_lives = lives;

  state_.start = graph_.GetRandomNode();

  do {
    state_.finish = graph_.GetRandomNode();
  } while (state_.finish == state_.start ||
           graph_.AreNeighbors(state_.start, state_.finish));

  std::cout << "[InitGame] start=" << graph_.GetFullName(state_.start)
            << " finish=" << graph_.GetFullName(state_.finish) << std::endl;

  state_.current_pos = state_.start;

  state_.visited.insert(state_.start);
  state_.path.push_back(state_.start);

  state_.player_turn = true;
  state_.game_over = false;
}

void GameEngine::ProcessPlayerMove(const std::string& input) {
  std::cout << "[PlayerMove] raw input=" << input << std::endl;

  if (!state_.player_turn || state_.game_over) {
    std::cout << "[PlayerMove] ignored (not player turn or game over)\n";
    return;
  }

  std::string normalized = NormalizeMove(input);
  if (!normalized.empty()) normalized[0] = std::toupper(normalized[0]);

  std::cout << "[PlayerMove] normalized=" << normalized << std::endl;

  int move = graph_.GetIdFromFull(normalized);

  if (move == -1) {
    std::cout << "[PlayerMove] unknown constellation -> penalty\n";
    state_.player_lives--;
    CheckGameOver();
    return;
  }

  if (!ValidateMove(state_.current_pos, move)) {
    std::cout << "[PlayerMove] not a neighbor\n";
    state_.player_lives--;
    CheckGameOver();
    return;
  }

  if (state_.visited.count(move)) {
    std::cout << "[PlayerMove] already visited -> penalty\n";
    state_.player_lives--;
  } else {
    std::cout << "[PlayerMove] valid move\n";
    ApplyMove(move);
    state_.player_turn = false;
  }

  CheckGameOver();
}

void GameEngine::ProcessModelMove() {
  int cur = state_.current_pos;
  int end = state_.finish;

  std::cout << "[ModelMove] cur=" << graph_.GetFullName(cur)
            << " end=" << graph_.GetFullName(end) << std::endl;

  auto neighbors = graph_.GetNeighbors(cur);

  std::vector<std::string> moves;
  for (int v : neighbors) {
    moves.push_back(graph_.GetShortName(v));
  }

  std::vector<std::string> path;
  for (int v : state_.path) {
    path.push_back(graph_.GetShortName(v));
  }

  std::string answer = model_.GetMove(graph_.GetShortName(cur),
                                      graph_.GetShortName(end), path, moves);

  std::cout << "[ModelMove] raw answer=" << answer << std::endl;

  int move = graph_.GetId(answer);

  if (move == -1) {
    std::cout << "[ModelMove] invalid code -> penalty\n";
    state_.model_lives--;
    state_.player_turn = true;
    CheckGameOver();
    return;
  }

  if (!ValidateMove(state_.current_pos, move)) {
    std::cout << "[ModelMove] not a neighbor\n";
    state_.model_lives--;
    state_.player_turn = true;
    CheckGameOver();
    return;
  }

  if (state_.visited.count(move)) {
    std::cout << "[ModelMove] already visited -> penalty\n";
    state_.model_lives--;
    state_.player_turn = true;
  } else {
    std::cout << "[ModelMove] valid move\n";
    ApplyMove(move);
    state_.player_turn = true;
  }

  CheckGameOver();
}

bool GameEngine::ValidateMove(int from, int to) const {
  if (to < 0) return false;
  return graph_.AreNeighbors(from, to);
}

void GameEngine::ApplyMove(int move) {
  std::cout << "[ApplyMove] move=" << graph_.GetFullName(move) << std::endl;

  state_.current_pos = move;
  state_.path.push_back(move);
  state_.visited.insert(move);
}

void GameEngine::CheckGameOver() {
  if (state_.current_pos == state_.finish) {
    std::cout << "[GameOver] reached finish\n";
    state_.game_over = true;
    return;
  }

  if (state_.player_lives <= 0 || state_.model_lives <= 0) {
    std::cout << "[GameOver] lives ended\n";
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
    std::cout << "[GameOver] deadlock\n";
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

  std::vector<std::string> neighbors;
  for (int id : graph_.GetNeighbors(state_.current_pos)) {
    neighbors.push_back(graph_.GetShortName(id));
  }

  j["neighbors"] = neighbors;

  return j;
}

void GameEngine::LoadState(const GameState& state) { state_ = state; }

GameState GameEngine::GetState() const { return state_; }
