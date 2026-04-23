package com.game.auth.controller;

import com.game.auth.dto.GameInfoDTO;
import com.game.auth.entity.User;
import com.game.auth.service.AuthenticationService;
import com.game.auth.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class GameController {

  private final GameService gameService;
  private final AuthenticationService authService;

  public GameController(GameService gameService, AuthenticationService authService) {
    this.gameService = gameService;
    this.authService = authService;
  }

  @GetMapping("/recent")
  public ResponseEntity<?> getRecentGames(@RequestHeader("Authorization") String authHeader) {
    try {
      User user = authService.getCurrentUser(authHeader);
      List<GameInfoDTO> games = gameService.getRecentGames(user.getId(), 10);

      Map<String, Object> response = new HashMap<>();
      response.put("games", games);
      response.put("count", games.size());

      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      Map<String, String> error = new HashMap<>();
      error.put("error", e.getMessage());
      return ResponseEntity.status(401).body(error);
    }
  }

  @PostMapping("/abort")
  public ResponseEntity<?> abortGame(@RequestHeader("Authorization") String authHeader) {
    try {
      User user = authService.getCurrentUser(authHeader);
      boolean aborted = gameService.abortActiveGame(user.getId());

      Map<String, Object> response = new HashMap<>();
      response.put("aborted", aborted);
      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      Map<String, String> error = new HashMap<>();
      error.put("error", e.getMessage());
      return ResponseEntity.status(401).body(error);
    }
  }

  @GetMapping
  public ResponseEntity<?> getAllGames(
          @RequestHeader("Authorization") String authHeader,
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "10") int size) {
    try {
      User user = authService.getCurrentUser(authHeader);
      List<GameInfoDTO> games = gameService.getUserGamesPaginated(user.getId(), page, size);

      Map<String, Object> response = new HashMap<>();
      response.put("games", games);
      response.put("page", page);
      response.put("size", size);
      response.put("count", games.size());

      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      Map<String, String> error = new HashMap<>();
      error.put("error", e.getMessage());
      return ResponseEntity.status(401).body(error);
    }
  }
}