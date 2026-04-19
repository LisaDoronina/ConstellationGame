package com.game.auth.service;

import com.game.auth.dto.GameInfoDTO;
import com.game.auth.entity.Game;
import com.game.auth.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    List<Game> games = gameRepository.findTop5ByUserIdOrderByIdDesc(userId);
    return games.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
  }

  public List<GameInfoDTO> getUserGamesPaginated(Long userId, int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    List<Game> games = gameRepository.findByUserIdOrderByIdDesc(userId, pageable);
    return games.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
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