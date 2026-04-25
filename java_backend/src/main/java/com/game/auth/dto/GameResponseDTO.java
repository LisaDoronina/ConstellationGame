package com.game.auth.dto;

import java.util.List;

public class GameResponseDTO {
  private List<GameInfoDTO> games;
  private boolean hasMore;
  private long totalCount;

  public GameResponseDTO(List<GameInfoDTO> games, boolean hasMore, long totalCount) {
    this.games = games;
    this.hasMore = hasMore;
    this.totalCount = totalCount;
  }

  public List<GameInfoDTO> getGames() { return games; }
  public boolean isHasMore() { return hasMore; }
  public long getTotalCount() { return totalCount; }
}