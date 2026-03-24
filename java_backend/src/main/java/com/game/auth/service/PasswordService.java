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
    if (password == null || password.length() < 8) {
      return false;
    }

    boolean hasUpper = false;
    boolean hasLower = false;
    boolean hasDigit = false;
    boolean hasSpecial = false;

    for (char c : password.toCharArray()) {
      if (Character.isUpperCase(c)) hasUpper = true;
      else if (Character.isLowerCase(c)) hasLower = true;
      else if (Character.isDigit(c)) hasDigit = true;
      else hasSpecial = true;
    }

    return hasUpper && hasLower && hasDigit && hasSpecial;
  }
}