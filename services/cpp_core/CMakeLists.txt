cmake_minimum_required(VERSION 3.16)

project(constellation_game)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(nlohmann_json REQUIRED)

add_executable(constellation_game
    src/main.cpp
    src/engine/game_engine.cpp
    src/graph/constellation_graph.cpp
    src/model/model_stub.cpp
    src/api/http_server.cpp
    src/service/game_service.cpp
    src/service/game_repository.cpp
    src/service/state_serializer.cpp
)

target_include_directories(constellation_game PRIVATE
    src
    src/api
)

target_link_libraries(constellation_game PRIVATE
    nlohmann_json::nlohmann_json
)

file(COPY data DESTINATION ${CMAKE_BINARY_DIR})
file(COPY ../../python_ml/resources/graph.py DESTINATION ${CMAKE_BINARY_DIR}/data)
