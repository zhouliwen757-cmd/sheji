package com.streamvibe.controller;

import com.streamvibe.dto.ApiResponse;
import com.streamvibe.entity.Favorite;
import com.streamvibe.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    
    private final FavoriteService favoriteService;
    
    @PostMapping("/video/{videoId}")
    public ResponseEntity<ApiResponse<Boolean>> toggleFavorite(@PathVariable @NonNull Long videoId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        boolean favorited = favoriteService.toggleFavorite(userId, videoId);
        return ResponseEntity.ok(ApiResponse.success(favorited ? "收藏成功" : "取消收藏", favorited));
    }
    
    @GetMapping("/video/{videoId}/check")
    public ResponseEntity<ApiResponse<Boolean>> checkFavorite(@PathVariable @NonNull Long videoId, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        boolean favorited = favoriteService.isFavorited(userId, videoId);
        return ResponseEntity.ok(ApiResponse.success(favorited));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Favorite>>> getFavorites(
            @RequestParam @NonNull Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Favorite> favorites = favoriteService.getFavorites(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(favorites));
    }
}
