#include "model_stub.hpp"

#include <nlohmann/json.hpp>

#include "../api/httplib.h"

using json = nlohmann::json;

std::string ModelService::GetMove(const std::string& cur,
                                  const std::string& end,
                                  const std::vector<std::string>& path,
                                  const std::vector<std::string>& moves) {
  httplib::Client cli("localhost", 8000);

  json body;
  body["cur_state"] = cur;
  body["end_state"] = end;
  body["path"] = path;
  body["available_moves"] = moves;

  auto res = cli.Post("/get_answer", body.dump(), "application/json");

  if (!res || res->status != 200) {
    return "";
  }

  auto response = json::parse(res->body);
  return response["answer"];
}