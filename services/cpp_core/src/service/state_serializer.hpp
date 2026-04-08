#pragma once

#include <nlohmann/json.hpp>

#include "state/game_state.hpp"

using json = nlohmann::json;

json SerializeState(const GameState& state);
GameState DeserializeState(const json& j);