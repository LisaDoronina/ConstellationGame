package com.game.auth.repository;

import com.game.auth.entity.Game;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GameRepository extends JpaRepository<Game, Long> {

  List<Game> findTop5ByUserIdOrderByIdDesc(Long userId);

  List<Game> findByUserIdOrderByIdDesc(Long userId, Pageable pageable);
}