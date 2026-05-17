package com.streamvibe.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoResponse {
    private Long id;
    private String videoId;
    private String title;
    private String description;
    private String videoUrl;
    private String thumbnailUrl;
    private String duration;
    private Integer durationSeconds;
    private Integer views;
    private Integer likesCount;
    private Integer favoritesCount;
    private Integer commentsCount;
    private String category;
    private String tags;
    private Long userId;
    private String username;
    private String userNickname;
    private String userAvatar;
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;
}
