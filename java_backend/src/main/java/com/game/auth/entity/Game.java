package com.game.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "games")
public class Game {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "userid")
  private Long userId;

  private String path;

  private String winner;

  private Boolean finished = false;

  public Game() {}

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public Long getUserId() { return userId; }
  public void setUserId(Long userId) { this.userId = userId; }

  public String getPath() { return path; }
  public void setPath(String path) { this.path = path; }

  public String getWinner() { return winner; }
  public void setWinner(String winner) { this.winner = winner; }

  public Boolean getFinished() { return finished; }
  public void setFinished(Boolean finished) { this.finished = finished; }
}