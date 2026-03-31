#include "http_server.hpp"

#include <httplib.h>

#include <iostream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

HttpServer::HttpServer(GameEngine& engine) : engine_(engine) {}

void HttpServer::Run(int port) {
  httplib::Server server;

  server.Post("/game/start",
              [&](const httplib::Request& req, httplib::Response& res) {
                std::cout << "[HTTP] /game/start called\n";

                auto body = json::parse(req.body);

                int lives = body["lives"];

                std::cout << "[HTTP] lives=" << lives << std::endl;

                engine_.InitGame(lives);

                auto response = engine_.GetStateJson();

                std::cout << "[HTTP] response=" << response.dump() << std::endl;

                res.set_content(response.dump(), "application/json");
              });

  server.Post("/game/move",
              [&](const httplib::Request& req, httplib::Response& res) {
                std::cout << "[HTTP] /game/move called\n";

                auto body = json::parse(req.body);

                std::string move = body["move"];

                std::cout << "[HTTP] move=" << move << std::endl;

                engine_.ProcessPlayerMove(move);
                engine_.ProcessModelMove();

                auto response = engine_.GetStateJson();

                std::cout << "[HTTP] response=" << response.dump() << std::endl;

                res.set_content(response.dump(), "application/json");
              });

  std::cout << "[HTTP] server started on port " << port << std::endl;

  server.listen("0.0.0.0", port);
}