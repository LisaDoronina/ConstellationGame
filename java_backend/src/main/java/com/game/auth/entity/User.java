package com.game.auth.entity;

import java.util.ArrayList;
import java.util.List;

public class User {

  private Long id;

  private String username;

  private String passwordHash;

  private List<Long> gameIds = new ArrayList<>();

  public User(String username, String passwordHash) {
    this.username = username;
    this.passwordHash = passwordHash;
    this.gameIds = new ArrayList<>();
  }

  public User() {}

  public void addGame(Long gameId) {
    if (gameIds == null) gameIds = new ArrayList<>();
    if (!gameIds.contains(gameId)) gameIds.add(gameId);
  }

  public void removeGame(Long gameId) {
    if (gameIds != null) gameIds.remove(gameId);
  }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }

  public String getPasswordHash() { return passwordHash; }
  public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

  public List<Long> getGameIds() { return gameIds; }
  public void setGameIds(List<Long> gameIds) { this.gameIds = gameIds; }
}