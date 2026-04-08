#pragma once

#include "service/game_service.hpp"

class HttpServer {
 public:
  HttpServer(GameService& service);

  void Run(int port);

 private:
  GameService& service_;
};