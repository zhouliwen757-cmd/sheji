package com.streamvibe.service;

import com.streamvibe.dto.*;
import com.streamvibe.entity.User;
import com.streamvibe.repository.UserRepository;
import jakarta.annotation.Nonnull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@SuppressWarnings("all")
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(false, "用户名已被注册", null, null);
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(false, "邮箱已被注册", null, null);
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        
        User savedUser = userRepository.save(user);
        
        return new AuthResponse(true, "注册成功", null, toUserResponse(savedUser));
    }
    
    public AuthResponse login(LoginRequest request) {
        // 支持邮箱或用户名登录
        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> userRepository.findByUsername(request.getEmail()).orElse(null));
        
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse(false, "账号或密码错误", null, null);
        }
        
        return new AuthResponse(true, "登录成功", null, toUserResponse(user));
    }
    
    public UserResponse getUserById(@Nonnull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return toUserResponse(user);
    }
    
    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null,
                user.getRole()
        );
    }
}
