package com.game.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

  private final PasswordEncoder passwordEncoder;

  public PasswordService(PasswordEncoder passwordEncoder) {
    this.passwordEncoder = passwordEncoder;
  }

  public String hashPassword(String password) {
    if (password == null || password.isEmpty()) {
      throw new IllegalArgumentException("Password cannot be empty");
    }

    String hash = passwordEncoder.encode(password);
    System.out.println("[PasswordService] Generated password hash");
    return hash;
  }

  public boolean verifyPassword(String password, String storedHash) {
    if (password == null || storedHash == null) {
      return false;
    }

    boolean matches = passwordEncoder.matches(password, storedHash);
    System.out.println("[PasswordService] Password verification result: " + matches);
    return matches;
  }

  public boolean isStrongPassword(String password) {
    return password != null && password.length() >= 6;
  }
}
