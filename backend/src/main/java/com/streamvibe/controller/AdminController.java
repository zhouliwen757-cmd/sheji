package com.streamvibe.controller;

import com.streamvibe.entity.User;
import com.streamvibe.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    private final UserRepository userRepository;
    
    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    // ========== User Management ==========
    
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> userList = users.stream()
            .map(this::userToMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "users", userList));
    }
    
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUser(@PathVariable @NonNull Long id) {
        return userRepository.findById(id)
            .map(user -> ResponseEntity.ok(Map.of("success", true, "user", userToMap(user))))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable @NonNull Long id, @RequestBody Map<String, String> request) {
        return userRepository.findById(id)
            .map(user -> {
                String role = request.get("role");
                if (!"USER".equals(role) && !"ADMIN".equals(role)) {
                    return ResponseEntity.badRequest().body(Map.of("success", false, "message", "无效的角色"));
                }
                User.Role newRole = "ADMIN".equals(role) ? User.Role.admin : User.Role.user;
                user.setRole(newRole);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("success", true, "message", "角色更新成功"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable @NonNull Long id, @RequestBody Map<String, Boolean> request) {
        return userRepository.findById(id)
            .map(user -> {
                Boolean disabled = request.getOrDefault("disabled", false);
                user.setStatus(disabled ? User.Status.banned : User.Status.active);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("success", true, "message", "状态更新成功"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication authentication) {
        Long currentUserId = Long.parseLong(authentication.getName());
        if (id.equals(currentUserId)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "不能删除自己"));
        }
        
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "用户删除成功"));
        }
        return ResponseEntity.notFound().build();
    }
    
    // ========== Video Management ==========
    
    @GetMapping("/videos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllVideos() {
        // For now return mock data - in real app would have VideoRepository
        return ResponseEntity.ok(Map.of("success", true, "videos", List.of()));
    }
    
    @DeleteMapping("/videos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
        // In real app would call VideoService to delete
        return ResponseEntity.ok(Map.of("success", true, "message", "视频删除成功"));
    }
    
    // ========== Comment Management ==========
    
    @GetMapping("/comments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllComments() {
        // For now return mock data - in real app would have CommentRepository
        return ResponseEntity.ok(Map.of("success", true, "comments", List.of()));
    }
    
    @DeleteMapping("/comments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        // In real app would call CommentService to delete
        return ResponseEntity.ok(Map.of("success", true, "message", "评论删除成功"));
    }
    
    // ========== Dashboard Stats ==========
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStats() {
        long totalUsers = userRepository.count();
        // In real app would get video and comment counts from their repositories
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalVideos", 0);
        stats.put("totalComments", 0);
        stats.put("activeUsers", userRepository.findAll().stream()
            .filter(u -> u.getStatus() != User.Status.banned)
            .count());
        return ResponseEntity.ok(Map.of("success", true, "stats", stats));
    }
    
    private Map<String, Object> userToMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("nickname", user.getNickname());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("avatarUrl", user.getAvatarUrl());
        map.put("role", user.getRole().name());
        map.put("createdAt", user.getCreatedAt());
        return map;
    }
}
