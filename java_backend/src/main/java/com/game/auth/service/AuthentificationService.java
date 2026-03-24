package com.game.auth.service;

import com.game.auth.dto.*;
import com.game.auth.entity.User;
import com.game.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthentificationService {

  private final UserRepository userRepository;
  private final PasswordService passwordService;
  private final Map<String, String> tokenStore = new HashMap<>();

  public User register(RegisterRequest request) {

    if (!passwordService.isStrongPassword(request.getPassword())) {
      throw new RuntimeException("Password must be at least 8 characters and contain uppercase, lowercase, digit, and special character");
    }

    if (!request.getPassword().equals(request.getConfirmPassword())) {
      throw new RuntimeException("Passwords do not match");
    }

    if (userRepository.existsByUsername(request.getUsername())) {
      throw new RuntimeException("Username is already taken");
    }

    if (request.getEmail() != null && !request.getEmail().isEmpty() &&
            userRepository.existsByEmail(request.getEmail())) {
      throw new RuntimeException("Email is already registered");
    }

    String passwordHash = passwordService.hashPassword(request.getPassword());

    User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .passwordHash(passwordHash)
            .gameIds(new java.util.ArrayList<>())
            .build();

    User savedUser = userRepository.save(user);
    log.info("User registered successfully: {}", savedUser.getUsername());

    return savedUser;
  }

  public AuthResponse login(LoginRequest request) {
    Optional<User> userOptional = userRepository.getByUsernameOrEmail(request.getUsernameOrEmail());

    if (userOptional.isEmpty()) {
      log.warn("Login failed: User not found - {}", request.getUsernameOrEmail());
      throw new RuntimeException("Invalid username/email or password");
    }

    User user = userOptional.get();

    if (!passwordService.verifyPassword(request.getPassword(), user.getPasswordHash())) {
      log.warn("Login failed: Invalid password for user - {}", user.getUsername());
      throw new RuntimeException("Invalid username/email or password");
    }

    String token = generateToken(user);
    tokenStore.put(token, user.getUsername());

    log.info("User logged in successfully: {}", user.getUsername());

    return AuthResponse.builder()
            .token(token)
            .type("Bearer")
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .gameIds(user.getGameIds())
            .build();
  }

  public void logout(String token) {
    if (token != null && token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    String username = tokenStore.remove(token);
    if (username != null) {
      log.info("User logged out: {}", username);
    }
  }

  public User getCurrentUser(String token) {
    if (token != null && token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    String username = tokenStore.get(token);
    if (username == null) {
      throw new RuntimeException("Invalid or expired token");
    }

    return userRepository.getByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
  }

  public boolean validateToken(String token) {
    if (token != null && token.startsWith("Bearer ")) {
      token = token.substring(7);
    }
    return tokenStore.containsKey(token);
  }

  private String generateToken(User user) {
    return UUID.randomUUID().toString() + "-" + user.getId();
  }

  public void addGameToUser(Long userId, Long gameId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    user.addGame(gameId);
    userRepository.save(user);
    log.info("Game {} added to user {}", gameId, user.getUsername());
  }

  public void removeGameFromUser(Long userId, Long gameId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    user.removeGame(gameId);
    userRepository.save(user);
    log.info("Game {} removed from user {}", gameId, user.getUsername());
  }

  public List<Long> getUserGames(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return user.getGameIds();
  }
}