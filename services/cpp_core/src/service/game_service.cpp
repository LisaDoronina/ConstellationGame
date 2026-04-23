#include "game_service.hpp"

GameService::GameService(GameRepository& repo, ConstellationGraph& graph)
    : repo_(repo), graph_(graph) {}

// Determine the winner based on game state:
// - Reached finish: the last player who moved wins
// - Lives depleted: the player whose lives ran out loses
// - Deadlock (no moves available): the player whose turn it is loses
static std::string DetermineWinner(const GameState& state) {
  // Reached the finish constellation
  if (state.current_pos == state.finish) {
    // The last move brought us to finish; player_turn was flipped after the move
    // If player_turn == false, player just moved and reached finish -> player wins
    // If player_turn == true, model just moved and reached finish -> model wins
    return state.player_turn ? "model" : "player";
  }

  // Lives ran out
  if (state.player_lives <= 0) return "model";
  if (state.model_lives <= 0) return "player";

  // Deadlock: whoever's turn it is cannot move -> they lose
  // player_turn == true means player must move but can't -> model wins
  // player_turn == false means model must move but can't -> player wins
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
