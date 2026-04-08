#include <cstdlib>
#include <iostream>

#include "api/http_server.hpp"
#include "engine/game_engine.hpp"
#include "graph/constellation_graph.hpp"

int main() {
  ConstellationGraph graph;

  graph.LoadFromJson("data/constellations_graph.json");
  graph.LoadNames("data/names.json");

  const char* conn_env = std::getenv("DB_CONN");

  if (!conn_env) {
    std::cerr << "DB_CONN not set\n";
    return 1;
  }

  std::string conn(conn_env);
  // std::cout << "DB_CONN=" << conn << std::endl;
  GameRepository repo(conn);
  GameService service(repo, graph);
  HttpServer server(service);

  server.Run(8080);

  return 0;
}