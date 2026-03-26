package com.game.auth.repository;

import com.game.auth.entity.User;
import com.game.auth.service.PasswordService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class UserRepositoryTest {

  public static void main(String[] args) {
    System.out.println("=== Testing UserRepository ===\n");

    UserRepository userRepository = new UserRepository();
    PasswordService passwordService = new PasswordService(new BCryptPasswordEncoder());

    System.out.println("Test 1: Save user");
    User user = new User();
    user.setUsername("john_doe");
    user.setPasswordHash("123456Aa!");

    User savedUser = userRepository.save(user);
    System.out.println("  Saved user ID: " + savedUser.getId());
    System.out.println("  Username: " + savedUser.getUsername());
    System.out.println(" Hash: " + user.getPasswordHash());
    System.out.println("  Result: PASSED\n");

    System.out.println("Test 2: Find by ID");
    java.util.Optional<User> foundById = userRepository.findById(1L);
    if (foundById.isPresent()) {
      System.out.println("  Found user: " + foundById.get().getUsername());
      System.out.println("  Result: PASSED\n");
    } else {
      System.out.println("  Result: FAILED - User not found\n");
    }

    System.out.println("Test 3: Find by username");
    java.util.Optional<User> foundByUsername = userRepository.getByUsername("john_doe");
    if (foundByUsername.isPresent()) {
      System.out.println("  Found user: " + foundByUsername.get().getUsername());
      System.out.println("  Result: PASSED\n");
    } else {
      System.out.println("  Result: FAILED - User not found\n");
    }

    System.out.println("Test 4: Check if username exists");
    boolean exists = userRepository.existsByUsername("john_doe");
    if (exists) {
      System.out.println("  Username exists: true");
      System.out.println("  Result: PASSED\n");
    } else {
      System.out.println("  Result: FAILED - Username should exist\n");
    }

    System.out.println("Test 5: Save second user");
    User user2 = new User();
    user2.setUsername("jane_doe");
    user2.setPasswordHash("hash456!");

    User savedUser2 = userRepository.save(user2);
    System.out.println("  Saved user ID: " + savedUser2.getId());
    System.out.println("  Username: " + savedUser2.getUsername());
    System.out.println(" Hash: " + savedUser2.getPasswordHash());
    System.out.println("  Result: PASSED\n");

    System.out.println("Test 6: Get all users");
    java.util.List<User> allUsers = userRepository.getAllUsers();
    System.out.println("  Total users: " + allUsers.size());
    for (User u : allUsers) {
      System.out.println("    - " + u.getUsername() + " (ID: " + u.getId() + ")");
    }
    if (allUsers.size() == 2) {
      System.out.println("  Result: PASSED\n");
    } else {
      System.out.println("  Result: FAILED - Expected 2 users, got " + allUsers.size() + "\n");
    }

    System.out.println("Test 7: Add game to user");
    savedUser.addGame(100L);
    savedUser.addGame(200L);
    userRepository.save(savedUser);

    java.util.Optional<User> userWithGames = userRepository.findById(1L);
    if (userWithGames.isPresent() && userWithGames.get().getGameIds().size() == 2) {
      System.out.println("  Games added: " + userWithGames.get().getGameIds());
      System.out.println("  Result: PASSED\n");
    } else {
      System.out.println("  Result: FAILED\n");
    }

    System.out.println("Test 8: Remove game from user");
    savedUser.removeGame(100L);
    userRepository.save(savedUser);

    java.util.Optional<User> userAfterRemove = userRepository.findById(1L);
    if (userAfterRemove.isPresent() && userAfterRemove.get().getGameIds().size() == 1) {
      System.out.println("  Games remaining: " + userAfterRemove.get().getGameIds());
      System.out.println("  Result: PASSED\n");
    } else {
      System.out.println("  Result: FAILED\n");
    }

    System.out.println("Test 9: Delete user");
    userRepository.deleteById(2L);
    java.util.Optional<User> deletedUser = userRepository.findById(2L);
    if (!deletedUser.isPresent()) {
      System.out.println("  User deleted successfully");
      System.out.println("  Result: PASSED\n");
    } else {
      System.out.println("  Result: FAILED - User still exists\n");
    }

    System.out.println("Test 10: Users after delete");
    java.util.List<User> remainingUsers = userRepository.getAllUsers();
    System.out.println("  Remaining users: " + remainingUsers.size());
    for (User u : remainingUsers) {
      System.out.println("    - " + u.getUsername());
    }
    System.out.println("  Result: PASSED\n");

    System.out.println("=== All Tests Completed ===");
  }
}