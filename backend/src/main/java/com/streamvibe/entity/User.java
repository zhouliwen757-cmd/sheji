package com.streamvibe.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(length = 100)
    private String nickname;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(length = 20)
    private String phone;
    
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender = Gender.secret;
    
    private LocalDate birthday;
    
    @Column(name = "subscribers_count")
    private Integer subscribersCount = 0;
    
    @Column(name = "following_count")
    private Integer followingCount = 0;
    
    @Column(name = "video_count")
    private Integer videoCount = 0;
    
    @Column(name = "total_views")
    private Long totalViews = 0L;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Role role = Role.user;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Status status = Status.active;
    
    @Column(name = "last_login_ip", length = 45)
    private String lastLoginIp;
    
    @Column(name = "last_login_time")
    private LocalDateTime lastLoginTime;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    public enum Gender {
        male, female, other, secret
    }
    
    public enum Role {
        admin, user, vip
    }
    
    public enum Status {
        active, banned, inactive
    }
}
