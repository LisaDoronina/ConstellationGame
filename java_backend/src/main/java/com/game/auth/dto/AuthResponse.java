package com.game.auth.dto;

import java.util.List;

public class AuthResponse {
  private String token;
  private String type;
  private Long id;
  private String username;

  public AuthResponse() {}

  public AuthResponse(String token, String type, Long id, String username) {
    this.token = token;
    this.type = type;
    this.id = id;
    this.username = username;
  }

  public String getToken() { return token; }
  public void setToken(String token) { this.token = token; }

  public String getType() { return type; }
  public void setType(String type) { this.type = type; }

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }

}