package com.streamvibe.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "videos")
public class Video {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "video_id", nullable = false, unique = true, length = 32)
    private String videoId;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "video_url", nullable = false, length = 500)
    private String videoUrl;
    
    @Column(name = "video_path", length = 500)
    private String videoPath;
    
    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;
    
    @Column(name = "thumbnail_path", length = 500)
    private String thumbnailPath;
    
    @Column(length = 20)
    private String duration;
    
    @Column(name = "duration_seconds")
    private Integer durationSeconds = 0;
    
    @Column(name = "file_size")
    private Long fileSize = 0L;
    
    private Integer width = 0;
    
    private Integer height = 0;
    
    @Column(length = 20)
    private String quality = "1080P";
    
    @Column(length = 50)
    private String codec;
    
    @Column(length = 50)
    private String category;
    
    @Column(columnDefinition = "JSON")
    private String tags;
    
    private Integer views = 0;
    
    @Column(name = "likes_count")
    private Integer likesCount = 0;
    
    @Column(name = "favorites_count")
    private Integer favoritesCount = 0;
    
    @Column(name = "comments_count")
    private Integer commentsCount = 0;
    
    @Column(name = "shares_count")
    private Integer sharesCount = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private VideoStatus status = VideoStatus.approved;
    
    @Column(name = "review_time")
    private LocalDateTime reviewTime;
    
    @Column(name = "review_reason", length = 255)
    private String reviewReason;
    
    private Integer weight = 0;
    
    @Column(name = "hot_score")
    private Double hotScore = 0.0;
    
    @Column(name = "allow_download")
    private Boolean allowDownload = true;
    
    @Column(name = "allow_share")
    private Boolean allowShare = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    public enum VideoStatus {
        pending, approved, rejected, deleted
    }
}
