package com.game.auth.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
  private String token;
  private String type;
  private Long id;
  private String username;
  private String email;
  private String role;
  private List<Long> gameIds;
}