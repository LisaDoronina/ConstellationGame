#include "http_server.hpp"

#include <httplib.h>

#include <nlohmann/json.hpp>

using json = nlohmann::json;

HttpServer::HttpServer(GameService& service) : service_(service) {}

void HttpServer::Run(int port) {
  httplib::Server server;

  server.Post("/game/start",
              [&](const httplib::Request& req, httplib::Response& res) {
                auto body = json::parse(req.body);

                int user_id = body["user_id"];
                int lives = body["lives"];

                auto response = service_.StartGame(user_id, lives);

                res.set_content(response.dump(), "application/json");
              });

  server.Post("/game/move",
              [&](const httplib::Request& req, httplib::Response& res) {
                auto body = json::parse(req.body);

                int user_id = body["user_id"];
                std::string move = body["move"];

                auto response = service_.MakeMove(user_id, move);

                res.set_content(response.dump(), "application/json");
              });

  std::cout << "[HTTP] server started on port " << port << std::endl;
  server.listen("0.0.0.0", port);
}