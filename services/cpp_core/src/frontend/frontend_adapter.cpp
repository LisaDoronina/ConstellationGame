// #include "frontend_adapter.hpp"

// #include <iostream>

// void FrontendAdapter::SendState(const GameState& state,
//                                 const ConstellationGraph& graph) {
//   std::cout << "Start: " << graph.GetName(state.start) << "\n";

//   std::cout << "Finish: " << graph.GetName(state.finish) << "\n";

//   std::cout << "Player current: " << graph.GetName(state.player_pos) << "\n";

//   std::cout << "Model current: " << graph.GetName(state.model_pos) << "\n";

//   std::cout << "Player lives: " << state.player_lives << "\n";

//   std::cout << "Model lives: " << state.model_lives << "\n";
// }

// void FrontendAdapter::SendResult(const GameState& state,
//                                  const ConstellationGraph& graph) {
//   std::cout << "\n===== GAME RESULT =====\n";

//   if (state.player_pos == state.finish)
//     std::cout << "Winner: Player\n";

//   else if (state.model_pos == state.finish)
//     std::cout << "Winner: Model\n";

//   else if (state.player_lives <= 0)
//     std::cout << "Winner: Model\n";

//   else if (state.model_lives <= 0)
//     std::cout << "Winner: Player\n";

//   else
//     std::cout << "Winner: Unknown\n";

//   std::cout << "\nPlayer path:\n";

//   for (int id : state.player_path) std::cout << graph.GetName(id) << " ";

//   std::cout << "\n\nModel path:\n";

//   for (int id : state.model_path) std::cout << graph.GetName(id) << " ";

//   std::cout << "\n=======================\n";
// }