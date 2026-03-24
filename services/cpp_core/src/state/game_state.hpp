#pragma once

#include <unordered_set>
#include <vector>

struct GameState {
  int start;
  int finish;

  int current_pos;

  int player_lives;
  int model_lives;

  std::vector<int> path;
  std::unordered_set<int> visited;

  bool player_turn = true;
  bool game_over = false;
};