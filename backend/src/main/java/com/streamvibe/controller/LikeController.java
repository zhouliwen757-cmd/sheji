package com.streamvibe.controller;

import com.streamvibe.dto.ApiResponse;
import com.streamvibe.entity.Video;
import com.streamvibe.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {
    
    private final LikeService likeService;
    
    @PostMapping("/video/{videoId}")
    public ResponseEntity<ApiResponse<Boolean>> toggleLike(@PathVariable @NonNull Long videoId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        boolean liked = likeService.toggleLike(userId, videoId);
        return ResponseEntity.ok(ApiResponse.success(liked ? "点赞成功" : "取消点赞", liked));
    }
    
    @GetMapping("/video/{videoId}/check")
    public ResponseEntity<ApiResponse<Boolean>> checkLike(@PathVariable @NonNull Long videoId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        boolean liked = likeService.isLiked(userId, videoId);
        return ResponseEntity.ok(ApiResponse.success(liked));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Video>>> getLikedVideos(
            @RequestParam @NonNull Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Video> videos = likeService.getLikedVideos(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(videos));
    }
    
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getLikesCount(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long videoId) {
        Long count = 0L;
        if (userId != null) {
            count = likeService.getLikesCountByUser(userId);
        } else if (videoId != null) {
            count = likeService.getLikesCountByVideo(videoId);
        }
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
