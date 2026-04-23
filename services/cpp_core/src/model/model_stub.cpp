#include "model_stub.hpp"

#include <iostream>
#include <nlohmann/json.hpp>

#include "../api/httplib.h"

using json = nlohmann::json;

std::string ModelService::GetMove(const std::string& cur,
                                  const std::string& end,
                                  const std::vector<std::string>& path,
                                  const std::vector<std::string>& moves) {
  std::cout << "[ModelService] request\n";
  std::cout << "cur=" << cur << " end=" << end << std::endl;

  httplib::Client cli("localhost", 8000);

  json body;
  body["cur_state"] = cur;
  body["end_state"] = end;
  body["path"] = path;
  body["available_moves"] = moves;

  std::cout << "[ModelService] body=" << body.dump() << std::endl;

  auto res = cli.Post("/get_answer", body.dump(), "application/json");

  if (!res) {
    std::cout << "[ModelService] ERROR: no response\n";
    return "";
  }

  std::cout << "[ModelService] status=" << res->status << std::endl;
  std::cout << "[ModelService] raw response=" << res->body << std::endl;

  if (res->status != 200) return "";

  auto response = json::parse(res->body);

  std::string answer = response["answer"];

  if (answer.empty()) {
    std::cout << "[ModelService] empty answer\n";
    return "";
  }

  std::cout << "[ModelService] answer=" << answer << std::endl;
  std::cout << "[ModelService] EXPECT CODE LIKE Dor, GOT=" << answer
            << std::endl;

  return answer;
}