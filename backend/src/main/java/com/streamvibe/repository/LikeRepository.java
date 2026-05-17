package com.streamvibe.repository;

import com.streamvibe.entity.Like;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    Optional<Like> findByUserIdAndVideoId(Long userId, Long videoId);
    
    Optional<Like> findByUserIdAndVideoIdAndType(Long userId, Long videoId, Like.LikeType type);
    
    boolean existsByUserIdAndVideoIdAndType(Long userId, Long videoId, Like.LikeType type);
    
    Page<Like> findByUserId(Long userId, Pageable pageable);
    
    List<Like> findByUserIdAndType(Long userId, Like.LikeType type);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.user.id = :userId AND l.type = 'like'")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(l) FROM Like l WHERE l.video.id = :videoId AND l.type = 'like'")
    Long countByVideoId(@Param("videoId") Long videoId);
    
    void deleteByUserIdAndVideoId(Long userId, Long videoId);
}
