#pragma once

#include <string>
#include <vector>

class ModelService {
 public:
  std::string GetMove(const std::string& cur, const std::string& end,
                      const std::vector<std::string>& path,
                      const std::vector<std::string>& moves);
};