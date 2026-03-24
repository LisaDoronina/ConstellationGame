package com.game.auth.controller;

import com.game.auth.dto.*;
import com.game.auth.entity.User;
import com.game.auth.service.AuthentificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthentificationService authService;

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
    try {
      User user = authService.register(request);

      Map<String, Object> response = new HashMap<>();
      response.put("message", "User registered successfully");
      response.put("username", user.getUsername());
      response.put("email", user.getEmail());
      response.put("id", user.getId());

      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      Map<String, String> error = new HashMap<>();
      error.put("error", e.getMessage());
      return ResponseEntity.badRequest().body(error);
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
    try {
      AuthResponse response = authService.login(request);
      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      Map<String, String> error = new HashMap<>();
      error.put("error", e.getMessage());
      return ResponseEntity.status(401).body(error);
    }
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
    try {
      authService.logout(authHeader);
      Map<String, String> response = new HashMap<>();
      response.put("message", "Logged out successfully");
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      Map<String, String> error = new HashMap<>();
      error.put("error", e.getMessage());
      return ResponseEntity.badRequest().body(error);
    }
  }

  @GetMapping("/me")
  public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
    try {
      User user = authService.getCurrentUser(authHeader);

      Map<String, Object> response = new HashMap<>();
      response.put("id", user.getId());
      response.put("username", user.getUsername());
      response.put("email", user.getEmail());
      response.put("gameIds", user.getGameIds());

      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      Map<String, String> error = new HashMap<>();
      error.put("error", e.getMessage());
      return ResponseEntity.status(401).body(error);
    }
  }

  @PostMapping("/games/{gameId}")
  public ResponseEntity<?> addGameToUser(
          @RequestHeader("Authorization") String authHeader,
          @PathVariable Long gameId) {
    try {
      User user = authService.getCurrentUser(authHeader);
      authService.addGameToUser(user.getId(), gameId);

      Map<String, Object> response = new HashMap<>();
      response.put("message", "Game added successfully");
      response.put("gameId", gameId);
      response.put("userGames", authService.getUserGames(user.getId()));

      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      Map<String, String> error = new HashMap<>();
      error.put("error", e.getMessage());
      return ResponseEntity.badRequest().body(error);
    }
  }

  @DeleteMapping("/games/{gameId}")
  public ResponseEntity<?> removeGameFromUser(
          @RequestHeader("Authorization") String authHeader,
          @PathVariable Long gameId) {
    try {
      User user = authService.getCurrentUser(authHeader);
      authService.removeGameFromUser(user.getId(), gameId);

      Map<String, Object> response = new HashMap<>();
      response.put("message", "Game removed successfully");
      response.put("gameId", gameId);
      response.put("userGames", authService.getUserGames(user.getId()));

      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      Map<String, String> error = new HashMap<>();
      error.put("error", e.getMessage());
      return ResponseEntity.badRequest().body(error);
    }
  }

  @GetMapping("/games")
  public ResponseEntity<?> getUserGames(@RequestHeader("Authorization") String authHeader) {
    try {
      User user = authService.getCurrentUser(authHeader);
      List<Long> games = authService.getUserGames(user.getId());

      Map<String, Object> response = new HashMap<>();
      response.put("userId", user.getId());
      response.put("username", user.getUsername());
      response.put("games", games);
      response.put("count", games.size());

      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      Map<String, String> error = new HashMap<>();
      error.put("error", e.getMessage());
      return ResponseEntity.status(401).body(error);
    }
  }
}