package com.streamvibe.controller;

import com.streamvibe.dto.ApiResponse;
import com.streamvibe.dto.PageResponse;
import com.streamvibe.entity.User;
import com.streamvibe.entity.Video;
import com.streamvibe.entity.Comment;
import com.streamvibe.repository.UserRepository;
import com.streamvibe.service.VideoService;
import com.streamvibe.service.CommentService;
import com.streamvibe.service.LikeService;
import com.streamvibe.service.FavoriteService;
import com.streamvibe.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserRepository userRepository;
    private final VideoService videoService;
    private final CommentService commentService;
    private final LikeService likeService;
    private final FavoriteService favoriteService;
    private final SubscriptionService subscriptionService;
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable @NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        // 隐藏敏感信息
        user.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @GetMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserProfile(@PathVariable @NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setPassword(null);
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("user", user);
        profile.put("videosCount", user.getVideoCount());
        profile.put("subscribersCount", user.getSubscribersCount());
        profile.put("followingCount", user.getFollowingCount());
        profile.put("totalViews", user.getTotalViews());
        profile.put("likesCount", likeService.getLikesCountByUser(id));
        profile.put("favoritesCount", favoriteService.getFavoritesCount(id));
        
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
    
    @GetMapping("/{id}/videos")
    public ResponseEntity<ApiResponse<PageResponse<Video>>> getUserVideos(
            @PathVariable @NonNull Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Video> videos = videoService.getVideosByUser(id, page, size);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(videos)));
    }
    
    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<PageResponse<Comment>>> getUserComments(
            @PathVariable @NonNull Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Comment> comments = commentService.getCommentsByUser(id, page, size);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(comments)));
    }
    
    @GetMapping("/{id}/subscribers")
    public ResponseEntity<ApiResponse<Long>> getSubscribersCount(@PathVariable @NonNull Long id) {
        Long count = subscriptionService.getSubscribersCount(id);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
