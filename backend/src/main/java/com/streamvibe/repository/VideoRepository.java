package com.streamvibe.repository;

import com.streamvibe.entity.Video;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    
    Optional<Video> findByVideoId(String videoId);
    
    Page<Video> findByUserId(Long userId, Pageable pageable);
    
    Page<Video> findByUserIdAndStatus(Long userId, Video.VideoStatus status, Pageable pageable);
    
    Page<Video> findByStatusOrderByCreatedAtDesc(Video.VideoStatus status, Pageable pageable);
    
    @Query("SELECT v FROM Video v WHERE v.status = 'approved' ORDER BY v.views DESC")
    Page<Video> findHotVideos(Pageable pageable);
    
    @Query("SELECT v FROM Video v WHERE v.status = 'approved' AND v.category = :category ORDER BY v.createdAt DESC")
    Page<Video> findByCategory(@Param("category") String category, Pageable pageable);
    
    @Query("SELECT v FROM Video v WHERE v.status = 'approved' AND (v.title LIKE %:keyword% OR v.description LIKE %:keyword%) ORDER BY v.createdAt DESC")
    Page<Video> searchVideos(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT v FROM Video v JOIN v.user u WHERE v.status = 'approved' AND u.username = :username ORDER BY v.createdAt DESC")
    Page<Video> findByUploader(@Param("username") String username, Pageable pageable);
    
    List<Video> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT COUNT(v) FROM Video v WHERE v.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COALESCE(SUM(v.views), 0) FROM Video v WHERE v.user.id = :userId")
    Long sumViewsByUserId(@Param("userId") Long userId);
}
