package com.game.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

  @GetMapping("/")
  public Map<String, Object> home() {
    Map<String, Object> response = new HashMap<>();
    response.put("service", "Authentication Service");
    response.put("status", "Running");
    response.put("message", "Welcome to the Authentication Service");
    return response;
  }

  @GetMapping("/health")
  public Map<String, String> health() {
    Map<String, String> response = new HashMap<>();
    response.put("status", "UP");
    response.put("message", "Service is healthy");
    return response;
  }

  @GetMapping("/test")
  public String test() {
    return "Authentication service is working!";
  }
}