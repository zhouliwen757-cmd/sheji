package com.streamvibe.service;

import com.streamvibe.entity.Favorite;
import com.streamvibe.entity.User;
import com.streamvibe.entity.Video;
import com.streamvibe.repository.FavoriteRepository;
import com.streamvibe.repository.UserRepository;
import com.streamvibe.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    
    private final FavoriteRepository favoriteRepository;
    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final VideoService videoService;
    
    @Transactional
    public boolean toggleFavorite(@NonNull Long userId, @NonNull Long videoId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("视频不存在"));
        
        return favoriteRepository.findByUserIdAndVideoId(userId, videoId)
            .map(fav -> {
                favoriteRepository.delete(Objects.requireNonNull(fav));
                videoService.updateFavoriteCount(videoId, -1);
                return false;
            })
            .orElseGet(() -> {
                Favorite favorite = new Favorite();
                favorite.setUser(user);
                favorite.setVideo(video);
                favoriteRepository.save(favorite);
                videoService.updateFavoriteCount(videoId, 1);
                return true;
            });
    }
    
    public boolean isFavorited(@NonNull Long userId, @NonNull Long videoId) {
        return favoriteRepository.existsByUserIdAndVideoId(userId, videoId);
    }
    
    public Page<Favorite> getFavorites(@NonNull Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
    
    public List<Video> getFavoriteVideos(@NonNull Long userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 100))
                .getContent()
                .stream()
                .map(Favorite::getVideo)
                .toList();
    }
    
    public Long getFavoritesCount(@NonNull Long userId) {
        return favoriteRepository.countByUserId(userId);
    }
}
