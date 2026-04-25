package com.game.auth.dto;

import jakarta.validation.constraints.*;

public class RegisterRequest {

  @NotBlank(message = "Username is required")
  @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
  @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Username can only contain Latin letters (A-Z), numbers, dots, underscores and hyphens")
  private String username;

  @NotBlank(message = "Password is required")
  @Size(min = 6, message = "Password must be at least 6 characters")
  private String password;

  @NotBlank(message = "Confirm password is required")
  private String confirmPassword;

  public RegisterRequest() {}

  public RegisterRequest(String username, String password, String confirmPassword) {
    this.username = username;
    this.password = password;
    this.confirmPassword = confirmPassword;
  }

  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }

  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }

  public String getConfirmPassword() { return confirmPassword; }
  public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}
