#include "http_server.hpp"

#include <httplib.h>

#include <nlohmann/json.hpp>

using json = nlohmann::json;

HttpServer::HttpServer(GameService& service) : service_(service) {}

void HttpServer::Run(int port) {
  httplib::Server server;

  server.Post("/game/start",
              [&](const httplib::Request& req, httplib::Response& res) {
                try {
                  auto body = json::parse(req.body);

                  if (!body.contains("user_id") || body["user_id"].is_null() ||
                      !body["user_id"].is_number_integer()) {
                    res.status = 400;
                    res.set_content(R"({"error":"user_id is required"})",
                                    "application/json");
                    return;
                  }

                  if (!body.contains("lives") || body["lives"].is_null() ||
                      !body["lives"].is_number_integer()) {
                    res.status = 400;
                    res.set_content(R"({"error":"lives is required"})",
                                    "application/json");
                    return;
                  }

                  int user_id = body["user_id"].get<int>();
                  int lives = body["lives"].get<int>();

                  auto response = service_.StartGame(user_id, lives);

                  res.set_content(response.dump(), "application/json");
                } catch (const std::exception& e) {
                  std::cerr << "[ERROR] " << e.what() << std::endl;
                  res.status = 500;
                  res.set_content("internal error", "text/plain");
                }
              });

  server.Post("/game/move",
              [&](const httplib::Request& req, httplib::Response& res) {
                try {
                  auto body = json::parse(req.body);

                  if (!body.contains("user_id") || body["user_id"].is_null() ||
                      !body["user_id"].is_number_integer()) {
                    res.status = 400;
                    res.set_content(R"({"error":"user_id is required"})",
                                    "application/json");
                    return;
                  }

                  if (!body.contains("move") || body["move"].is_null() ||
                      !body["move"].is_string()) {
                    res.status = 400;
                    res.set_content(R"({"error":"move is required"})",
                                    "application/json");
                    return;
                  }

                  int user_id = body["user_id"].get<int>();
                  std::string move = body["move"].get<std::string>();

                  auto response = service_.MakeMove(user_id, move);

                  res.set_content(response.dump(), "application/json");
                } catch (const std::exception& e) {
                  std::cerr << "[ERROR] " << e.what() << std::endl;
                  res.status = 500;
                  res.set_content("internal error", "text/plain");
                }
              });

  std::cout << "[HTTP] server started on port " << port << std::endl;
  server.listen("0.0.0.0", port);
}
