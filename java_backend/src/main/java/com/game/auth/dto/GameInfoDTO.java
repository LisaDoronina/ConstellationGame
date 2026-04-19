package com.game.auth.dto;

public class GameInfoDTO {
  private Long id;
  private String path;
  private String winner;
  private Boolean finished;

  public GameInfoDTO(Long id, String path, String winner, Boolean finished) {
    this.id = id;
    this.path = path;
    this.winner = winner;
    this.finished = finished;
  }

  public Long getId() { return id; }
  public String getPath() { return path; }
  public String getWinner() { return winner; }
  public Boolean getFinished() { return finished; }
}