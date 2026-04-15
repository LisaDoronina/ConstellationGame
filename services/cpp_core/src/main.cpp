#include <cstdlib>
#include <iostream>

#include "api/http_server.hpp"
#include "engine/game_engine.hpp"
#include "graph/constellation_graph.hpp"

int main() {
  ConstellationGraph graph;

  graph.LoadFromJson("data/constellations_graph.json");
  graph.LoadNames("data/names.json");

  const std::string DB_CONN =
    "dbname=mydatabase user=myuser password=mypassword host=localhost port=5433";
  const std::string conn_env = DB_CONN;

std::string conn =
    "host=127.0.0.1 port=5433 dbname=mydatabase user=myuser password=mypassword";
  GameRepository repo(conn);
  GameService service(repo, graph);
  HttpServer server(service);

  server.Run(8080);

  return 0;
}