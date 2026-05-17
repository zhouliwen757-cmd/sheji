package com.streamvibe.service;

import com.streamvibe.entity.User;
import com.streamvibe.entity.Video;
import com.streamvibe.repository.UserRepository;
import com.streamvibe.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoService {
    
    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Video createVideo(@NonNull Long userId, String title, String description, String videoUrl, 
                            String thumbnailUrl, String duration, Integer durationSeconds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Video video = new Video();
        video.setVideoId(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        video.setTitle(title);
        video.setDescription(description);
        video.setVideoUrl(videoUrl);
        video.setThumbnailUrl(thumbnailUrl);
        video.setDuration(duration);
        video.setDurationSeconds(durationSeconds);
        video.setUser(user);
        video.setStatus(Video.VideoStatus.approved);
        video.setPublishedAt(LocalDateTime.now());
        
        Video saved = videoRepository.save(video);
        
        // 更新用户统计
        user.setVideoCount(user.getVideoCount() + 1);
        userRepository.save(user);
        
        return saved;
    }
    
    public Page<Video> getVideos(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return videoRepository.findByStatusOrderByCreatedAtDesc(Video.VideoStatus.approved, pageable);
    }
    
    public Page<Video> getVideosByUser(@NonNull Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return videoRepository.findByUserId(userId, pageable);
    }
    
    public Page<Video> getVideosByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return videoRepository.findByCategory(category, pageable);
    }
    
    public Page<Video> getHotVideos(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return videoRepository.findHotVideos(pageable);
    }
    
    public Page<Video> searchVideos(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return videoRepository.searchVideos(keyword, pageable);
    }
    
    public Video getVideoById(@NonNull Long id) {
        return Objects.requireNonNull(videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("视频不存在")));
    }
    
    public Video getVideoByVideoId(@NonNull String videoId) {
        return Objects.requireNonNull(videoRepository.findByVideoId(videoId)
                .orElseThrow(() -> new RuntimeException("视频不存在")));
    }
    
    @Transactional
    public Video updateVideo(@NonNull Long videoId, String title, String description, String thumbnailUrl) {
        Video video = getVideoById(videoId);
        if (title != null) video.setTitle(title);
        if (description != null) video.setDescription(description);
        if (thumbnailUrl != null) video.setThumbnailUrl(thumbnailUrl);
        return Objects.requireNonNull(videoRepository.save(video));
    }
    
    @Transactional
    public void deleteVideo(@NonNull Long videoId) {
        Video video = getVideoById(videoId);
        video.setStatus(Video.VideoStatus.deleted);
        video.setDeletedAt(LocalDateTime.now());
        videoRepository.save(video);
    }
    
    @Transactional
    public void incrementViews(@NonNull Long videoId) {
        Video video = getVideoById(videoId);
        video.setViews(video.getViews() + 1);
        videoRepository.save(video);
    }
    
    @Transactional
    public void updateLikeCount(@NonNull Long videoId, int delta) {
        Video video = getVideoById(videoId);
        video.setLikesCount(Math.max(0, video.getLikesCount() + delta));
        videoRepository.save(video);
    }
    
    @Transactional
    public void updateFavoriteCount(@NonNull Long videoId, int delta) {
        Video video = getVideoById(videoId);
        video.setFavoritesCount(Math.max(0, video.getFavoritesCount() + delta));
        videoRepository.save(video);
    }
    
    @Transactional
    public void updateCommentsCount(@NonNull Long videoId, int delta) {
        Video video = getVideoById(videoId);
        video.setCommentsCount(Math.max(0, video.getCommentsCount() + delta));
        videoRepository.save(video);
    }
}
