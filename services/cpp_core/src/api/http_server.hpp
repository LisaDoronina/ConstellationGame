#pragma once

#include "../engine/game_engine.hpp"

class HttpServer {
 public:
  HttpServer(GameEngine& engine);

  void Run(int port);

 private:
  GameEngine& engine_;
};