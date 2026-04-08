#include "state_serializer.hpp"

json SerializeState(const GameState& state) {
  json j;

  j["start"] = state.start;
  j["finish"] = state.finish;
  j["current_pos"] = state.current_pos;

  j["player_lives"] = state.player_lives;
  j["model_lives"] = state.model_lives;

  j["player_turn"] = state.player_turn;
  j["game_over"] = state.game_over;

  j["visited"] = std::vector<int>(state.visited.begin(), state.visited.end());
  j["path"] = state.path;

  return j;
}

GameState DeserializeState(const json& j) {
  GameState state;

  state.start = j["start"];
  state.finish = j["finish"];
  state.current_pos = j["current_pos"];

  state.player_lives = j["player_lives"];
  state.model_lives = j["model_lives"];

  state.player_turn = j["player_turn"];
  state.game_over = j["game_over"];

  state.visited =
      std::unordered_set<int>(j["visited"].begin(), j["visited"].end());

  state.path = j["path"].get<std::vector<int>>();

  return state;
}