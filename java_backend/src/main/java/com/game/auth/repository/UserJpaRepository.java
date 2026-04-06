package com.game.auth.repository;

import com.game.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserJpaRepository extends JpaRepository<User, Long> {

  Optional<User> findByUsername(String username);

  boolean existsByUsername(String username);

  @Query(value = "SELECT EXISTS(SELECT 1 FROM users WHERE username = :username AND :gameId = ANY(game_ids))", nativeQuery = true)
  boolean hasGame(@Param("username") String username, @Param("gameId") Long gameId);
}