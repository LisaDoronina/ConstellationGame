package com.game.auth.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String username;

  @Column(unique = true)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @ElementCollection
  @CollectionTable(name = "user_games", joinColumns = @JoinColumn(name = "user_id"))
  @Column(name = "game_id")
  private List<Long> gameIds = new ArrayList<>();

  public void addGame(Long gameId) {
    if (gameIds == null) {
      gameIds = new ArrayList<>();
    }
    if (!gameIds.contains(gameId)) {
      gameIds.add(gameId);
    }
  }

  public void removeGame(Long gameId) {
    if (gameIds != null) {
      gameIds.remove(gameId);
    }
  }

  public boolean hasGame(Long gameId) {
    return gameIds != null && gameIds.contains(gameId);
  }
}