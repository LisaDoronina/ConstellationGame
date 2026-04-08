#include "constellation_graph.hpp"

#include <fstream>
#include <nlohmann/json.hpp>
#include <random>

using json = nlohmann::json;

void ConstellationGraph::LoadFromJson(const std::string& path) {
  std::ifstream file(path);
  json j;
  file >> j;

  int id = 0;

  for (auto& [name, _] : j.items()) {
    short_to_id_[name] = id++;
    short_names_.push_back(name);
  }

  adj_.resize(short_names_.size());

  for (auto& [name, neighbors] : j.items()) {
    int from = short_to_id_[name];

    for (auto& n : neighbors) {
      adj_[from].push_back(short_to_id_[n]);
    }
  }
}

void ConstellationGraph::LoadNames(const std::string& path) {
  std::ifstream file(path);
  json j;
  file >> j;

  full_names_.resize(short_names_.size());

  for (auto& [short_name, full_name] : j.items()) {
    auto it = short_to_id_.find(short_name);
    if (it == short_to_id_.end()) continue;

    int id = it->second;
    full_names_[id] = full_name;
  }
  for (int i = 0; i < full_names_.size(); ++i) {
    if (full_names_[i].empty()) {
      full_names_[i] = short_names_[i];
    }
  }
}

int ConstellationGraph::GetId(const std::string& short_name) const {
  auto it = short_to_id_.find(short_name);
  return it == short_to_id_.end() ? -1 : it->second;
}

int ConstellationGraph::GetIdFromFull(const std::string& full_name) const {
  for (int i = 0; i < full_names_.size(); ++i) {
    if (full_names_[i] == full_name) return i;
  }
  return -1;
}

std::string ConstellationGraph::GetShortName(int id) const {
  return short_names_[id];
}

std::string ConstellationGraph::GetFullName(int id) const {
  return full_names_[id];
}

std::vector<int> ConstellationGraph::GetNeighbors(int id) const {
  return adj_[id];
}

bool ConstellationGraph::AreNeighbors(int a, int b) const {
  for (int x : adj_[a]) {
    if (x == b) return true;
  }
  return false;
}

int ConstellationGraph::GetRandomNode() const {
  static std::mt19937 gen(std::random_device{}());
  std::uniform_int_distribution<> dist(0, adj_.size() - 1);
  return dist(gen);
}