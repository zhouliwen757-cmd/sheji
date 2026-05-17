package com.streamvibe.dto;

import lombok.Data;

@Data
public class VideoRequest {
    private String title;
    private String description;
    private String videoUrl;
    private String thumbnailUrl;
    private String duration;
    private Integer durationSeconds;
    private String category;
    private String tags;
}
