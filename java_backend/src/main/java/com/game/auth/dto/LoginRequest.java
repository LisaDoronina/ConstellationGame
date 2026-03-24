package com.game.auth.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

  @NotBlank(message = "Username or email is required")
  private String usernameOrEmail;

  @NotBlank(message = "Password is required")
  private String password;
}