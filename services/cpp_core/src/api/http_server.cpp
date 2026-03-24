#include "http_server.hpp"

#include <httplib.h>

#include <nlohmann/json.hpp>

using json = nlohmann::json;

HttpServer::HttpServer(GameEngine& engine) : engine_(engine) {}

void HttpServer::Run(int port) {
  httplib::Server server;

  server.Post(
      "/game/start", [&](const httplib::Request& req, httplib::Response& res) {
        auto body = json::parse(req.body);

        int lives = body["lives"];

        engine_.InitGame(lives);

        res.set_content(engine_.GetStateJson().dump(), "application/json");
      });

  server.Post(
      "/game/move", [&](const httplib::Request& req, httplib::Response& res) {
        auto body = json::parse(req.body);

        std::string move = body["move"];

        engine_.ProcessPlayerMove(move);
        engine_.ProcessModelMove();

        res.set_content(engine_.GetStateJson().dump(), "application/json");
      });

  server.listen("0.0.0.0", port);
}