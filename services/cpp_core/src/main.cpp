#include "api/http_server.hpp"
#include "engine/game_engine.hpp"
#include "graph/constellation_graph.hpp"

int main() {
  ConstellationGraph graph;

  graph.LoadFromJson("data/constellations_graph.json");
  graph.LoadNames("data/names.json");

  GameEngine engine(graph);
  HttpServer server(engine);

  server.Run(8080);

  return 0;
}