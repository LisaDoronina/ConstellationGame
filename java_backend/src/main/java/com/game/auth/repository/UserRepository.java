package com.game.auth.repository;

import com.game.auth.entity.User;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class UserRepository {

  private final AtomicLong idGenerator = new AtomicLong(1);

  public User save(User user) {
    if (user.getId() == null) {
      user.setId(idGenerator.getAndIncrement());
    }

    //что-то типа database.save(user);

    return user;
  }

  public Optional<User> findById(Long id) {
    //return Optional.ofNullable(database.getById(id));
    return Optional.empty();
  }

  public Optional<User> getByUsername(String username) {
    //return Optional.ofNullable(database.getByUsername(username));
    return Optional.empty();
  }

  public Optional<User> getByEmail(String email) {
    //return Optional.ofNullable(database.getByEmail(email));
    return Optional.empty();
  }

  public Optional<User> getByUsernameOrEmail(String usernameOrEmail) {
    if (usernameOrEmail.contains("@")) {
      return getByEmail(usernameOrEmail);
    }
    return getByUsername(usernameOrEmail);
  }

  public boolean existsByUsername(String username) {
    if (username == null || username.isEmpty()) {
      return false;
    }
    return getByUsername(username).isPresent();
  }

  public boolean existsByEmail(String email) {
    if (email == null || email.isEmpty()) {
      return false;
    }
    return getByEmail(email).isPresent();
  }

  public List<User> getAllUsers() {
    return new ArrayList<>();
  }

  public void deleteById(Long id) {
    //User user = database.remove(id);
  }
}