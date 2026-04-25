package com.game.auth.service;


import com.game.auth.dto.GameInfoDTO;
import com.game.auth.dto.GameResponseDTO;
import com.game.auth.entity.Game;
import com.game.auth.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameService {

  @Autowired
  private GameRepository gameRepository;

  public List<GameInfoDTO> getRecentGames(Long userId, int limit) {
    Pageable pageable = PageRequest.of(0, limit);
    Page<Game> games = gameRepository.findByUserIdOrderByIdDesc(userId, pageable);
    return games.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
  }

  public boolean abortActiveGame(Long userId) {
    List<Game> activeGames = gameRepository.findByUserIdAndFinishedFalseOrderByIdDesc(userId);
    if (activeGames.isEmpty()) return false;

    for (Game game : activeGames) {
      game.setFinished(true);
      game.setWinner("model");
      gameRepository.save(game);
    }
    return true;
  }

  public GameResponseDTO getUserGamesPaginated(Long userId, int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    Page<Game> gamesPage = gameRepository.findByUserIdOrderByIdDesc(userId, pageable);
    List<GameInfoDTO> games = gamesPage.getContent().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());

    boolean hasMore = gamesPage.hasNext();

    return new GameResponseDTO(games, hasMore, gamesPage.getTotalElements());
  }

  private GameInfoDTO convertToDTO(Game game) {
    return new GameInfoDTO(
            game.getId(),
            game.getPath(),
            game.getWinner(),
            game.getFinished()
    );
  }
}