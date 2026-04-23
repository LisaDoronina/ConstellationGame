#include "game_service.hpp"

GameService::GameService(GameRepository& repo, ConstellationGraph& graph)
    : repo_(repo), graph_(graph) {}

static std::string DetermineWinner(const GameState& state) {
  if (state.current_pos == state.finish) {
    return state.player_turn ? "model" : "player";
  }

  if (state.player_lives <= 0) return "model";
  if (state.model_lives <= 0) return "player";

  return state.player_turn ? "model" : "player";
}

json GameService::StartGame(int user_id, int lives) {
  auto existing = repo_.GetLastActiveGame(user_id);

  GameEngine engine(graph_);

  if (existing.has_value()) {
    engine.LoadState(existing->state);
    return engine.GetStateJson();
  }

  engine.InitGame(lives);

  int game_id = repo_.CreateGame(user_id, engine.GetState());

  auto response = engine.GetStateJson();
  response["game_id"] = game_id;

  return response;
}

json GameService::MakeMove(int user_id, const std::string& move) {
  auto record_opt = repo_.GetLastActiveGame(user_id);

  if (!record_opt.has_value()) {
    return json{{"error", "no active game"}};
  }

  auto record = record_opt.value();

  GameEngine engine(graph_);
  engine.LoadState(record.state);

  engine.ProcessPlayerMove(move);

  auto state = engine.GetState();

  if (state.game_over) {
    std::string winner = DetermineWinner(state);
    repo_.FinishGame(record.game_id, state, winner);
  } else {
    repo_.UpdateGame(record.game_id, state);
  }

  return engine.GetStateJson();
}

json GameService::MakeModelMove(int user_id) {
  auto record_opt = repo_.GetLastActiveGame(user_id);

  if (!record_opt.has_value()) {
    return json{{"error", "no active game"}};
  }

  auto record = record_opt.value();

  GameEngine engine(graph_);
  engine.LoadState(record.state);
  engine.ProcessModelMove();

  auto state = engine.GetState();

  if (state.game_over) {
    std::string winner = DetermineWinner(state);
    repo_.FinishGame(record.game_id, state, winner);
  } else {
    repo_.UpdateGame(record.game_id, state);
  }

  return engine.GetStateJson();
}
