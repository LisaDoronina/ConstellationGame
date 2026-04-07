#include "game_service.hpp"

GameService::GameService(GameRepository& repo, ConstellationGraph& graph)
    : repo_(repo), graph_(graph) {}

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
  engine.ProcessModelMove();

  auto state = engine.GetState();

  if (state.game_over) {
    std::string winner = state.player_lives > 0 ? "player" : "model";
    repo_.FinishGame(record.game_id, state, winner);
  } else {
    repo_.UpdateGame(record.game_id, state);
  }

  return engine.GetStateJson();
}