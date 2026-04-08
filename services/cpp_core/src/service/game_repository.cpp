#include "game_repository.hpp"

#include "service/state_serializer.hpp"

GameRepository::GameRepository(const std::string& conn_str) : conn_(conn_str) {}

std::optional<GameRecord> GameRepository::GetLastActiveGame(int user_id) {
  pqxx::work txn(conn_);

  pqxx::result r = txn.exec_params(
      "SELECT id, path, finished, winner "
      "FROM games "
      "WHERE userid = $1 AND finished = false "
      "ORDER BY id DESC LIMIT 1",
      user_id);

  if (r.empty()) return std::nullopt;

  GameRecord rec;
  rec.game_id = r[0]["id"].as<int>();
  rec.user_id = user_id;
  rec.is_finished = r[0]["finished"].as<bool>();
  rec.winner = r[0]["winner"].is_null() ? "" : r[0]["winner"].as<std::string>();

  auto json_state = nlohmann::json::parse(r[0]["path"].c_str());
  rec.state = DeserializeState(json_state);

  return rec;
}

int GameRepository::CreateGame(int user_id, const GameState& state) {
  pqxx::work txn(conn_);

  auto json_state = SerializeState(state);

  pqxx::result r = txn.exec_params(
      "INSERT INTO games (userid, path, finished) "
      "VALUES ($1, $2, false) RETURNING id",
      user_id, json_state.dump());

  txn.commit();

  return r[0]["id"].as<int>();
}

void GameRepository::UpdateGame(int game_id, const GameState& state) {
  pqxx::work txn(conn_);

  auto json_state = SerializeState(state);

  txn.exec_params("UPDATE games SET path = $1 WHERE id = $2", json_state.dump(),
                  game_id);

  txn.commit();
}

void GameRepository::FinishGame(int game_id, const GameState& state,
                                const std::string& winner) {
  pqxx::work txn(conn_);

  auto json_state = SerializeState(state);

  txn.exec_params(
      "UPDATE games "
      "SET path = $1, finished = true, winner = $2 "
      "WHERE id = $3",
      json_state.dump(), winner, game_id);

  txn.commit();
}