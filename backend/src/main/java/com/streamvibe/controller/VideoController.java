package com.streamvibe.controller;

import com.streamvibe.dto.ApiResponse;
import com.streamvibe.dto.VideoRequest;
import com.streamvibe.entity.Video;
import com.streamvibe.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {
    
    private final VideoService videoService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Video>>> getVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q) {
        
        Page<Video> videos;
        if (q != null && !q.isEmpty()) {
            videos = videoService.searchVideos(q, page, size);
        } else if (category != null && !category.isEmpty()) {
            videos = videoService.getVideosByCategory(category, page, size);
        } else {
            videos = videoService.getVideos(page, size);
        }
        
        return ResponseEntity.ok(ApiResponse.success(videos));
    }
    
    @GetMapping("/hot")
    public ResponseEntity<ApiResponse<Page<Video>>> getHotVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Video> videos = videoService.getHotVideos(page, size);
        return ResponseEntity.ok(ApiResponse.success(videos));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Video>> getVideo(@PathVariable @NonNull Long id) {
        Video video = videoService.getVideoById(id);
        videoService.incrementViews(id);
        return ResponseEntity.ok(ApiResponse.success(video));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<Video>>> getVideosByUser(
            @PathVariable @NonNull Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Video> videos = videoService.getVideosByUser(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(videos));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Video>> createVideo(
            @RequestBody VideoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        Video video = videoService.createVideo(
            userId,
            request.getTitle(),
            request.getDescription(),
            request.getVideoUrl(),
            request.getThumbnailUrl(),
            request.getDuration(),
            request.getDurationSeconds()
        );
        return ResponseEntity.ok(ApiResponse.success("视频创建成功", video));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Video>> updateVideo(
            @PathVariable @NonNull Long id,
            @RequestBody VideoRequest request) {
        Video video = videoService.updateVideo(id, request.getTitle(), 
            request.getDescription(), request.getThumbnailUrl());
        return ResponseEntity.ok(ApiResponse.success("视频更新成功", video));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(@PathVariable @NonNull Long id) {
        videoService.deleteVideo(id);
        return ResponseEntity.ok(ApiResponse.success("视频删除成功"));
    }
}
