#pragma once

#include <string>
#include <unordered_map>
#include <vector>

class ConstellationGraph {
 public:
  void LoadFromJson(const std::string& path);
  void LoadNames(const std::string& path);

  int GetId(const std::string& short_name) const;
  int GetIdFromFull(const std::string& full_name) const;

  std::string GetShortName(int id) const;
  std::string GetFullName(int id) const;

  std::vector<int> GetNeighbors(int id) const;
  bool AreNeighbors(int a, int b) const;

  int GetRandomNode() const;

 private:
  std::vector<std::vector<int>> adj_;

  std::vector<std::string> short_names_;
  std::vector<std::string> full_names_;

  std::unordered_map<std::string, int> short_to_id_;
};