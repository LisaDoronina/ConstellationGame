#pragma once

#include <nlohmann/json.hpp>

#include "engine/game_engine.hpp"
#include "graph/constellation_graph.hpp"
#include "service/game_repository.hpp"

using json = nlohmann::json;

class GameService {
 public:
  GameService(GameRepository& repo, ConstellationGraph& graph);

  json StartGame(int user_id, int lives);
  json MakeMove(int user_id, const std::string& move);
  json MakeModelMove(int user_id);

 private:
  GameRepository& repo_;
  ConstellationGraph& graph_;
};
