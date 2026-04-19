package com.game.auth.repository;

import com.game.auth.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

  @Autowired
  private UserJpaRepository jpaRepository;

  public User save(User user) {
    System.out.println("[UserRepository] Saving user: " + user.getUsername());
    return jpaRepository.save(user);
  }

  public Optional<User> findById(Long id) {
    Optional<User> user = jpaRepository.findById(id);
    user.ifPresent(u -> System.out.println("[UserRepository] Found user by ID: " + id + " - " + u.getUsername()));
    if (user.isEmpty()) {
      System.out.println("[UserRepository] No user found with ID: " + id);
    }
    return user;
  }

  public Optional<User> getByUsername(String username) {
    Optional<User> user = jpaRepository.findByUsername(username);
    user.ifPresent(u -> System.out.println("[UserRepository] Found user by username: " + username));
    if (user.isEmpty()) {
      System.out.println("[UserRepository] No user found with username: " + username);
    }
    return user;
  }

  public boolean existsByUsername(String username) {
    if (username == null || username.isEmpty()) {
      return false;
    }
    boolean exists = jpaRepository.existsByUsername(username);
    System.out.println("[UserRepository] Username exists check for '" + username + "': " + exists);
    return exists;
  }

  public List<User> getAllUsers() {
    List<User> users = jpaRepository.findAll();
    System.out.println("[UserRepository] Returning all users, count: " + users.size());
    return users;
  }

  public void deleteById(Long id) {
    System.out.println("[UserRepository] Deleting user with ID: " + id);
    jpaRepository.deleteById(id);
  }

}