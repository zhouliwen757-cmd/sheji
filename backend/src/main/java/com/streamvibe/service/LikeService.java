package com.streamvibe.service;

import com.streamvibe.entity.Like;
import com.streamvibe.entity.User;
import com.streamvibe.entity.Video;
import com.streamvibe.repository.LikeRepository;
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
public class LikeService {
    
    private final LikeRepository likeRepository;
    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final VideoService videoService;
    
    @Transactional
    public boolean toggleLike(@NonNull Long userId, @NonNull Long videoId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("视频不存在"));
        
        var existingLike = likeRepository.findByUserIdAndVideoIdAndType(userId, videoId, Like.LikeType.like);
        
        return existingLike
            .map(like -> {
                likeRepository.delete(Objects.requireNonNull(like));
                videoService.updateLikeCount(videoId, -1);
                return false;
            })
            .orElseGet(() -> {
                Like like = new Like();
                like.setUser(user);
                like.setVideo(video);
                like.setType(Like.LikeType.like);
                likeRepository.save(like);
                videoService.updateLikeCount(videoId, 1);
                return true;
            });
    }
    
    public boolean isLiked(Long userId, Long videoId) {
        return likeRepository.existsByUserIdAndVideoIdAndType(userId, videoId, Like.LikeType.like);
    }
    
    public Page<Video> getLikedVideos(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Like> likes = likeRepository.findByUserId(userId, pageable);
        return likes.map(Like::getVideo);
    }
    
    public List<Video> getLikedVideosList(Long userId) {
        List<Like> likes = likeRepository.findByUserIdAndType(userId, Like.LikeType.like);
        return likes.stream().map(Like::getVideo).toList();
    }
    
    public Long getLikesCountByUser(Long userId) {
        return likeRepository.countByUserId(userId);
    }
    
    public Long getLikesCountByVideo(Long videoId) {
        return likeRepository.countByVideoId(videoId);
    }
}
