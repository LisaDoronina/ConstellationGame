package com.game.auth.repository;

import com.game.auth.entity.User;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class UserRepository {

  private final Map<Long, User> userStore = new ConcurrentHashMap<>();
  private final Map<String, User> usernameIndex = new ConcurrentHashMap<>();
  private final AtomicLong idGenerator = new AtomicLong(1);

  public User save(User user) {
    if (user.getId() == null) {
      user.setId(idGenerator.getAndIncrement());
    }

    userStore.put(user.getId(), user);
    usernameIndex.put(user.getUsername(), user);

    System.out.println("[UserRepository] Saved user: " + user.getUsername() + " with ID: " + user.getId());
    System.out.println("[UserRepository] Total users: " + userStore.size());

    return user;
  }

  public Optional<User> findById(Long id) {
    User user = userStore.get(id);
    if (user != null) {
      System.out.println("[UserRepository] Found user by ID: " + id + " - " + user.getUsername());
    } else {
      System.out.println("[UserRepository] No user found with ID: " + id);
    }
    return Optional.ofNullable(user);
  }

  public Optional<User> getByUsername(String username) {
    User user = usernameIndex.get(username);
    if (user != null) {
      System.out.println("[UserRepository] Found user by username: " + username);
    } else {
      System.out.println("[UserRepository] No user found with username: " + username);
    }
    return Optional.ofNullable(user);
  }

  public boolean existsByUsername(String username) {
    if (username == null || username.isEmpty()) {
      return false;
    }
    boolean exists = usernameIndex.containsKey(username);
    System.out.println("[UserRepository] Username exists check for '" + username + "': " + exists);
    return exists;
  }


  public List<User> getAllUsers() {
    List<User> users = new ArrayList<>(userStore.values());
    System.out.println("[UserRepository] Returning all users, count: " + users.size());
    return users;
  }

  public void deleteById(Long id) {
    User user = userStore.remove(id);
    if (user != null) {
      usernameIndex.remove(user.getUsername());

      System.out.println("[UserRepository] Deleted user: " + user.getUsername());
    }
  }
}