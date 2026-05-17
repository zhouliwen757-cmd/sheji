package com.streamvibe.controller;

import com.streamvibe.config.JwtTokenProvider;
import com.streamvibe.dto.*;
import com.streamvibe.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    
    public AuthController(UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.register(request);
        
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", response.getMessage()
            ));
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", response.getMessage(),
            "user", response.getUser()
        ));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        
        if (!response.isSuccess()) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", response.getMessage()
            ));
        }
        
        // Generate JWT token
        String token = jwtTokenProvider.generateToken(
                response.getUser().getId(),
                response.getUser().getEmail(),
                response.getUser().getRole()
        );
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", response.getMessage(),
            "token", token,
            "user", response.getUser()
        ));
    }
}
