package com.game.auth.service;

import com.game.auth.dto.*;
import com.game.auth.entity.User;
import com.game.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthenticationService {

  private final UserRepository userRepository;
  private final PasswordService passwordService;
  private final Map<String, String> tokenStore = new HashMap<>();

  public AuthenticationService(UserRepository userRepository, PasswordService passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

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

    User user = new User();
    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPasswordHash(passwordHash);
    user.setGameIds(new ArrayList<>());

    User savedUser = userRepository.save(user);
    System.out.println("[AuthenticationService] User registered successfully: " + savedUser.getUsername());

    return savedUser;
  }

  public AuthResponse login(LoginRequest request) {
    Optional<User> userOptional = userRepository.getByUsernameOrEmail(request.getUsernameOrEmail());

    if (userOptional.isEmpty()) {
      System.out.println("[AuthenticationService] Login failed: User not found - " + request.getUsernameOrEmail());
      throw new RuntimeException("Invalid username/email or password");
    }

    User user = userOptional.get();

    if (!passwordService.verifyPassword(request.getPassword(), user.getPasswordHash())) {
      System.out.println("[AuthenticationService] Login failed: Invalid password for user - " + user.getUsername());
      throw new RuntimeException("Invalid username/email or password");
    }

    String token = UUID.randomUUID().toString();
    tokenStore.put(token, user.getUsername());

    System.out.println("[AuthenticationService] User logged in successfully: " + user.getUsername());

    AuthResponse response = new AuthResponse();
    response.setToken(token);
    response.setType("Bearer");
    response.setId(user.getId());
    response.setUsername(user.getUsername());
    response.setEmail(user.getEmail());
    response.setGameIds(user.getGameIds());

    return response;
  }

  public void logout(String token) {
    if (token != null && token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    String username = tokenStore.remove(token);
    if (username != null) {
      System.out.println("[AuthenticationService] User logged out: " + username);
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

  public void addGameToUser(Long userId, Long gameId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    user.addGame(gameId);
    userRepository.save(user);
    System.out.println("[AuthenticationService] Game " + gameId + " added to user " + user.getUsername());
  }

  public void removeGameFromUser(Long userId, Long gameId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    user.removeGame(gameId);
    userRepository.save(user);
    System.out.println("[AuthenticationService] Game " + gameId + " removed from user " + user.getUsername());
  }

  public List<Long> getUserGames(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return user.getGameIds();
  }
}