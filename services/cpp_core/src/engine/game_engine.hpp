#pragma once

#include <algorithm>
#include <nlohmann/json.hpp>
#include <string>

#include "../graph/constellation_graph.hpp"
#include "../model/model_stub.hpp"
#include "../state/game_state.hpp"

class GameEngine {
 public:
  GameEngine(ConstellationGraph& graph);

  void InitGame(int lives);
  void ProcessPlayerMove(const std::string& input);
  void ProcessModelMove();

  nlohmann::json GetStateJson() const;

  void LoadState(const GameState& state);
  GameState GetState() const;

 private:
  bool ValidateMove(int from, int to) const;
  void ApplyMove(int move);
  void CheckGameOver();

 private:
  ConstellationGraph& graph_;
  GameState state_;
  ModelService model_;
};